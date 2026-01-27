import UIKit
import Foundation
import React
import ObjectiveC

@objc(YallaGainUnityView)
@objcMembers
public class YallaGainUnityView: RCTView {
    
    private var ufw: AnyObject? // UnityFramework instance
    private var pendingInitWorkItem: DispatchWorkItem?
    private var hasInitializedUnity: Bool = false
    private var isUnloadingUnity: Bool = false
    
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
            
            let bundlePath = Bundle.main.bundlePath + "/Frameworks/UnityFramework.framework"
            guard let bundle = Bundle(path: bundlePath) else {
                print("❌ UnityFramework bundle not found at: \(bundlePath)")
                return
            }
            
            // Load bundle on background thread to avoid blocking
            if !bundle.isLoaded {
                // Load synchronously but in async dispatch to avoid blocking React Native init
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
            
            // Get UnityFramework bundle path for Data directory
            let frameworkBundlePath = bundle.bundlePath
            let dataPath = frameworkBundlePath + "/Data"
            print("📁 Setting Unity data path to: \(dataPath)")
            
            // Set Unity data directory to the framework bundle's Data folder
            if ufw.responds(to: NSSelectorFromString("setDataBundleId:")) {
                // Some Unity versions use setDataBundleId
                ufw.perform(NSSelectorFromString("setDataBundleId:"), with: bundle.bundleIdentifier)
            }
            
            // Try setting data path directly if available
            if ufw.responds(to: NSSelectorFromString("setFrameworkBundlePath:")) {
                ufw.perform(NSSelectorFromString("setFrameworkBundlePath:"), with: frameworkBundlePath)
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
        
        // Verify data path exists
        let fileManager = FileManager.default
        if fileManager.fileExists(atPath: dataPath) {
            print("✅ Unity Data folder found at: \(dataPath)")
            appLaunchOpts["unity_data_path"] = dataPath
        } else {
            print("⚠️ Unity Data folder not found at: \(dataPath)")
            // Try alternative path in app bundle
            let altDataPath = Bundle.main.bundlePath + "/Data"
            if fileManager.fileExists(atPath: altDataPath) {
                print("✅ Found Unity Data folder at alternative path: \(altDataPath)")
                appLaunchOpts["unity_data_path"] = altDataPath
            }
        }
        
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
            runEmbedded(ufw, selector, argc, argv, launchOpts)
            
            // Free allocated strings
            for ptr in cStringArgs where ptr != nil {
                free(ptr)
            }
        }
        
        // Get root view and configure
        if let appController = ufw.perform(NSSelectorFromString("appController"))?.takeUnretainedValue() {
            if let rootView = (appController as AnyObject).perform(NSSelectorFromString("rootView"))?.takeUnretainedValue() as? UIView {
                rootView.removeFromSuperview()
                rootView.frame = bounds
                // Configure Unity root view
                rootView.isUserInteractionEnabled = true
                rootView.isMultipleTouchEnabled = true
                // Set clipsToBounds to ensure Unity doesn't capture touches outside its bounds
                rootView.clipsToBounds = true
                // Configure Unity view to not interfere with React Native UI
                rootView.isExclusiveTouch = false
                addSubview(rootView)
                // Make sure our view allows parent views to handle touches when appropriate
                self.clipsToBounds = true
                self.isUserInteractionEnabled = true
                self.hasInitializedUnity = true

                // Ensure Unity's own UIWindow (if any) does not intercept touches above RN
                if let unityWindow = (appController as AnyObject).perform(NSSelectorFromString("window"))?.takeUnretainedValue() as? UIWindow {
                    // Hide Unity's window so only the embedded rootView receives touches
                    unityWindow.isHidden = true
                    unityWindow.windowLevel = .init(rawValue: -1)
                }

                // Reassert RN window as key and visible to receive gestures and header taps
                if let appDelegate = UIApplication.shared.delegate as? UIResponder,
                   appDelegate.responds(to: NSSelectorFromString("window")),
                   let rnWindow = appDelegate.perform(NSSelectorFromString("window"))?.takeUnretainedValue() as? UIWindow {
                    rnWindow.makeKeyAndVisible()
                } else {
                    UIApplication.shared.windows.first { $0.isKeyWindow }?.makeKeyAndVisible()
                }
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
    
    override public func didMoveToWindow() {
        super.didMoveToWindow()
        
        // Only initialize Unity when view is added to window (after React Native is ready)
        // Wait longer to ensure React Native is fully initialized and JS bundle has loaded
        if window != nil && ufw == nil {
            // Cancel any previous scheduled init to avoid acting on a deallocating view
            pendingInitWorkItem?.cancel()
            let workItem = DispatchWorkItem { [weak self] in
                guard let strongSelf = self, strongSelf.window != nil, strongSelf.ufw == nil else { return }
                strongSelf.initUnity()
            }
            pendingInitWorkItem = workItem
            // Use a longer delay to ensure React Native bridge and JS bundle are fully loaded
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0, execute: workItem)
        }
    }
    
    override public func willMove(toSuperview newSuperview: UIView?) {
        super.willMove(toSuperview: newSuperview)
        
        // Don't initialize if view is being removed
        if newSuperview == nil {
            // Cancel any pending initialization tasks to avoid weak-ref warnings during teardown
            pendingInitWorkItem?.cancel()
            pendingInitWorkItem = nil
        }
    }
    
    override public func layoutSubviews() {
        super.layoutSubviews()
        
        guard let ufw = ufw else { return }
        
        // Update Unity root view frame
        if let appController = ufw.perform(NSSelectorFromString("appController"))?.takeUnretainedValue() {
            if let rootView = (appController as AnyObject).perform(NSSelectorFromString("rootView"))?.takeUnretainedValue() as? UIView {
                rootView.frame = bounds
                if rootView.superview != self {
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
            guard let self = self else { return }
            guard self.ufw != nil else { return }
            if self.isUnloadingUnity { return }
            self.isUnloadingUnity = true

            // Safer teardown: detach Unity root view and clear reference instead of calling unloadApplication
            if let ufw = self.ufw,
               let appController = ufw.perform(NSSelectorFromString("appController"))?.takeUnretainedValue(),
               let rootView = (appController as AnyObject).perform(NSSelectorFromString("rootView"))?.takeUnretainedValue() as? UIView {
                rootView.removeFromSuperview()
            }

            // Avoid calling unloadApplication as it can abort on some Unity/iOS versions
            self.ufw = nil
            self.hasInitializedUnity = false
            self.isUnloadingUnity = false
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
        // Ensure no scheduled work runs after deallocation
        pendingInitWorkItem?.cancel()
        pendingInitWorkItem = nil
        // Detach Unity view if present; avoid calling Unity unload to prevent aborts
        if let ufw = self.ufw,
           let appController = ufw.perform(NSSelectorFromString("appController"))?.takeUnretainedValue(),
           let rootView = (appController as AnyObject).perform(NSSelectorFromString("rootView"))?.takeUnretainedValue() as? UIView {
            rootView.removeFromSuperview()
        }
        self.ufw = nil
        self.hasInitializedUnity = false
    }
}