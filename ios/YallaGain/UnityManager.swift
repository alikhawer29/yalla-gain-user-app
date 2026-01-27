import UIKit
import Foundation

/// Singleton manager for Unity Framework lifecycle
/// Unity must be started ONCE at the app level, not from individual views
final class UnityManager {
    
    static let shared = UnityManager()
    
    private var ufw: AnyObject? // UnityFramework instance
    private var started = false
    private var isPaused = false // Unity starts running after runEmbedded, we pause it after
    private var activeViewCount = 0 // Track how many views are displaying Unity
    private let lockQueue = DispatchQueue(label: "com.yallagain.unity.manager")
    
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
    
    /// Start Unity Framework if not already started
    /// This should be called AFTER React Native UI is mounted
    func startUnityIfNeeded() {
        lockQueue.sync {
            guard !started else {
                print("ℹ️ Unity already started, skipping")
                return
            }
            started = true
        }
        
        // CRITICAL: Delay Unity startup to ensure React Native layout is complete
        // Unity initialization blocks the main thread, so we must wait for RN to settle
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            self?.startUnity()
        }
    }
    
    private func startUnity() {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in
                self?.startUnity()
            }
            return
        }
        
        let bundlePath = Bundle.main.bundlePath + "/Frameworks/UnityFramework.framework"
        guard let bundle = Bundle(path: bundlePath) else {
            print("❌ UnityFramework bundle not found at: \(bundlePath)")
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
        
        // Set Unity data directory - use APP bundle ID
        let appBundlePath = Bundle.main.bundlePath
        let dataPath = appBundlePath + "/Data"
        print("📁 Setting Unity data path to: \(dataPath)")
        
        if ufw.responds(to: NSSelectorFromString("setDataBundleId:")) {
            if let appBundleId = Bundle.main.bundleIdentifier {
                print("📦 Using app bundle ID for Unity: \(appBundleId)")
                ufw.perform(NSSelectorFromString("setDataBundleId:"), with: appBundleId)
            }
        }
        
        // Verify data path exists
        let fileManager = FileManager.default
        let appBundleDataPath = Bundle.main.bundlePath + "/Data"
        
        if !fileManager.fileExists(atPath: appBundleDataPath) {
            print("❌ ERROR: Unity Data folder not found at: \(appBundleDataPath)")
            return
        }
        
        print("✅ Unity Data folder found at app bundle: \(appBundleDataPath)")
        
        // Prepare launch options
        var appLaunchOpts: [String: Any] = [:]
        appLaunchOpts["unity_data_path"] = appBundleDataPath
        
        // Get the runEmbedded method
        if ufw.responds(to: NSSelectorFromString("runEmbeddedWithArgc:argv:appLaunchOpts:")) {
            let args = ProcessInfo.processInfo.arguments
            let argc = Int32(args.count)
            var cStringArgs: [UnsafeMutablePointer<CChar>?] = args.map { strdup($0) }
            cStringArgs.append(nil)
            
            let argv = cStringArgs.withUnsafeMutableBufferPointer { buffer in
                UnsafeMutablePointer<UnsafeMutablePointer<CChar>?>(buffer.baseAddress!)
            }
            
            let selector = NSSelectorFromString("runEmbeddedWithArgc:argv:appLaunchOpts:")
            let imp = ufw.method(for: selector)
            typealias RunEmbedded = @convention(c) (AnyObject, Selector, Int32, UnsafeMutablePointer<UnsafeMutablePointer<CChar>?>, NSDictionary?) -> Void
            let runEmbedded = unsafeBitCast(imp, to: RunEmbedded.self)
            let launchOpts = appLaunchOpts.isEmpty ? nil : appLaunchOpts as NSDictionary
            
            print("📞 Calling Unity runEmbedded...")
            runEmbedded(ufw, selector, argc, argv, launchOpts)
            print("✅ Unity runEmbedded completed")
            
            // Free allocated strings
            for ptr in cStringArgs where ptr != nil {
                free(ptr)
            }
            
            // CRITICAL: Pause Unity immediately after startup completes
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
