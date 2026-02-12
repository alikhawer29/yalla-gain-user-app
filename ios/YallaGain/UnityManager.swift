import UIKit
import Foundation
import ObjectiveC

/// Singleton manager for Unity Framework lifecycle
/// Unity must be started ONCE at the app level, not from individual views
final class UnityManager {
    
    static let shared = UnityManager()
    
    private var ufw: AnyObject? // UnityFramework instance
    private var started = false
    private var isPaused = false // Unity starts running after runEmbedded, we pause it after
    private var activeViewCount = 0 // Track how many views are displaying Unity
    private let lockQueue = DispatchQueue(label: "com.yallagain.unity.manager")
    /// Handler for messages from Unity → RN. Set by the active Unity view. Called on main queue.
    private var unityMessageHandler: ((String, String?) -> Void)?
    
    private init() {
        // Private initializer for singleton
        
        // Listen for app lifecycle events
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appWillResignActive),
            name: UIApplication.willResignActiveNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
    }
    
    @objc private func appWillResignActive() {
        // Pause Unity when app goes to background
        pauseUnity()
    }
    
    @objc private func appDidBecomeActive() {
        // Resume Unity only if there are active views
        if activeViewCount > 0 {
            resumeUnity()
        }
    }
    
    /// Start Unity Framework if not already started (app-level, call once).
    /// Optionally pass a completion called when Unity has finished starting and is ready to embed.
    func startUnityIfNeeded(completion: (() -> Void)? = nil) {
        var alreadyStarted = false
        lockQueue.sync {
            guard !started else {
                alreadyStarted = true
                return
            }
            started = true
        }
        if alreadyStarted {
            print("ℹ️ Unity already started, skipping")
            completion?()
            return
        }
        
        // Delay so React Native / app UI is ready
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            self?.startUnity(completion: completion)
        }
    }
    
    private func startUnity(completion: (() -> Void)? = nil) {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in
                self?.startUnity(completion: completion)
            }
            return
        }
        
        // Framework path: unity/builds/ios/UnityFramework (try .framework suffix then plain name)
        let frameworksDir = Bundle.main.bundlePath + "/Frameworks"
        let bundlePathWithExt = frameworksDir + "/UnityFramework.framework"
        let bundlePathPlain = frameworksDir + "/UnityFramework"
        let bundle = Bundle(path: bundlePathWithExt) ?? Bundle(path: bundlePathPlain)
        guard let bundle = bundle else {
            print("❌ UnityFramework bundle not found at: \(bundlePathWithExt) or \(bundlePathPlain)")
            return
        }
        
        // Load bundle if not already loaded
        if !bundle.isLoaded {
            let loaded = bundle.load()
            print("📦 UnityFramework bundle load result: \(loaded)")
            if !loaded {
                print("⚠️ Failed to load UnityFramework bundle")
                return
            }
        }
        
        // Get UnityFramework instance using Objective-C runtime
        guard let ufwClass = bundle.principalClass as? NSObject.Type else {
            print("❌ Failed to get UnityFramework class")
            return
        }
        
        // Attempt to get UnityFramework instance
        if let ufwObjCClass = NSClassFromString("UnityFramework") {
            let selector = NSSelectorFromString("getInstance")
            let cls: AnyClass = ufwObjCClass
            if cls.responds(to: selector) {
                if let method = class_getClassMethod(cls, selector) {
                    let imp = method_getImplementation(method)
                    typealias GetInstanceMethod = @convention(c) (AnyClass, Selector) -> Unmanaged<AnyObject>?
                    let getInstanceMethod = unsafeBitCast(imp, to: GetInstanceMethod.self)
                    let result = getInstanceMethod(cls, selector)
                    if let instance = result?.takeUnretainedValue() as? NSObject {
                        self.ufw = instance
                    } else {
                        // Fallback
                        self.ufw = ufwClass.init()
                    }
                } else {
                    // Fallback
                    self.ufw = ufwClass.init()
                }
            } else {
                // Fallback
                self.ufw = ufwClass.init()
            }
        }
        
        guard let ufw = self.ufw else {
            print("❌ Failed to get UnityFramework instance")
            return
        }
        
        print("✅ UnityFramework instance obtained")
        
        // Data path: main app bundle (where Xcode "Copy Unity Data Folder" puts it)
        let appBundlePath = Bundle.main.bundlePath
        let appBundleDataPath = appBundlePath + "/Data"
        let frameworkBundlePath = bundle.bundlePath
        let frameworkDataPath = frameworkBundlePath + "/Data"
        
        let fileManager = FileManager.default
        let dataPath: String
        if fileManager.fileExists(atPath: appBundleDataPath) {
            dataPath = appBundleDataPath
            print("📁 Using Unity Data from main app bundle: \(dataPath)")
        } else if fileManager.fileExists(atPath: frameworkDataPath) {
            dataPath = frameworkDataPath
            print("📁 Using Unity Data from framework: \(dataPath)")
        } else {
            print("❌ Unity Data folder not found at main or framework path")
            return
        }
        
        // setDataBundleId expects (const char*) — use C string like Unity uaal-example
        if let appBundleId = Bundle.main.bundleIdentifier, !appBundleId.isEmpty {
            print("📦 Set Unity data bundle ID to main app: \(appBundleId)")
            appBundleId.withCString { YallaGainUnitySetDataBundleId(ufw, $0) }
        }
        if ufw.responds(to: NSSelectorFromString("setFrameworkBundlePath:")) {
            ufw.perform(NSSelectorFromString("setFrameworkBundlePath:"), with: frameworkBundlePath)
        }
        
        // Required before runEmbedded (Unity docs + uaal-example) — avoids EXC_BAD_ACCESS in init
        YallaGainUnitySetExecuteHeader(ufw)
        
        // Never pass null/empty argv - UnityInitApplicationNoGraphics can crash
        var args = ProcessInfo.processInfo.arguments
        if args.isEmpty { args = [ProcessInfo.processInfo.processName] }
        if args[0].isEmpty { args[0] = "Unity" }
        let argc = Int32(args.count)
        
        var appLaunchOpts: [String: Any] = ["unity_data_path": dataPath]
        
        // Get the runEmbedded method
        if ufw.responds(to: NSSelectorFromString("runEmbeddedWithArgc:argv:appLaunchOpts:")) {
            var cStringArgs: [UnsafeMutablePointer<CChar>?] = args.map { strdup($0) }
            cStringArgs.append(nil)
            
            defer {
                for ptr in cStringArgs where ptr != nil { free(ptr) }
            }
            
            guard let baseAddress = cStringArgs.withUnsafeMutableBufferPointer({ $0.baseAddress }),
                  baseAddress.pointee != nil else {
                print("❌ Invalid argv for Unity runEmbedded")
                return
            }
            
            let selector = NSSelectorFromString("runEmbeddedWithArgc:argv:appLaunchOpts:")
            let imp = ufw.method(for: selector)
            typealias RunEmbedded = @convention(c) (AnyObject, Selector, Int32, UnsafeMutablePointer<UnsafeMutablePointer<CChar>?>, NSDictionary?) -> Void
            let runEmbedded = unsafeBitCast(imp, to: RunEmbedded.self)
            let launchOpts = appLaunchOpts as NSDictionary
            
            print("📞 Calling Unity runEmbedded (app-level)...")
            runEmbedded(ufw, selector, argc, baseAddress, launchOpts)
            print("✅ Unity runEmbedded completed")
            completion?()
            
            // Pause Unity immediately; resume when a view registers
            // Unity starts rendering immediately after runEmbedded, which blocks the main thread
            // We MUST pause it right away, then resume only when a view explicitly requests it
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
                guard let self = self else { return }
                print("⏸️ Pausing Unity immediately after init")
                self.pauseUnityImmediate()
                
                // Now check if any views are waiting - if so, resume after a brief delay
                // This ensures Unity is fully initialized before resuming
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
                    guard let self = self else { return }
                    let count = self.lockQueue.sync { self.activeViewCount }
                    if count > 0 {
                        print("▶️ Resuming Unity for \(count) active view(s)")
                        self.resumeUnity()
                    }
                }
            }
        } else {
            completion?()
        }
    }
    
    /// Pause Unity immediately (internal use, synchronous)
    private func pauseUnityImmediate() {
        guard let framework = lockQueue.sync(execute: { ufw }) else { return }
        
        // Pause synchronously on main thread to ensure it happens immediately
        if Thread.isMainThread {
            if framework.responds(to: NSSelectorFromString("pause:")) {
                framework.perform(NSSelectorFromString("pause:"), with: true)
                lockQueue.sync { isPaused = true }
                print("⏸️ Unity paused (immediate)")
            }
            // Also hide the Unity view to reduce rendering work
            hideUnityView()
        } else {
            DispatchQueue.main.sync { [weak self] in
                guard let self = self else { return }
                if framework.responds(to: NSSelectorFromString("pause:")) {
                    framework.perform(NSSelectorFromString("pause:"), with: true)
                    self.lockQueue.sync { self.isPaused = true }
                    print("⏸️ Unity paused (immediate)")
                }
                self.hideUnityView()
            }
        }
    }
    
    /// Hide Unity view to reduce rendering work
    private func hideUnityView() {
        if let rootView = getRootView() {
            rootView.isHidden = true
        }
    }
    
    /// Show Unity view
    private func showUnityView() {
        if let rootView = getRootView() {
            rootView.isHidden = false
        }
    }
    
    /// Get Unity's root view for embedding
    /// Returns nil if Unity is not started yet
    func getRootView() -> UIView? {
        guard let framework = lockQueue.sync(execute: { ufw }) else { return nil }
        
        if let appController = framework.perform(NSSelectorFromString("appController"))?.takeUnretainedValue() {
            if let rootView = (appController as AnyObject).perform(NSSelectorFromString("rootView"))?.takeUnretainedValue() as? UIView {
                return rootView
            }
        }
        return nil
    }
    
    /// Get UnityFramework instance (for messaging)
    var unityFramework: AnyObject? {
        return lockQueue.sync(execute: { ufw })
    }
    
    /// Check if Unity is started
    var isStarted: Bool {
        return lockQueue.sync { started }
    }
    
    // MARK: - View Registration (for pause/resume management)
    
    /// Call when a Unity view becomes visible
    func registerActiveView() {
        let wasZero: Bool = lockQueue.sync {
            let wasZeroLocal = (activeViewCount == 0)
            activeViewCount += 1
            print("📊 Unity active views: \(activeViewCount)")
            return wasZeroLocal
        }
        
        // Resume Unity if this is the first active view AND Unity is already started
        // If Unity isn't started yet, it will be paused after init and then resumed
        if wasZero && started {
            // Wait a moment to ensure Unity has finished initializing
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
                guard let self = self else { return }
                // Double-check we still have active views
                if self.lockQueue.sync(execute: { self.activeViewCount }) > 0 {
                    self.resumeUnity()
                }
            }
        }
    }
    
    /// Call when a Unity view is hidden/removed
    func unregisterActiveView() {
        lockQueue.sync {
            activeViewCount = max(0, activeViewCount - 1)
            print("📊 Unity active views: \(activeViewCount)")
        }
        
        // Pause Unity if no views are active
        if activeViewCount == 0 {
            pauseUnity()
        }
    }

    // MARK: - Unity → RN message bridge (Unity calls these from native plugin; we forward to the active view)

    /// Register the handler to receive messages sent from Unity. Call from the active Unity view when it mounts.
    func registerUnityMessageHandler(_ handler: @escaping (String, String?) -> Void) {
        DispatchQueue.main.async { [weak self] in
            self?.unityMessageHandler = handler
            print("📩 Unity → RN message handler registered")
        }
    }

    /// Unregister the handler. Call when the Unity view unmounts.
    func unregisterUnityMessageHandler() {
        DispatchQueue.main.async { [weak self] in
            self?.unityMessageHandler = nil
            print("📩 Unity → RN message handler unregistered")
        }
    }

    /// Called by Unity native plugin (e.g. C function YallaGainSendMessageToApp) with a single message string.
    @objc func sendMessageFromUnity(_ message: String) {
        DispatchQueue.main.async { [weak self] in
            let hasHandler = self?.unityMessageHandler != nil
            print("📩 UnityManager.sendMessageFromUnity: \"\(message)\" handler=\(hasHandler)")
            self?.unityMessageHandler?(message, nil)
        }
    }

    /// Called by Unity native plugin with GameObject name and event/message. Use for MessageSent + SocketConnectedGame.
    @objc(sendMessageFromUnityWithGameObject:message:)
    func sendMessageFromUnity(gameObject: String?, message: String) {
        DispatchQueue.main.async { [weak self] in
            let hasHandler = self?.unityMessageHandler != nil
            print("📩 UnityManager.sendMessageFromUnity gameObject=\(gameObject ?? "nil") message=\"\(message)\" handler=\(hasHandler)")
            self?.unityMessageHandler?(message, gameObject)
        }
    }

    // MARK: - Pause/Resume
    
    /// Pause Unity rendering to free up main thread
    func pauseUnity() {
        guard let framework = lockQueue.sync(execute: { ufw }) else { return }
        let shouldPause = lockQueue.sync { !isPaused }
        guard shouldPause else { return }
        
        // Execute on main thread immediately (synchronously if already on main thread)
        if Thread.isMainThread {
            if framework.responds(to: NSSelectorFromString("pause:")) {
                framework.perform(NSSelectorFromString("pause:"), with: true)
                lockQueue.sync { isPaused = true }
                print("⏸️ Unity paused")
            }
            hideUnityView()
        } else {
            DispatchQueue.main.sync { [weak self] in
                guard let self = self else { return }
                if framework.responds(to: NSSelectorFromString("pause:")) {
                    framework.perform(NSSelectorFromString("pause:"), with: true)
                    self.lockQueue.sync { self.isPaused = true }
                    print("⏸️ Unity paused")
                }
                self.hideUnityView()
            }
        }
    }
    
    /// Resume Unity rendering
    func resumeUnity() {
        guard let framework = lockQueue.sync(execute: { ufw }) else { return }
        let shouldResume = lockQueue.sync { isPaused }
        guard shouldResume else { return }
        
        // Execute on main thread immediately (synchronously if already on main thread)
        if Thread.isMainThread {
            showUnityView()
            if framework.responds(to: NSSelectorFromString("pause:")) {
                framework.perform(NSSelectorFromString("pause:"), with: false)
                lockQueue.sync { isPaused = false }
                print("▶️ Unity resumed")
            }
        } else {
            DispatchQueue.main.sync { [weak self] in
                guard let self = self else { return }
                self.showUnityView()
                if framework.responds(to: NSSelectorFromString("pause:")) {
                    framework.perform(NSSelectorFromString("pause:"), with: false)
                    self.lockQueue.sync { self.isPaused = false }
                    print("▶️ Unity resumed")
                }
            }
        }
    }
    
    /// Unload the Unity application (same as @azesmway/react-native-unity: [[ufw] unloadApplication]).
    /// Call when leaving the Unity screen so Unity fully quits and restarts fresh next time.
    func unloadApplication() {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in self?.unloadApplication() }
            return
        }
        let framework = lockQueue.sync { ufw }
        guard let framework = framework else { return }
        if framework.responds(to: NSSelectorFromString("unloadApplication")) {
            framework.perform(NSSelectorFromString("unloadApplication"))
            print("🛑 Unity unloadApplication called")
        }
        lockQueue.sync {
            ufw = nil
            started = false
            isPaused = false
            activeViewCount = 0
        }
    }

    /// Send message to Unity
    func sendMessage(toGameObject gameObject: String, methodName: String, message: String) {
        guard let framework = lockQueue.sync(execute: { ufw }) else {
            print("⚠️ Unity not initialized, cannot send message")
            return
        }
        
        DispatchQueue.main.async {
            if framework.responds(to: NSSelectorFromString("sendMessageToGOWithName:functionName:message:")) {
                let selector = NSSelectorFromString("sendMessageToGOWithName:functionName:message:")
                let imp = framework.method(for: selector)
                typealias SendMessage = @convention(c) (AnyObject, Selector, UnsafePointer<CChar>, UnsafePointer<CChar>, UnsafePointer<CChar>) -> Void
                let sendMessage = unsafeBitCast(imp, to: SendMessage.self)
                gameObject.withCString { goPtr in
                    methodName.withCString { methodPtr in
                        message.withCString { msgPtr in
                            sendMessage(framework, selector, goPtr, methodPtr, msgPtr)
                        }
                    }
                }
            }
        }
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
