import UIKit
import Foundation
import React
import ObjectiveC

@objc(YallaGainUnityView)
@objcMembers
public class YallaGainUnityView: RCTView {
    
    private var ufw: AnyObject? // UnityFramework instance
    private var isInitializing = false
    
    override init(frame: CGRect) {
        super.init(frame: frame)
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }
    
    @objc dynamic var onUnityMessage: RCTBubblingEventBlock?
    
    private func initUnity() {
        guard !isInitializing, ufw == nil else { return }
        isInitializing = true
        
        print("🔄 Step 1: Starting Unity initialization")
        
        // 🔥 FIX: Load bundle on background thread, but run Unity on main thread
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            
            print("🔄 Step 2: Inside background thread - loading bundle")
            
            // Find and load UnityFramework bundle (can be done on background thread)
            var bundle: Bundle? = nil
            let possiblePaths = [
                Bundle.main.bundlePath + "/Frameworks/UnityFramework.framework",
                Bundle.main.bundlePath + "/UnityFramework.framework",
                Bundle.main.path(forResource: "UnityFramework", ofType: "framework") ?? "",
            ]
            
            for bundlePath in possiblePaths {
                if !bundlePath.isEmpty, let foundBundle = Bundle(path: bundlePath) {
                    print("✅ Found UnityFramework at: \(bundlePath)")
                    bundle = foundBundle
                    break
                }
            }
            
            guard let frameworkBundle = bundle else {
                print("❌ ERROR: UnityFramework bundle not found!")
                DispatchQueue.main.async {
                    self.isInitializing = false
                }
                return
            }
            
            // Load bundle on background thread (OK)
            if !frameworkBundle.isLoaded {
                print("📦 Loading UnityFramework bundle...")
                let loaded = frameworkBundle.load()
                print("📦 UnityFramework bundle load result: \(loaded)")
                if !loaded {
                    print("⚠️ Failed to load UnityFramework bundle")
                    DispatchQueue.main.async {
                        self.isInitializing = false
                    }
                    return
                }
            }
            
            // Get UnityFramework class (OK on background thread)
            guard let ufwClass = frameworkBundle.principalClass as? NSObject.Type else {
                print("❌ Failed to get UnityFramework class")
                DispatchQueue.main.async {
                    self.isInitializing = false
                }
                return
            }
            
            // Get UnityFramework instance (OK on background thread)
            var ufwInstance: AnyObject?
            if let ufwObjCClass = NSClassFromString("UnityFramework") {
                let selector = NSSelectorFromString("getInstance")
                let cls: AnyClass = ufwObjCClass
                if cls.responds(to: selector) {
                    if let method = class_getClassMethod(cls, selector) {
                        let imp = method_getImplementation(method)
                        typealias GetInstanceMethod = @convention(c) (AnyClass, Selector) -> Unmanaged<AnyObject>?
                        let getInstanceMethod = unsafeBitCast(imp, to: GetInstanceMethod.self)
                        let result = getInstanceMethod(cls, selector)
                        ufwInstance = result?.takeUnretainedValue() as? NSObject
                    }
                }
                
                if ufwInstance == nil {
                    ufwInstance = ufwClass.init()
                }
            } else {
                ufwInstance = ufwClass.init()
            }
            
            guard let ufw = ufwInstance else {
                print("❌ Failed to get UnityFramework instance")
                DispatchQueue.main.async {
                    self.isInitializing = false
                }
                return
            }
            
            self.ufw = ufw
            print("✅ UnityFramework instance obtained")
            
            let frameworkBundlePath = frameworkBundle.bundlePath
            let dataPath = frameworkBundlePath + "/Data"
            print("📁 Setting Unity data path to: \(dataPath)")
            
            // Set Unity data directory (OK on background thread)
            if ufw.responds(to: NSSelectorFromString("setDataBundleId:")) {
                ufw.perform(NSSelectorFromString("setDataBundleId:"), with: frameworkBundle.bundleIdentifier)
            }
            
            if ufw.responds(to: NSSelectorFromString("setFrameworkBundlePath:")) {
                ufw.perform(NSSelectorFromString("setFrameworkBundlePath:"), with: frameworkBundlePath)
            }
            
            print("🔄 Step 3: Bundle loaded, switching to main thread for Unity start")
            
            // 🔥 KEY FIX: Switch to main thread BEFORE calling runEmbedded
            DispatchQueue.main.async {
                print("🔄 Step 4: On main thread, starting Unity")
                self.startUnity(ufw: ufw, dataPath: dataPath)
            }
        }
    }
    
    private func startUnity(ufw: AnyObject, dataPath: String) {
        // MUST be on main thread
        assert(Thread.isMainThread, "startUnity must be called on main thread!")
        
        print("🔄 Step 5: Preparing Unity launch arguments")
        
        let args = ProcessInfo.processInfo.arguments
        let argc = Int32(args.count)
        
        var appLaunchOpts: [String: Any] = [:]
        
        // Verify data path
        let fileManager = FileManager.default
        var finalDataPath: String? = nil
        
        if fileManager.fileExists(atPath: dataPath) {
            print("✅ Unity Data folder found at: \(dataPath)")
            finalDataPath = dataPath
            appLaunchOpts["unity_data_path"] = dataPath
        } else {
            let appBundleDataPath = Bundle.main.bundlePath + "/Data"
            if fileManager.fileExists(atPath: appBundleDataPath) {
                print("✅ Found Unity Data folder at: \(appBundleDataPath)")
                finalDataPath = appBundleDataPath
                appLaunchOpts["unity_data_path"] = appBundleDataPath
            }
        }
        
        print("🚀 Starting Unity with data path: \(finalDataPath ?? "NONE")")
        
        // Run Unity on main thread (REQUIRED for UIKit APIs)
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
            
            print("📞 Calling Unity runEmbedded on main thread...")
            print("🔄 Step 6: About to call runEmbedded")
            
            // This will block, but we're already async from the user's perspective
            runEmbedded(ufw, selector, argc, argv, launchOpts)
            
            print("✅ Unity runEmbedded completed")
            print("🔄 Step 7: runEmbedded finished")
            
            // Free allocated strings
            for ptr in cStringArgs where ptr != nil {
                free(ptr)
            }
            
            self.isInitializing = false
            
            // Wait for Unity to be fully ready
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
                print("🔄 Step 8: Setting up Unity root view")
                self?.setupUnityRootView(ufw: ufw)
            }
        } else {
            print("❌ ERROR: UnityFramework does not respond to runEmbeddedWithArgc:argv:appLaunchOpts:")
            self.isInitializing = false
        }
    }
    
    private func setupUnityRootView(ufw: AnyObject) {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in
                self?.setupUnityRootView(ufw: ufw)
            }
            return
        }
        
        print("🔍 Attempting to get Unity root view...")
        
        if let appController = ufw.perform(NSSelectorFromString("appController"))?.takeUnretainedValue() {
            print("✅ Got Unity appController")
            
            if let rootView = (appController as AnyObject).perform(NSSelectorFromString("rootView"))?.takeUnretainedValue() as? UIView {
                print("✅ Got Unity root view, configuring...")
                rootView.removeFromSuperview()
                rootView.frame = bounds
                rootView.isUserInteractionEnabled = true
                rootView.isMultipleTouchEnabled = true
                rootView.clipsToBounds = true
                rootView.isExclusiveTouch = false
                addSubview(rootView)
                self.clipsToBounds = true
                self.isUserInteractionEnabled = true
                print("✅ Unity root view added and configured successfully")
                print("🔄 Step 9: Unity integration complete! ✨")
            } else {
                print("⚠️ Could not get Unity root view, retrying...")
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
                    self?.setupUnityRootView(ufw: ufw)
                }
            }
        } else {
            print("⚠️ Could not get Unity appController, retrying...")
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
                self?.setupUnityRootView(ufw: ufw)
            }
        }
    }
    
    override public func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let hitView = super.hitTest(point, with: event)
        
        if hitView == nil {
            return nil
        }
        
        if let unityRootView = getUnityRootView() {
            if hitView == unityRootView || hitView?.isDescendant(of: unityRootView) == true {
                return hitView
            }
        }
        
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
        
        if window != nil && ufw == nil && !isInitializing {
            // Short delay to ensure React Native is ready
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
                guard let self = self else { return }
                self.initUnity()
            }
        }
    }
    
    override public func layoutSubviews() {
        super.layoutSubviews()
        
        guard let ufw = ufw else { return }
        
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
        guard let ufw = ufw else {
            print("⚠️ Unity not initialized, cannot send message")
            return
        }
        
        DispatchQueue.main.async {
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
        guard let ufw = ufw else { return }
        
        DispatchQueue.main.async {
            if ufw.responds(to: NSSelectorFromString("pause:")) {
                _ = ufw.perform(NSSelectorFromString("pause:"), with: pause)
            }
        }
    }
    
    @objc func unloadUnity() {
        guard let ufw = ufw else { return }
        
        DispatchQueue.main.async { [weak self] in
            if ufw.responds(to: NSSelectorFromString("unloadApplication")) {
                _ = ufw.perform(NSSelectorFromString("unloadApplication"))
            }
            self?.ufw = nil
            self?.isInitializing = false
        }
    }
    
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