#import "RNZoomVideoSdkAudioHelper.h"
#import "RNZoomVideoSdkUser.h"
#import "RCTConvert+RNZoomVideoSdk.h"
#import <AVFAudio/AVFAudio.h>

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

static void YGApplySpeakerRoute(BOOL isOn, NSError **outError)
{
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSError *error = nil;

    // Zoom runs the session in VideoChat mode, which DEFAULTS to speaker. So
    // overrideOutputAudioPort:None alone cannot reach the earpiece — it just reverts to
    // the speaker default. The lever that actually moves audio to the earpiece is the
    // session MODE: VoiceChat defaults to the receiver (earpiece), VideoChat to speaker.
    // The atomic setCategory:mode:options: call changes routing even while Zoom's audio
    // unit is active (separate setMode/setCategory return paramErr -50).
    AVAudioSessionMode mode =
        isOn ? AVAudioSessionModeVideoChat : AVAudioSessionModeVoiceChat;

    AVAudioSessionCategoryOptions options =
        AVAudioSessionCategoryOptionAllowBluetooth;
    // NOTE: Do NOT add AllowBluetoothA2DP — A2DP is output-only and can disable
    // microphone capture when PlayAndRecord is active (breaks Zoom mic on iOS).
    if (isOn) {
        options |= AVAudioSessionCategoryOptionDefaultToSpeaker;
    }

    [session setCategory:AVAudioSessionCategoryPlayAndRecord
                    mode:mode
                 options:options
                   error:&error];
    if (error != nil) {
        NSLog(@"[YallaGain] setCategory:mode failed: %@", error);
        error = nil;
    }

    AVAudioSessionPortOverride override =
        isOn ? AVAudioSessionPortOverrideSpeaker : AVAudioSessionPortOverrideNone;

    [session overrideOutputAudioPort:override error:&error];
    if (error != nil) {
        NSLog(@"[YallaGain] overrideOutputAudioPort failed: %@", error);
    }

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
        // (speaker) route and flips earpiece back ON. Routing is driven by the session
        // mode/override inside YGApplySpeakerRoute.
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
