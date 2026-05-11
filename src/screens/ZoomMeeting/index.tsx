import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  InteractionManager,
  NativeModules,
  Platform,
  AppState,
  AppStateStatus,
  BackHandler,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ZoomSDKProvider, useZoom } from '@zoom/meetingsdk-react-native';
import Text from '../../components/Text';
import colors from '../../utils/colors';
import usePermissions from '../../hooks/usePermissions';
import { navigationRef } from '../../utils/navigation';
import { NAVIGATORS, ROUTES } from '../../utils/routes';

// ─────────────────────────────────────────────────────────────────────────────
// MobileRTCMeetingState numeric values (from MobileRTCConstants.h)
//   0 Idle · 1 Connecting · 2 WaitingForHost · 3 InMeeting
//   4 Disconnecting · 5 Reconnecting · 6 Failed · 7 Ended
const IOS_MEETING_ACTIVE_STATES = new Set([1, 2, 3, 5]);
// ─────────────────────────────────────────────────────────────────────────────

function ZoomMeetingContent() {
  const route = useRoute();
  const navigation = useNavigation();
  const zoom = useZoom();
  const { ensurePermissions, PERMISSIONS } = usePermissions();

  const joinAttempted = useRef(false);
  const [status, setStatus] = useState<
    'initializing' | 'joining' | 'in-meeting' | 'left' | 'error'
  >('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ── refs ──────────────────────────────────────────────────────────────────
  const appStateRef = useRef(AppState.currentState);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false);
  const joinTimeRef = useRef<number>(0);
  const lastBackgroundTimeRef = useRef<number>(0);
  const foregroundSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep a stable ref so setInterval / NativeEventEmitter callbacks always
  // call the latest version without stale closure issues.
  const handleMeetingEndRef = useRef<() => void>(() => {});

  const params = route.params as {
    signature: string;
    meeting_number: string;
    password?: string;
    join_url?: string;
    userName?: string;
    booking_id?: number;
  };

  // ── helpers ───────────────────────────────────────────────────────────────
  const clearForegroundSettleTimer = () => {
    if (foregroundSettleTimerRef.current) {
      clearTimeout(foregroundSettleTimerRef.current);
      foregroundSettleTimerRef.current = null;
    }
  };

  // ── navigation ────────────────────────────────────────────────────────────
  /**
   * Navigate to Booking Details using the root navigationRef so the call works
   * even after Zoom's native VC has been dismissed on iOS (local `navigation`
   * can be in a bad state at that point).
   */
  const navigateToBookingDetailsFromRoot = (bookingId: number) => {
    const id = Number(bookingId);
    const run = () => {
      if (!navigationRef.isReady()) {
        setTimeout(() => navigateToBookingDetailsFromRoot(id), 150);
        return;
      }
      console.log('Participant - Root navigate → BookingDetails', id);
      (navigationRef as any).navigate(NAVIGATORS.DRAWER, {
        screen: NAVIGATORS.CONSULTATION_STACK,
        params: {
          screen: ROUTES.BOOKING_DETAILS,
          params: { id, refreshAfterMeeting: true },
        },
      });
    };

    if (Platform.OS === 'ios') {
      // Let any in-flight native transitions finish before we push a new route.
      InteractionManager.runAfterInteractions(() => setTimeout(run, 250));
    } else {
      run();
    }
  };

  const navigateBack = () => {
    const bookingId = params.booking_id;
    if (bookingId != null) {
      navigateToBookingDetailsFromRoot(bookingId);
      return;
    }

    // Fallback: plain stack pop or My Bookings
    setTimeout(() => {
      if (navigation.canGoBack()) {
        console.log('Participant - Navigating back (stack pop)');
        navigation.goBack();
        return;
      }
      if (navigationRef.isReady()) {
        console.log('Participant - No stack to pop, opening My Bookings');
        (navigationRef as any).navigate(NAVIGATORS.DRAWER, {
          screen: NAVIGATORS.CONSULTATION_STACK,
          params: { screen: ROUTES.MY_BOOKINGS },
        });
      }
    }, Platform.OS === 'ios' ? 200 : 100);
  };

  // ── meeting-end handler ───────────────────────────────────────────────────
  const handleMeetingEnd = () => {
    if (isLeavingRef.current) {
      console.log('Participant - Already leaving, ignoring duplicate call');
      return;
    }
    console.log('Participant - Handling meeting end');
    isLeavingRef.current = true;
    clearForegroundSettleTimer();
    setStatus('left');

    // Attempt graceful SDK leave (might be a no-op if Zoom already closed)
    try {
      const leaveMeeting = (zoom as any).leaveMeeting;
      if (typeof leaveMeeting === 'function') {
        leaveMeeting().catch(() => {});
      }
    } catch { /* expected when Zoom has already torn down */ }

    if (Platform.OS === 'ios') {
      // Give Zoom's VC time to finish its dismiss animation before we push a
      // new route — otherwise React Navigation can land on a black view.
      setTimeout(() => {
        Alert.alert(
          'Meeting Ended',
          'The meeting session has ended.',
          [{ text: 'OK', style: 'default', onPress: () => navigateBack() }],
          { cancelable: false },
        );
      }, 500);
    } else {
      // Android: navigate directly — AppState-based detection already handles timing
      setTimeout(() => navigateBack(), 300);
    }
  };

  // Keep ref in sync so all async callbacks see the latest version
  handleMeetingEndRef.current = handleMeetingEnd;

  // ── iOS: polling — uses getMeetingStatus exposed by the native patch ─────
  useEffect(() => {
    if (Platform.OS !== 'ios' || status !== 'in-meeting') return;

    const poll = setInterval(async () => {
      if (isLeavingRef.current || !hasJoinedRef.current) {
        clearInterval(poll);
        return;
      }
      try {
        let meetingStatus: number | null | undefined = undefined;

        const getMeetingStatusJs = (zoom as any).getMeetingStatus;
        if (typeof getMeetingStatusJs === 'function') {
          meetingStatus = await getMeetingStatusJs();
        }
        if (meetingStatus === undefined || meetingStatus === null) {
          const nativeFn = NativeModules.RNZoomSDK?.getMeetingStatus;
          if (typeof nativeFn === 'function') {
            meetingStatus = await nativeFn();
          }
        }

        if (meetingStatus !== undefined && meetingStatus !== null) {
          if (!IOS_MEETING_ACTIVE_STATES.has(meetingStatus)) {
            clearInterval(poll);
            console.log(
              'Participant - iOS poll: meeting no longer active, status:',
              meetingStatus,
            );
            handleMeetingEndRef.current();
          }
        }
      } catch { /* getMeetingStatus not exposed — rely on native event or tap */ }
    }, 1500);

    return () => clearInterval(poll);
  }, [status]);

  // ── main effect: join + Android listeners ─────────────────────────────────
  useEffect(() => {
    if (joinAttempted.current) return;
    joinAttempted.current = true;

    initializeAndJoin();

    // Android: hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (hasJoinedRef.current && !isLeavingRef.current) {
        handleMeetingEnd();
        return true;
      }
      return false;
    });

    // Android: AppState (Zoom runs as a separate Activity → app goes background)
    // iOS:     AppState never changes (Zoom presents a VC on top) — kept for
    //          completeness but polling + touch overlay are the real iOS triggers.
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Android: SDK JS-wrapper event
    let meetingStatusListener: any = null;
    if (Platform.OS === 'android') {
      try {
        if ((zoom as any).addListener) {
          meetingStatusListener = (zoom as any).addListener(
            'onMeetingStatusChanged',
            (event: any) => {
              console.log('Participant - Android SDK event:', JSON.stringify(event));
              const ended =
                event?.status === 3 ||
                event?.status === 4 ||
                event?.event === 'meetingEnded' ||
                event?.event === 'meetingDisconnected';
              if (ended) handleMeetingEnd();
            },
          );
        }
      } catch (err) {
        console.log('Participant - Could not add SDK wrapper listener:', err);
      }
    }

    return () => {
      backHandler.remove();
      subscription.remove();
      if (meetingStatusListener?.remove) meetingStatusListener.remove();
      clearForegroundSettleTimer();
    };
  }, []);

  // ── AppState handler (mainly Android) ────────────────────────────────────
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const timeSinceJoin =
      joinTimeRef.current > 0 ? Date.now() - joinTimeRef.current : 0;
    const timeSinceBackground =
      lastBackgroundTimeRef.current > 0
        ? Date.now() - lastBackgroundTimeRef.current
        : 0;

    if (
      appStateRef.current === 'active' &&
      nextAppState.match(/inactive|background/)
    ) {
      lastBackgroundTimeRef.current = Date.now();
      clearForegroundSettleTimer();
      appStateRef.current = nextAppState;
      return;
    }

    if (
      appStateRef.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('Participant - App returned to foreground');

      // Try SDK getMeetingStatus first
      try {
        const getMeetingStatus = (zoom as any).getMeetingStatus;
        if (typeof getMeetingStatus === 'function') {
          const meetingStatus = await getMeetingStatus();
          const inMeeting = meetingStatus === 2 || meetingStatus === 1;
          if (
            !inMeeting &&
            hasJoinedRef.current &&
            !isLeavingRef.current &&
            timeSinceJoin > 5000 &&
            timeSinceBackground > 3000
          ) {
            handleMeetingEnd();
            appStateRef.current = nextAppState;
            return;
          }
        }
      } catch { /* not exposed */ }

      // Settle timer: if we stay in foreground > 1500 ms, Zoom UI is truly gone
      const MIN_JOIN_MS = 3000;
      if (
        hasJoinedRef.current &&
        !isLeavingRef.current &&
        timeSinceJoin > MIN_JOIN_MS
      ) {
        clearForegroundSettleTimer();
        foregroundSettleTimerRef.current = setTimeout(() => {
          if (isLeavingRef.current || !hasJoinedRef.current) return;
          if (appStateRef.current !== 'active') return;
          console.log('Participant - Settled in foreground → treating as meeting end');
          handleMeetingEnd();
        }, 1500);
      }
    }

    appStateRef.current = nextAppState;
  };

  // ── join ──────────────────────────────────────────────────────────────────
  const initializeAndJoin = async () => {
    try {
      if (!params?.meeting_number) {
        setErrorMessage('Missing meeting number');
        setStatus('error');
        return;
      }
      if (!params?.signature) {
        setErrorMessage('Missing signature');
        setStatus('error');
        return;
      }

      console.log('Participant - Waiting for SDK initialization...');
      let isInitialized = false;
      let retries = 0;
      while (!isInitialized && retries < 15) {
        try {
          isInitialized = await zoom.isInitialized();
          if (!isInitialized) {
            await new Promise<void>(r => setTimeout(r, 500));
            retries++;
          }
        } catch {
          await new Promise<void>(r => setTimeout(r, 500));
          retries++;
        }
      }

      if (!isInitialized) {
        setErrorMessage('Zoom SDK initialization timeout. Please try again.');
        setStatus('error');
        return;
      }

      const permissionsGranted = await ensurePermissions(
        Platform.OS === 'android'
          ? [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO]
          : [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE],
      );

      if (!permissionsGranted) {
        setErrorMessage('Camera and microphone permissions are required.');
        setStatus('error');
        return;
      }

      setStatus('joining');
      await new Promise<void>(r => setTimeout(r, 1000));

      const userName = params.userName?.trim() || 'Participant';
      const meetingNumber = String(params.meeting_number);
      const meetingPassword = params.password || '';

      console.log('Participant - Calling joinMeeting:', { userName, meetingNumber });

      let result: number | undefined;
      let joinError: Error | null = null;

      try {
        result = await Promise.race([
          zoom.joinMeeting({
            userName,
            meetingNumber,
            password: meetingPassword,
            noVideo: false,
            noAudio: false,
          }),
          new Promise<number>((_, reject) =>
            setTimeout(() => reject(new Error('Join meeting timeout')), 30000),
          ),
        ]);
      } catch (err: any) {
        if (hasJoinedRef.current || isLeavingRef.current) return;
        joinError = err instanceof Error ? err : new Error(String(err));
      }

      if (joinError) {
        if (hasJoinedRef.current || isLeavingRef.current) return;
        setErrorMessage(`Failed to join meeting: ${joinError.message}`);
        setStatus('error');
      } else if (result === 0) {
        console.log('Participant - Joined (result 0)');
        hasJoinedRef.current = true;
        setStatus('in-meeting');
        joinTimeRef.current = Date.now();
        lastBackgroundTimeRef.current = Date.now();
      } else if (result === undefined) {
        // iOS often returns undefined on success
        await new Promise<void>(r => setTimeout(r, 2000));
        if (meetingNumber && params.signature && permissionsGranted) {
          console.log('Participant - Assuming join success (iOS undefined result)');
          hasJoinedRef.current = true;
          setStatus('in-meeting');
          joinTimeRef.current = Date.now();
          lastBackgroundTimeRef.current = Date.now();
        } else {
          setErrorMessage('Failed to join meeting. Please check credentials.');
          setStatus('error');
        }
      } else {
        setErrorMessage(`Failed to join meeting. Error code: ${result}`);
        setStatus('error');
      }
    } catch (err: any) {
      if (hasJoinedRef.current || isLeavingRef.current) return;
      setErrorMessage(err?.message || 'Failed to join meeting');
      setStatus('error');
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
        <Text size={16} color={colors.white} style={styles.errorText}>
          {errorMessage}
        </Text>
      </View>
    );
  }

  // "left" state: iOS shows plain backdrop while Alert is up;
  // Android shows a brief spinner while navigating.
  if (status === 'left') {
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.meetingContainer}>
          <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text size={14} color={colors.icon_gray} style={styles.statusText}>
          Meeting ended
        </Text>
      </View>
    );
  }

  if (status === 'in-meeting') {
    return (
      <View style={styles.meetingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
        {/*
         * iOS only: Zoom presents its VC ON TOP of this view. When the user
         * taps "Leave", the VC dismisses and this view becomes visible/touchable.
         * The native event should fire automatically (via patch), but the touch
         * acts as an instant fallback in case the event is delayed.
         */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              if (!isLeavingRef.current) {
                console.log('Participant - iOS tap fallback: VC dismissed, ending meeting');
                handleMeetingEnd();
              }
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
      <ActivityIndicator size="large" color={colors.primary} />
      <Text size={14} color={colors.icon_gray} style={styles.statusText}>
        {status === 'initializing'
          ? 'Initializing...'
          : status === 'joining'
          ? 'Joining meeting…'
          : 'In meeting'}
      </Text>
    </View>
  );
}

// ─── Outer wrapper ────────────────────────────────────────────────────────────
export default function ZoomMeeting() {
  const [ready, setReady] = useState(false);
  const route = useRoute();
  const params = route.params as {
    signature: string;
    meeting_number: string;
    password?: string;
    userName?: string;
    booking_id?: number;
  };

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  const hasNativeModule =
    NativeModules.RNZoomSDK != null &&
    typeof NativeModules.RNZoomSDK.joinMeeting === 'function';

  if (!hasNativeModule) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
        <Text size={16} color={colors.white}>
          Zoom SDK is not available.
        </Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!params?.meeting_number) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
        <Text size={16} color={colors.white}>Missing meeting number.</Text>
      </View>
    );
  }

  if (!params?.signature) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
        <Text size={16} color={colors.white}>Missing signature for Zoom meeting.</Text>
      </View>
    );
  }

  const initConfig = {
    jwtToken: params.signature,
    domain: 'zoom.us',
    enableLog: true,
    logSize: 5,
  };

  return (
    <ZoomSDKProvider config={initConfig}>
      <ZoomMeetingContent />
    </ZoomSDKProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.blackish_gray,
    padding: 24,
  },
  statusText: {
    marginTop: 12,
  },
  errorText: {
    textAlign: 'center',
  },
  meetingContainer: {
    flex: 1,
    backgroundColor: colors.blackish_gray,
  },
});
