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

// Define RCTBubblingEventBlock for Swift
typedef void (^RCTBubblingEventBlock)(NSDictionary *body);

// RNAppAuth imports
#import <react-native-app-auth/RNAppAuthAuthorizationFlowManager.h>
#import <react-native-app-auth/RNAppAuthAuthorizationFlowManagerDelegate.h>

// Unity Framework - only include if available
#if __has_include(<UnityFramework/UnityFramework.h>)
#import <UnityFramework/UnityFramework.h>
#elif __has_include("UnityFramework.h")
#import "UnityFramework.h"
#endif

// Import mach-o headers for execute header (if needed)
#if __has_include(<mach-o/ldsyms.h>)
#import <mach-o/ldsyms.h>
#endif
