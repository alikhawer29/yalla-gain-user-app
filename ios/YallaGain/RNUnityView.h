#import <UIKit/UIKit.h>
#import <React/RCTComponent.h>

// Forward declaration only - implementation is in Swift (RNUnityView.swift)
@class YallaGainUnityView;
typedef void (^RCTBubblingEventBlock)(NSDictionary *);

@protocol YallaGainUnityViewDelegate <NSObject>
@optional
- (void)unityViewDidUnload:(YallaGainUnityView *)view;
- (void)unityViewDidQuit:(YallaGainUnityView *)view;
@end

// Note: YallaGainUnityView class is implemented in Swift (RNUnityView.swift)
// Methods are available via @objc exposure in the Swift file

