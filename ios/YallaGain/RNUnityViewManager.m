#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTLog.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcherProtocol.h>
#import <React/RCTComponentEvent.h>
#import <React/UIView+React.h>
#import <TargetConditionals.h>
#import <dlfcn.h>
// Import the generated Swift header to access YallaGainUnityView Swift class
#import "YallaGain-Swift.h"

// Unity requires setExecuteHeader before runEmbedded. Resolve at runtime to avoid linker symbol.
static void* getExecuteHeaderPtr(void) {
    void *mainHandle = dlopen(NULL, RTLD_NOW);
    if (!mainHandle) return NULL;
    return dlsym(mainHandle, "_mh_execute_header");
}

void* YallaGainGetExecuteHeader(void) {
    return getExecuteHeaderPtr();
}

// Call setExecuteHeader on UnityFramework so Swift doesn't need to pass Mach header pointer
void YallaGainUnitySetExecuteHeader(id unityFramework) {
#if TARGET_OS_SIMULATOR
    (void)unityFramework;
#else
    if (!unityFramework || ![unityFramework respondsToSelector:@selector(setExecuteHeader:)]) return;
    void *header = getExecuteHeaderPtr();
    if (header) {
        [unityFramework setExecuteHeader:header];
    }
#endif
}

// setDataBundleId expects (const char*) — call with C string like the Unity uaal-example
void YallaGainUnitySetDataBundleId(id unityFramework, const char *bundleId) {
#if TARGET_OS_SIMULATOR
    (void)unityFramework;
    (void)bundleId;
#else
    if (unityFramework && bundleId && [unityFramework respondsToSelector:@selector(setDataBundleId:)]) {
        [unityFramework setDataBundleId:bundleId];
    }
#endif
}

@interface RNUnityViewManager : RCTViewManager
@end

@implementation RNUnityViewManager

RCT_EXPORT_MODULE(YallaGainUnityView)

- (UIView *)view {
    // Initialize with zero frame - will be set properly when added to view hierarchy
    return [[YallaGainUnityView alloc] initWithFrame:CGRectZero];
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

RCT_EXPORT_VIEW_PROPERTY(onUnityMessage, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(pointerEvents, RCTPointerEvents)

RCT_EXPORT_METHOD(postMessage:(nonnull NSNumber *)reactTag
                  gameObject:(NSString *)gameObject
                  methodName:(NSString *)methodName
                  message:(NSString *)message) {
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        YallaGainUnityView *view = (YallaGainUnityView *)viewRegistry[reactTag];
        if (!view || ![view isKindOfClass:[YallaGainUnityView class]]) {
            RCTLogError(@"Cannot find YallaGainUnityView with tag #%@", reactTag);
            return;
        }
        [view postMessage:gameObject methodName:methodName message:message];
    }];
}

RCT_EXPORT_METHOD(pauseUnity:(nonnull NSNumber *)reactTag pause:(BOOL)pause) {
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        YallaGainUnityView *view = (YallaGainUnityView *)viewRegistry[reactTag];
        if (!view || ![view isKindOfClass:[YallaGainUnityView class]]) {
            RCTLogError(@"Cannot find YallaGainUnityView with tag #%@", reactTag);
            return;
        }
        [view pauseUnity:pause];
    }];
}

RCT_EXPORT_METHOD(unloadUnity:(nonnull NSNumber *)reactTag) {
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        YallaGainUnityView *view = (YallaGainUnityView *)viewRegistry[reactTag];
        if (!view || ![view isKindOfClass:[YallaGainUnityView class]]) {
            RCTLogError(@"Cannot find YallaGainUnityView with tag #%@", reactTag);
            return;
        }
        [view unloadUnity];
    }];
}

/// Test only: simulate a message from Unity so JS can verify [UnityMessage] and sendUserId path without the game.
RCT_EXPORT_METHOD(simulateMessageFromUnity:(NSString *)message) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [YallaGainUnityView forwardMessageFromUnity:message];
    });
}

RCT_EXPORT_METHOD(simulateMessageFromUnityWithGameObject:(NSString *)gameObject message:(NSString *)message) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [YallaGainUnityView forwardMessageFromUnityWithGameObject:gameObject message:message];
    });
}

@end

// MARK: - Unity → RN bridge (call these from Unity C# via native plugin when sending messages to the app)

void YallaGainSendMessageToApp(const char *message) {
    if (!message) return;
    NSString *msg = [NSString stringWithUTF8String:message];
    dispatch_async(dispatch_get_main_queue(), ^{
        [YallaGainUnityView forwardMessageFromUnity:msg];
    });
}

void YallaGainSendMessageToAppWithGameObject(const char *gameObject, const char *message) {
    NSString *go = gameObject ? [NSString stringWithUTF8String:gameObject] : nil;
    NSString *msg = message ? [NSString stringWithUTF8String:message] : @"";
    dispatch_async(dispatch_get_main_queue(), ^{
        [YallaGainUnityView forwardMessageFromUnityWithGameObject:go message:msg];
    });
}

// Send Unity message to JS via event dispatcher (ensures delivery in Fabric/bridgeless)
void YallaGainEmitUnityMessageToJS(NSNumber * _Nullable reactTag, NSString * _Nonnull message) {
    if (!reactTag || !message) return;
    id bridge = [RCTBridge currentBridge];
    if (!bridge) return;
    id<RCTEventDispatcherProtocol> dispatcher = [bridge eventDispatcher];
    if (!dispatcher) return;
    RCTComponentEvent *event = [[RCTComponentEvent alloc] initWithName:@"onUnityMessage" viewTag:reactTag body:@{@"message": message}];
    [dispatcher sendEvent:event];
}
