//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//

#import <React/RCTView.h>
#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import <React/RCTLog.h>
#import <React/RCTComponent.h>
#import <React/UIView+React.h>

// Define RCTBubblingEventBlock for Swift
typedef void (^RCTBubblingEventBlock)(NSDictionary *body);

// RNAppAuth imports
#import <react-native-app-auth/RNAppAuthAuthorizationFlowManager.h>
#import <react-native-app-auth/RNAppAuthAuthorizationFlowManagerDelegate.h>

// Unity Framework is device-only. Importing it on simulator makes Swift autolink
// the iphoneos dylib and fails with: building for iOS-simulator, but linking in dylib built for iOS.
#import <TargetConditionals.h>
#if !TARGET_OS_SIMULATOR
#if __has_include(<UnityFramework/UnityFramework.h>)
#import <UnityFramework/UnityFramework.h>
#elif __has_include("UnityFramework.h")
#import "UnityFramework.h"
#endif
#endif

// Unity setExecuteHeader - required before runEmbedded (see Unity docs)
void* YallaGainGetExecuteHeader(void);
void YallaGainUnitySetExecuteHeader(id unityFramework);
void YallaGainUnitySetDataBundleId(id unityFramework, const char *bundleId);

// Emit Unity message event to JS (works in Fabric/bridgeless where RCTBubblingEventBlock may not deliver)
void YallaGainEmitUnityMessageToJS(NSNumber * _Nullable reactTag, NSString * _Nonnull message);
