import UIKit
import Foundation
import React
import ObjectiveC

@objc(YallaGainUnityView)
@objcMembers
public class YallaGainUnityView: RCTView {
    
    private var ufw: AnyObject? // UnityFramework instance
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        // Don't initialize Unity here - wait until view is added to window
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        // Don't initialize Unity here - wait until view is added to window
    }
    
    // Property will be set by React Native via RCT_EXPORT_VIEW_PROPERTY
    // RCTBubblingEventBlock is defined in the bridging header as: (NSDictionary *) -> Void
    @objc dynamic var onUnityMessage: RCTBubblingEventBlock?
    
    private func initUnity() {
        guard ufw == nil else { return }
        
        // Check if we're on main thread before proceeding
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in
                self?.initUnity()
            }
            return
        }
        
        let work: () -> Void = { [weak self] in
            guard let self = self else { return }
            
            // Ensure we have a valid frame before proceeding
            guard self.frame.width > 0 && self.frame.height > 0 else {
                print("⚠️ View frame not ready yet, retrying...")
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
                    self?.initUnity()
                }
                return
            }
            
            let bundlePath = Bundle.main.bundlePath + "/Frameworks/UnityFramework.framework"
            guard let bundle = Bundle(path: bundlePath) else {
                print("❌ UnityFramework bundle not found at: \(bundlePath)")
                return
            }
            
            // Load bundle - this should be fast if already loaded
            if !bundle.isLoaded {
                let loaded = bundle.load()
                print("📦 UnityFramework bundle load result: \(loaded)")
                if !loaded {
                    print("⚠️ Failed to load UnityFramework bundle")
                    return
                }
            }
            
            // Use Objective-C runtime to get UnityFramework class
            guard let ufwClass = bundle.principalClass as? NSObject.Type else {
                print("❌ Failed to get UnityFramework class")
                return
            }
            
            // Attempt to get UnityFramework instance
            if let ufwObjCClass = NSClassFromString("UnityFramework") {
                let selector = NSSelectorFromString("getInstance")
                let cls: AnyClass = ufwObjCClass
                if cls.responds(to: selector) {
                    // Get the class method implementation
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
            
            // 🔥 CRITICAL FIX: Data folder is in APP bundle, not framework bundle!
            // Correct path: /var/containers/Bundle/Application/.../YallaGain.app/Data
            // NOT: UnityFramework.framework/Data
            let appBundlePath = Bundle.main.bundlePath
            let dataPath = appBundlePath + "/Data"
            print("📁 Setting Unity data path to: \(dataPath)")
            print("   App bundle: \(appBundlePath)")
            print("   Framework bundle: \(bundle.bundlePath)")
            
            // Set Unity data directory - use APP bundle ID, not framework bundle ID!
            if ufw.responds(to: NSSelectorFromString("setDataBundleId:")) {
                if let appBundleId = Bundle.main.bundleIdentifier {
                    print("📦 Using app bundle ID for Unity: \(appBundleId)")
                    ufw.perform(NSSelectorFromString("setDataBundleId:"), with: appBundleId)
                } else {
                    print("⚠️ Could not get app bundle identifier, using framework bundle ID")
                    ufw.perform(NSSelectorFromString("setDataBundleId:"), with: bundle.bundleIdentifier)
                }
            }
            
            // Try setting data path directly if available
            if ufw.responds(to: NSSelectorFromString("setFrameworkBundlePath:")) {
                ufw.perform(NSSelectorFromString("setFrameworkBundlePath:"), with: bundle.bundlePath)
            }
            
            // Configure Unity
            self.configureUnity(ufw: ufw, dataPath: dataPath)
        }
        
        DispatchQueue.main.async(execute: work)
    }
    
    private func configureUnity(ufw: AnyObject, dataPath: String) {
        let args = ProcessInfo.processInfo.arguments
        let argc = Int32(args.count)
        
        // Prepare appLaunchOpts with data path information
        // Unity looks for Data folder - we can pass it via appLaunchOpts
        var appLaunchOpts: [String: Any] = [:]
        
        // Verify data path exists - check APP bundle first (correct location)
        let fileManager = FileManager.default
        let appBundleDataPath = Bundle.main.bundlePath + "/Data"
        
        if fileManager.fileExists(atPath: appBundleDataPath) {
            print("✅ Unity Data folder found at app bundle: \(appBundleDataPath)")
            appLaunchOpts["unity_data_path"] = appBundleDataPath
        } else {
            print("⚠️ Unity Data folder not found at app bundle: \(appBundleDataPath)")
            // Fallback to framework bundle (shouldn't be needed if build script works)
            if fileManager.fileExists(atPath: dataPath) {
                print("✅ Found Unity Data folder at fallback path: \(dataPath)")
                appLaunchOpts["unity_data_path"] = dataPath
            } else {
                print("❌ ERROR: Unity Data folder not found in either location!")
                print("   App bundle: \(appBundleDataPath)")
                print("   Fallback: \(dataPath)")
            }
        }
        
        // CRITICAL: Set up the Unity view container BEFORE calling runEmbedded
        // This ensures Unity has a proper view hierarchy to render into
        self.clipsToBounds = true
        self.isUserInteractionEnabled = true
        self.backgroundColor = .clear
        
        // Get the runEmbedded method
        if ufw.responds(to: NSSelectorFromString("runEmbeddedWithArgc:argv:appLaunchOpts:")) {
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
            
            // Run Unity initialization - this will set up Unity's rendering loop
            // Note: This call may take some time but is necessary for Unity to start
            // Unity will handle its own rendering via UnityRepaint callbacks
            runEmbedded(ufw, selector, argc, argv, launchOpts)
            
            // Give Unity a moment to initialize before accessing its views
            print("✅ Unity runEmbedded completed")
            
            // Free allocated strings
            for ptr in cStringArgs where ptr != nil {
                free(ptr)
            }
            
            // Get root view and configure AFTER Unity has initialized
            // Use a retry mechanism to handle Unity's async initialization
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
                self?.setupUnityRootView(retryCount: 0, maxRetries: 10)
            }
        }
    }
    
    // Override hitTest to ensure React Native UI above can receive touches
    // Unity view should only capture touches directly on it, not block parent views
    override public func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        // Use RCTView's built-in hitTest, but ensure we respect pointerEvents
        let hitView = super.hitTest(point, with: event)
        
        // If hitTest returns nil or a view that's not Unity's root view,
        // allow the touch to potentially pass through
        if hitView == nil {
            return nil
        }
        
        // If we hit Unity's root view, ensure it's only for touches within bounds
        if let unityRootView = getUnityRootView() {
            if hitView == unityRootView || hitView?.isDescendant(of: unityRootView) == true {
                // Touch is on Unity, let it handle it
                return hitView
            }
        }
        
        // Otherwise, return what super returned (allows React Native to handle)
        return hitView
    }
    
    private func getUnityRootView() -> UIView? {
        guard let ufw = ufw,
              let appController = ufw.perform(NSSelectorFromString("appController"))?.takeUnretainedValue(),
              let rootView = (appController as AnyObject).perform(NSSelectorFromString("rootView"))?.takeUnretainedValue() as? UIView else {
            return nil
        }
        return rootView
    }
    
    private func setupUnityRootView(retryCount: Int, maxRetries: Int) {
        guard let ufw = ufw else { return }
        
        if let appController = ufw.perform(NSSelectorFromString("appController"))?.takeUnretainedValue() {
            if let rootView = (appController as AnyObject).perform(NSSelectorFromString("rootView"))?.takeUnretainedValue() as? UIView {
                // Remove from any existing superview
                rootView.removeFromSuperview()
                
                // Configure Unity root view
                rootView.frame = bounds
                rootView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
                rootView.isUserInteractionEnabled = true
                rootView.isMultipleTouchEnabled = true
                rootView.clipsToBounds = true
                rootView.isExclusiveTouch = false
                rootView.backgroundColor = .clear
                
                // Add to our view hierarchy
                addSubview(rootView)
                
                // Ensure our view is properly configured
                clipsToBounds = true
                isUserInteractionEnabled = true
                
                print("✅ Unity root view configured and added to hierarchy")
                
                // Force a layout update
                setNeedsLayout()
                layoutIfNeeded()
                return
            }
        }
        
        // Retry if view not ready yet
        if retryCount < maxRetries {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
                self?.setupUnityRootView(retryCount: retryCount + 1, maxRetries: maxRetries)
            }
        } else {
            print("⚠️ Unity root view not available after \(maxRetries) retries")
        }
    }
    
    override public func didMoveToWindow() {
        super.didMoveToWindow()
        
        // Only initialize Unity when view is added to window (after React Native is ready)
        // Reduce delay to prevent blocking - Unity initialization should be faster now
        if window != nil && ufw == nil {
            // Ensure we have a valid frame before initializing
            if frame.width > 0 && frame.height > 0 {
                // Initialize immediately if frame is ready
                DispatchQueue.main.async { [weak self] in
                    guard let self = self else { return }
                    self.initUnity()
                }
            } else {
                // Wait a bit for layout if frame isn't ready yet
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                    guard let self = self, self.window != nil else { return }
                    self.initUnity()
                }
            }
        }
    }
    
    override public func willMove(toSuperview newSuperview: UIView?) {
        super.willMove(toSuperview: newSuperview)
        
        // Don't initialize if view is being removed
        if newSuperview == nil {
            // View is being removed, cleanup can happen here if needed
        }
    }
    
    override public func layoutSubviews() {
        super.layoutSubviews()
        
        guard let ufw = ufw else { return }
        
        // Update Unity root view frame - ensure it matches our bounds
        if let appController = ufw.perform(NSSelectorFromString("appController"))?.takeUnretainedValue() {
            if let rootView = (appController as AnyObject).perform(NSSelectorFromString("rootView"))?.takeUnretainedValue() as? UIView {
                // Only update if frame has changed to avoid unnecessary work
                if rootView.frame != bounds {
                    rootView.frame = bounds
                }
                
                // Ensure Unity view is in our hierarchy
                if rootView.superview != self {
                    rootView.removeFromSuperview()
                    rootView.frame = bounds
                    rootView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
                    addSubview(rootView)
                }
            }
        }
    }
    
    @objc func postMessage(_ gameObject: String, methodName: String, message: String) {
        DispatchQueue.main.async { [weak self] in
            guard let ufw = self?.ufw else {
                print("⚠️ Unity not initialized, cannot send message")
                return
            }
            
            if ufw.responds(to: NSSelectorFromString("sendMessageToGOWithName:functionName:message:")) {
                let selector = NSSelectorFromString("sendMessageToGOWithName:functionName:message:")
                let imp = ufw.method(for: selector)
                typealias SendMessage = @convention(c) (AnyObject, Selector, UnsafePointer<CChar>, UnsafePointer<CChar>, UnsafePointer<CChar>) -> Void
                let sendMessage = unsafeBitCast(imp, to: SendMessage.self)
                gameObject.withCString { goPtr in
                    methodName.withCString { methodPtr in
                        message.withCString { msgPtr in
                            sendMessage(ufw, selector, goPtr, methodPtr, msgPtr)
                        }
                    }
                }
            }
        }
    }
    
    @objc func pauseUnity(_ pause: Bool) {
        DispatchQueue.main.async { [weak self] in
            guard let ufw = self?.ufw else { return }
            
            if ufw.responds(to: NSSelectorFromString("pause:")) {
                _ = ufw.perform(NSSelectorFromString("pause:"), with: pause)
            }
        }
    }
    
    @objc func unloadUnity() {
        DispatchQueue.main.async { [weak self] in
            guard let ufw = self?.ufw else { return }
            
            if ufw.responds(to: NSSelectorFromString("unloadApplication")) {
                _ = ufw.perform(NSSelectorFromString("unloadApplication"))
            }
            self?.ufw = nil
        }
    }
    
    // Handle messages from Unity to React Native
    @objc func sendMessageToMobileApp(_ message: String) {
        DispatchQueue.main.async { [weak self] in
            guard let callback = self?.onUnityMessage else { return }
            let eventData: [AnyHashable: Any] = ["message": message]
            callback(eventData)
        }
    }
    
    deinit {
        unloadUnity()
    }
}
