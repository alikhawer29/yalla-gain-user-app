#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTLog.h>
// Import the generated Swift header to access RNUnityView Swift class
#import "YallaGain-Swift.h"

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

@end

