#import "RNZoomVideoSdkAudioHelper.h"
#import "RNZoomVideoSdkUser.h"
#import "RCTConvert+RNZoomVideoSdk.h"
#import <AVFAudio/AVFAudio.h>
#import <objc/message.h>
#import <objc/runtime.h>

static NSString *const kYGZoomMicSessionActive = @"YGZoomMicSessionActive";

static BOOL YGIsSpeakerRouteActive(void)
{
    AVAudioSession *session = [AVAudioSession sharedInstance];
    for (AVAudioSessionPortDescription *output in session.currentRoute.outputs) {
        if ([output.portType isEqualToString:AVAudioSessionPortBuiltInSpeaker]) {
            return YES;
        }
    }
    return NO;
}

static void YGSetRnVideoAudioSessionDisabled(BOOL disabled)
{
    [[NSUserDefaults standardUserDefaults] setBool:disabled forKey:kYGZoomMicSessionActive];
    [[NSUserDefaults standardUserDefaults] synchronize];

    SEL sel = NSSelectorFromString(@"setIsAudioSessionManagementDisabled:");
    int count = objc_getClassList(NULL, 0);
    Class *classes = (Class *)malloc(sizeof(Class) * (NSUInteger)count);
    count = objc_getClassList(classes, count);
    for (int i = 0; i < count; i++) {
        NSString *name = NSStringFromClass(classes[i]);
        if ([name containsString:@"PublicAudioSessionManager"] &&
            [classes[i] respondsToSelector:sel]) {
            ((void (*)(id, SEL, BOOL))objc_msgSend)(classes[i], sel, disabled);
            break;
        }
    }
    free(classes);
}

static void YGApplySpeakerRoute(BOOL isOn, NSError **outError)
{
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSError *error = nil;

    // Port override only. setCategory/setMode while RemoteIO is running drops
    // mic input to 0 channels.
    AVAudioSessionPortOverride override =
        isOn ? AVAudioSessionPortOverrideSpeaker : AVAudioSessionPortOverrideNone;
    [session overrideOutputAudioPort:override error:&error];
    if (error != nil) {
        NSLog(@"[YallaGain] overrideOutputAudioPort failed: %@", error);
    }
    [session setActive:YES error:nil];

    if (outError != nil) {
        *outError = error;
    }
}

@implementation RNZoomVideoSdkAudioHelper

- (ZoomVideoSDKAudioHelper *)getAudioHelper
{
    ZoomVideoSDKAudioHelper* audioHelper = nil;
    @try {
        audioHelper = [[ZoomVideoSDK shareInstance] getAudioHelper];
        if (audioHelper == nil) {
            NSException *e = [NSException exceptionWithName:@"NoAudioHelperFound" reason:@"No Audio Helper Found" userInfo:nil];
            @throw e;
        }
    } @catch (NSException *e) {
        NSLog(@"%@ - %@", e.name, e.reason);
    }
    return audioHelper;
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(canSwitchSpeaker:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    // There's no API for retrieving available outputs other than external devices
    // since iOS devices always have "Speaker".
    resolve(@YES);
}

RCT_EXPORT_METHOD(getSpeakerStatus:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        resolve(@(YGIsSpeakerRouteActive()));
    });
}

RCT_EXPORT_METHOD(setSpeaker:(BOOL)isOn
        withResolve:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        NSError *error = nil;

        // NOTE: Do NOT call setSDKAudioSessionEnv here — it re-applies Zoom's preferred
        // speaker route. Routing is a port override only (YGApplySpeakerRoute).
        YGApplySpeakerRoute(isOn, &error);

        // Best-effort: overrideOutputAudioPort:Speaker can return -50 even though the mode
        // change already routed audio. Resolving with the actual route avoids false errors.
        resolve(@(YGIsSpeakerRouteActive()));
    });
}

RCT_EXPORT_METHOD(startAudio:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        resolve([[RCTConvert ZoomVideoSDKErrorValuesReversed] objectForKey: @([[self getAudioHelper] startAudio])]);
    });
}

RCT_EXPORT_METHOD(prepareMicSession:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        YGSetRnVideoAudioSessionDisabled(YES);

        AVAudioSession *session = [AVAudioSession sharedInstance];
        NSError *error = nil;
        [session setActive:NO
               withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation
                     error:nil];
        [session setCategory:AVAudioSessionCategoryPlayAndRecord
                        mode:AVAudioSessionModeVideoChat
                     options:(AVAudioSessionCategoryOptionAllowBluetooth |
                              AVAudioSessionCategoryOptionDefaultToSpeaker)
                       error:&error];
        if (error != nil) {
            NSLog(@"[YallaGain] prepareMicSession setCategory failed: %@", error);
            error = nil;
        }
        [session setActive:YES error:&error];
        if (error != nil) {
            NSLog(@"[YallaGain] prepareMicSession setActive failed: %@", error);
        }
        resolve(@YES);
    });
}

RCT_EXPORT_METHOD(restoreOtherAudioSessions:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        YGSetRnVideoAudioSessionDisabled(NO);
        resolve(@YES);
    });
}

RCT_EXPORT_METHOD(stopAudio:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        resolve([[RCTConvert ZoomVideoSDKErrorValuesReversed] objectForKey: @([[self getAudioHelper] stopAudio])]);
    });
}

RCT_EXPORT_METHOD(muteAudio:(NSString *)userId
        withResolve:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        ZoomVideoSDKUser *user = [RNZoomVideoSdkUser getUser:userId];
        resolve([[RCTConvert ZoomVideoSDKErrorValuesReversed] objectForKey: @([[self getAudioHelper] muteAudio:user])]);
    });
}

RCT_EXPORT_METHOD(unmuteAudio:(NSString *)userId
        withResolve:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        ZoomVideoSDKUser *user = [RNZoomVideoSdkUser getUser:userId];
        resolve([[RCTConvert ZoomVideoSDKErrorValuesReversed] objectForKey: @([[self getAudioHelper] unmuteAudio:user])]);
    });
}

RCT_EXPORT_METHOD(subscribe:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        resolve([[RCTConvert ZoomVideoSDKErrorValuesReversed] objectForKey: @([[self getAudioHelper] subscribe])]);
    });
}

RCT_EXPORT_METHOD(unsubscribe:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        resolve([[RCTConvert ZoomVideoSDKErrorValuesReversed] objectForKey: @([[self getAudioHelper] unSubscribe])]);
    });
}

RCT_EXPORT_METHOD(resetAudioSession:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        resolve(@([[self getAudioHelper] resetAudioSession]));
    });
}

RCT_EXPORT_METHOD(cleanAudioSession:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [[self getAudioHelper] cleanAudioSession];
    });
}

RCT_EXPORT_METHOD(muteAllAudio:(BOOL)allowUnmute
        withResolve:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        resolve([[RCTConvert ZoomVideoSDKErrorValuesReversed] objectForKey: @([[self getAudioHelper] muteAllAudio:allowUnmute])]);
    });
}

RCT_EXPORT_METHOD(unmuteAllAudio: (RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        resolve([[RCTConvert ZoomVideoSDKErrorValuesReversed] objectForKey: @([[self getAudioHelper] unmuteAllAudio])]);
    });
}

RCT_EXPORT_METHOD(allowAudioUnmutedBySelf:(BOOL)allowUnmute
        withResolve:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        resolve([[RCTConvert ZoomVideoSDKErrorValuesReversed] objectForKey: @([[self getAudioHelper] allowAudioUnmutedBySelf:allowUnmute])]);
    });
}

RCT_EXPORT_METHOD(setSDKAudioSessionEnv:(RCTPromiseResolveBlock)resolve
        withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        BOOL result = [[self getAudioHelper] setSDKAudioSessionEnv];
        resolve(@(result));
    });
}

@end
