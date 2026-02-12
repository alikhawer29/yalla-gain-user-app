import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash
import AVFoundation

@main
class AppDelegate: UIResponder, UIApplicationDelegate, RNAppAuthAuthorizationFlowManager {
  
  public weak var authorizationFlowManagerDelegate:
     RNAppAuthAuthorizationFlowManagerDelegate?
  
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "YallaGain",
      in: window,
      launchOptions: launchOptions
    )
    
    // Unity is started lazily when the user opens the Unity screen (RNUnityView).
    // Do NOT start Unity here — it crashes (EXC_BAD_ACCESS in UnityInitApplicationNoGraphics)
    // until the game team fixes the embedded player. This lets the app and bundling finish.
    
    do {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playback, mode: .default, options: [])
        try session.setActive(true)
    } catch {
        print("Failed to set AVAudioSession category: \(error)")
    }

    return true
  }
  
  func application(
      _ app: UIApplication,
      open url: URL,
      options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
      if let authorizationFlowManagerDelegate = self
        .authorizationFlowManagerDelegate
      {
        if authorizationFlowManagerDelegate.resumeExternalUserAgentFlow(with: url)
        {
          return true
        }
      }
      return false
    }
  
  
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {

    // Handle Universal-Link–style OAuth redirects first
    if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
      let delegate = authorizationFlowManagerDelegate,
      delegate.resumeExternalUserAgentFlow(with: userActivity.webpageURL)
    {
      return true
    }

    // Fall back to React Native’s own Linking logic
    return RCTLinkingManager.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }
  
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
  
  override func customize(_ rootView: RCTRootView) {
      super.customize(rootView)
      RNBootSplash.initWithStoryboard("LaunchScreen", rootView: rootView)
    }
}
