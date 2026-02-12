import UIKit
import Foundation
import React

@objc(YallaGainUnityView)
@objcMembers
public class YallaGainUnityView: RCTView {

    private var pendingEmbedWorkItem: DispatchWorkItem?
    private var hasEmbeddedUnity: Bool = false

    override init(frame: CGRect) {
        super.init(frame: frame)
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }

    @objc dynamic var onUnityMessage: RCTBubblingEventBlock?

    /// Embed Unity's root view from UnityManager (Unity is started at app level)
    private func embedUnityRootView() {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in self?.embedUnityRootView() }
            return
        }
        guard window != nil, !hasEmbeddedUnity else { return }

        guard let rootView = UnityManager.shared.getRootView() else {
            return
        }
        if rootView.superview == self {
            hasEmbeddedUnity = true
            rootView.frame = bounds
            return
        }
        rootView.removeFromSuperview()
        rootView.frame = bounds
        rootView.isUserInteractionEnabled = true
        rootView.isMultipleTouchEnabled = true
        rootView.clipsToBounds = true
        rootView.isExclusiveTouch = false
        addSubview(rootView)
        clipsToBounds = true
        isUserInteractionEnabled = true
        hasEmbeddedUnity = true

        // Register this view as the recipient for Unity → RN messages (same as @azesmway/react-native-unity).
        // Unity's NativeCallProxy calls sendMessageToMobileApp on the registered API; without this, messages never reach RN.
        registerAsUnityMessageReceiver()

        if let ufw = UnityManager.shared.unityFramework,
           let appController = ufw.perform(NSSelectorFromString("appController"))?.takeUnretainedValue(),
           let unityWindow = (appController as AnyObject).perform(NSSelectorFromString("window"))?.takeUnretainedValue() as? UIWindow {
            unityWindow.isHidden = true
            unityWindow.windowLevel = .init(rawValue: -1)
        }
        if let appDelegate = UIApplication.shared.delegate as? UIResponder,
           appDelegate.responds(to: NSSelectorFromString("window")),
           let rnWindow = appDelegate.perform(NSSelectorFromString("window"))?.takeUnretainedValue() as? UIWindow {
            rnWindow.makeKeyAndVisible()
        } else {
            UIApplication.shared.windows.first { $0.isKeyWindow }?.makeKeyAndVisible()
        }
    }

    override public func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let hitView = super.hitTest(point, with: event)
        if hitView == nil { return nil }
        if let unityRoot = getUnityRootView(),
           hitView == unityRoot || hitView?.isDescendant(of: unityRoot) == true {
            return hitView
        }
        return hitView
    }

    private func getUnityRootView() -> UIView? {
        guard let r = UnityManager.shared.getRootView(), r.superview == self else { return nil }
        return r
    }

    override public func didMoveToWindow() {
        super.didMoveToWindow()
        if window != nil {
            UnityManager.shared.registerActiveView()
            UnityManager.shared.registerUnityMessageHandler { [weak self] message, gameObject in
                guard let self = self else {
                    print("📩 RNUnityView handler: self is nil")
                    return
                }
                guard let callback = self.onUnityMessage else {
                    print("📩 RNUnityView handler: onUnityMessage callback is nil")
                    return
                }
                print("📩 RNUnityView forwarding to RN: message=\"\(message)\" gameObject=\(gameObject ?? "nil")")
                var payload: [String: Any] = ["message": message]
                if let go = gameObject, !go.isEmpty { payload["gameObject"] = go }
                callback(payload)
            }
            pendingEmbedWorkItem?.cancel()
            let workItem = DispatchWorkItem { [weak self] in
                guard let self = self, self.window != nil else { return }
                UnityManager.shared.startUnityIfNeeded { [weak self] in
                    DispatchQueue.main.async { self?.embedUnityRootView() }
                }
            }
            pendingEmbedWorkItem = workItem
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1, execute: workItem)
        }
    }

    override public func willMove(toSuperview newSuperview: UIView?) {
        super.willMove(toSuperview: newSuperview)
        if newSuperview == nil {
            unregisterAsUnityMessageReceiver()
            UnityManager.shared.unregisterUnityMessageHandler()
            pendingEmbedWorkItem?.cancel()
            pendingEmbedWorkItem = nil
            if hasEmbeddedUnity {
                UnityManager.shared.unregisterActiveView()
                if let rootView = UnityManager.shared.getRootView(), rootView.superview == self {
                    rootView.removeFromSuperview()
                }
                hasEmbeddedUnity = false
            }
        }
    }

    override public func layoutSubviews() {
        super.layoutSubviews()
        if let rootView = UnityManager.shared.getRootView(), rootView.superview == self {
            rootView.frame = bounds
        }
    }

    @objc func postMessage(_ gameObject: String, methodName: String, message: String) {
        UnityManager.shared.sendMessage(toGameObject: gameObject, methodName: methodName, message: message)
    }

    @objc func pauseUnity(_ pause: Bool) {
        if pause {
            UnityManager.shared.pauseUnity()
        } else {
            UnityManager.shared.resumeUnity()
        }
    }

    @objc func unloadUnity() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            unregisterAsUnityMessageReceiver()
            UnityManager.shared.unregisterUnityMessageHandler()
            if self.hasEmbeddedUnity {
                UnityManager.shared.unregisterActiveView()
                if let rootView = UnityManager.shared.getRootView(), rootView.superview == self {
                    rootView.removeFromSuperview()
                }
                self.hasEmbeddedUnity = false
            }
            // Kill Unity app (same as @azesmway/react-native-unity) so it restarts on next enter
            UnityManager.shared.unloadApplication()
        }
    }

    /// If this is a back message from Unity, kill Unity in native first so unload runs before JS.
    private static func unloadUnityIfBackMessage(_ message: String) {
        let backMessages = ["GoBack", "SaveGame"]
        guard backMessages.contains(message.trimmingCharacters(in: .whitespacesAndNewlines)) else { return }
        print("📩 RNUnityView: back message \"\(message)\" → unloading Unity in native before forwarding to JS")
        UnityManager.shared.unloadApplication()
    }

    /// Called by Unity's native plugin (FrameworkLibAPI / NativeCallProxy) when game sends a message. Same contract as @azesmway/react-native-unity.
    @objc func sendMessageToMobileApp(_ message: String) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            print("📩 RNUnityView.sendMessageToMobileApp (from Unity): \"\(message)\"")
            YallaGainUnityView.unloadUnityIfBackMessage(message)
            let body = ["message": message]
            // 1) Invoke the bubbling event block (old arch)
            if let callback = self.onUnityMessage {
                callback(body)
            }
            // 2) Also dispatch via event dispatcher so JS receives in Fabric/bridgeless
            if let tag = self.reactTag {
                YallaGainEmitUnityMessageToJS(tag, message)
            }
        }
    }

    /// Register this view with Unity's FrameworkLibAPI so Unity's sendMessageToMobileApp() calls reach us.
    private func registerAsUnityMessageReceiver() {
        guard let apiClass = NSClassFromString("FrameworkLibAPI") as? NSObject.Type else {
            print("📩 FrameworkLibAPI not found (Unity plugin may use a different name); Unity→RN messages may not arrive.")
            return
        }
        let sel = NSSelectorFromString("registerAPIforNativeCalls:")
        guard apiClass.responds(to: sel) else {
            print("📩 FrameworkLibAPI does not respond to registerAPIforNativeCalls:; Unity→RN messages may not arrive.")
            return
        }
        apiClass.perform(sel, with: self)
        print("📩 Registered as Unity message receiver (FrameworkLibAPI)")
    }

    /// Unregister so Unity doesn't call back to a deallocated view.
    private func unregisterAsUnityMessageReceiver() {
        guard let apiClass = NSClassFromString("FrameworkLibAPI") as? NSObject.Type else { return }
        let sel = NSSelectorFromString("registerAPIforNativeCalls:")
        guard apiClass.responds(to: sel) else { return }
        apiClass.perform(sel, with: nil)
        print("📩 Unregistered Unity message receiver")
    }

    /// Called by Unity when sending both GameObject name and event name (e.g. MessageSent + SocketConnectedGame).
    @objc(sendMessageToMobileAppWithGameObject:message:)
    func sendMessageToMobileApp(gameObject: String, message: String) {
        DispatchQueue.main.async { [weak self] in
            YallaGainUnityView.unloadUnityIfBackMessage(message)
            guard let callback = self?.onUnityMessage else { return }
            callback(["message": message, "gameObject": gameObject])
        }
    }

    /// Forward to UnityManager (ObjC can't see UnityManager; view class is in Swift header).
    @objc static func forwardMessageFromUnity(_ message: String) {
        UnityManager.shared.sendMessageFromUnity(message)
    }

    @objc(forwardMessageFromUnityWithGameObject:message:)
    static func forwardMessageFromUnity(gameObject: String?, message: String) {
        UnityManager.shared.sendMessageFromUnity(gameObject: gameObject, message: message)
    }

    deinit {
        unregisterAsUnityMessageReceiver()
        UnityManager.shared.unregisterUnityMessageHandler()
        pendingEmbedWorkItem?.cancel()
        if hasEmbeddedUnity {
            UnityManager.shared.unregisterActiveView()
            if let rootView = UnityManager.shared.getRootView(), rootView.superview == self {
                rootView.removeFromSuperview()
            }
        }
    }
}
