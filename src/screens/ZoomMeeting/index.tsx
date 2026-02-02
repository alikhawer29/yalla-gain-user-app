import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  NativeModules,
  StyleSheet,
  View,
  Platform,
  AppState,
  AppStateStatus,
  BackHandler,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ZoomSDKProvider, useZoom } from '@zoom/meetingsdk-react-native';
import Text from '../../components/Text';
import colors from '../../utils/colors';
import usePermissions from '../../hooks/usePermissions';

function ZoomMeetingContent() {
  const route = useRoute();
  const navigation = useNavigation();
  const zoom = useZoom();
  const { ensurePermissions, PERMISSIONS } = usePermissions();
  const joinAttempted = useRef(false);
  const [status, setStatus] = useState<'initializing' | 'joining' | 'in-meeting' | 'left' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Lifecycle management refs
  const appStateRef = useRef(AppState.currentState);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false);
  const joinTimeRef = useRef<number>(0);
  const lastBackgroundTimeRef = useRef<number>(0); // Track when we went to background

  const params = route.params as {
    signature: string;
    meeting_number: string;
    password?: string;
    join_url?: string;
    userName?: string;
  };

  useEffect(() => {
    if (joinAttempted.current) return;
    joinAttempted.current = true;

    initializeAndJoin();

    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (hasJoinedRef.current && !isLeavingRef.current) {
        console.log("Participant - Back button pressed during meeting, leaving meeting");
        handleMeetingEnd();
        return true;
      }
      return false;
    });

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Listen for Zoom meeting status events (if available)
    let meetingStatusListener: any = null;
    try {
      if ((zoom as any).addListener) {
        meetingStatusListener = (zoom as any).addListener('onMeetingStatusChanged', (event: any) => {
          console.log("Participant - Meeting status changed:", event);

          // Meeting ended statuses
          // Status 3 = MeetingStatus_Ended, Status 4 = MeetingStatus_Disconnecting
          if (event?.status === 3 || event?.status === 4 ||
            event?.event === 'meetingEnded' || event?.event === 'meetingDisconnected') {
            console.log("Participant - Meeting ended via SDK event");
            handleMeetingEnd();
          }
        });
      }
    } catch (err) {
      console.log("Participant - Could not add meeting status listener:", err);
    }

    return () => {
      backHandler.remove();
      subscription.remove();
      if (meetingStatusListener?.remove) {
        meetingStatusListener.remove();
      }
      cleanup();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const timeSinceJoin = joinTimeRef.current > 0 ? Date.now() - joinTimeRef.current : 0;
    const timeSinceBackground = lastBackgroundTimeRef.current > 0 ? Date.now() - lastBackgroundTimeRef.current : 0;

    console.log("========================================");
    console.log("Participant - App state changed:", appStateRef.current, "->", nextAppState);
    console.log("Participant - Has joined:", hasJoinedRef.current);
    console.log("Participant - Is leaving:", isLeavingRef.current);
    console.log("Participant - Time since join:", timeSinceJoin, "ms");
    console.log("Participant - Time in background:", timeSinceBackground, "ms");
    console.log("========================================");

    // When Zoom native UI launches, React Native app goes to background
    if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
      console.log("Participant - App went to background, Zoom native UI is now active");
      lastBackgroundTimeRef.current = Date.now();
      appStateRef.current = nextAppState;
      return;
    }

    // When app comes back to foreground
    if (
      appStateRef.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log("Participant - App returned to foreground");

      // Check if meeting is still in progress
      let meetingInProgress = false;
      try {
        // Try to check meeting status - if we get an error or the meeting isn't active, it ended
        const getMeetingStatus = (zoom as any).getMeetingStatus;
        if (typeof getMeetingStatus === 'function') {
          const meetingStatus = await getMeetingStatus();
          console.log("Participant - Meeting status:", meetingStatus);
          // Status 2 = InMeeting, 1 = Connecting
          meetingInProgress = meetingStatus === 2 || meetingStatus === 1;
        } else {
          console.log("Participant - getMeetingStatus not available, using timing heuristics");
        }
      } catch (err) {
        console.log("Participant - Could not get meeting status:", err);
        // If we can't check, assume meeting ended when we return to foreground after being in it
        meetingInProgress = false;
      }

      // If user was in the meeting and spent time in background (meeting UI), 
      // and meeting is no longer in progress, they likely left
      if (
        hasJoinedRef.current &&
        !isLeavingRef.current &&
        timeSinceJoin > 5000 && // At least 5 seconds since join
        timeSinceBackground > 3000 // At least 3 seconds in background (actually used Zoom UI)
      ) {
        if (!meetingInProgress) {
          console.log("Participant - Meeting ended, navigating back");
          handleMeetingEnd();
        } else {
          console.log("Participant - Meeting still in progress, staying on screen");
        }
      } else {
        console.log("Participant - Ignoring foreground transition - conditions not met");
        console.log("  - Time since join:", timeSinceJoin, "ms (need > 5000)");
        console.log("  - Time in background:", timeSinceBackground, "ms (need > 3000)");
      }
    }

    appStateRef.current = nextAppState;
  };

  const handleMeetingEnd = () => {
    if (isLeavingRef.current) {
      console.log("Participant - Already leaving, ignoring duplicate call");
      return;
    }

    console.log("Participant - Handling meeting end");
    isLeavingRef.current = true;
    setStatus('left');

    // Try to leave meeting gracefully
    try {
      const leaveMeeting = (zoom as any).leaveMeeting;
      if (typeof leaveMeeting === 'function') {
        leaveMeeting().catch((err: any) => {
          console.log("Participant - Leave meeting error (might be expected):", err);
        });
      }
    } catch (err) {
      console.log("Participant - Leave meeting exception (might be expected):", err);
    }

    cleanup();

    // Navigate back after a short delay
    setTimeout(() => {
      navigateBack();
    }, 300);
  };

  const initializeAndJoin = async () => {
    try {
      // Check for required parameters
      if (!params?.meeting_number) {
        setErrorMessage("Missing meeting number");
        setStatus('error');
        return;
      }

      if (!params?.signature) {
        setErrorMessage("Missing signature");
        setStatus('error');
        return;
      }

      console.log("Participant - Waiting for SDK initialization...");

      // Wait for SDK to initialize
      let isInitialized = false;
      let retries = 0;
      const maxRetries = 15;

      while (!isInitialized && retries < maxRetries) {
        try {
          isInitialized = await zoom.isInitialized();
          console.log(`Participant - Initialization check ${retries + 1}/${maxRetries}: ${isInitialized ? 'Initialized' : 'Not initialized yet'}`);
          if (!isInitialized) {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
            retries++;
          }
        } catch (err) {
          console.error("Participant - Error checking initialization:", err);
          await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
          retries++;
        }
      }

      if (!isInitialized) {
        console.error("Participant - SDK initialization timeout");
        setErrorMessage("Zoom SDK initialization timeout. Please try again.");
        setStatus('error');
        return;
      }

      console.log("Participant - SDK initialized, requesting permissions...");

      // Request permissions
      const permissionsGranted = await ensurePermissions(
        Platform.OS === 'android'
          ? [
            PERMISSIONS.ANDROID.CAMERA,
            PERMISSIONS.ANDROID.RECORD_AUDIO,
          ]
          : [
            PERMISSIONS.IOS.CAMERA,
            PERMISSIONS.IOS.MICROPHONE,
          ]
      );

      if (!permissionsGranted) {
        setErrorMessage("Camera and microphone permissions are required for Zoom meetings.");
        setStatus('error');
        return;
      }

      console.log("Participant - Permissions granted, joining meeting...");
      setStatus('joining');

      // Wait to ensure SDK is fully ready
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

      const userName = params.userName?.trim() || 'Participant';
      const meetingNumber = String(params.meeting_number);
      const meetingPassword = params.password || '';

      console.log("Participant - Calling joinMeeting with:", {
        userName,
        meetingNumber,
        hasPassword: !!meetingPassword,
      });

      let result: number | undefined;
      let joinError: Error | null = null;

      try {
        // Join meeting with timeout
        result = await Promise.race([
          zoom.joinMeeting({
            userName,
            meetingNumber,
            password: meetingPassword,
            noVideo: false,
            noAudio: false,
          }),
          new Promise<number>((_, reject) =>
            setTimeout(() => reject(new Error("Join meeting timeout")), 30000)
          )
        ]);
      } catch (err: any) {
        console.error("Participant - joinMeeting threw an error:", err);
        joinError = err instanceof Error ? err : new Error(String(err));
        result = undefined;
      }

      console.log("Participant - joinMeeting result:", result);
      console.log("Participant - joinMeeting error:", joinError);

      // Handle result
      if (joinError) {
        console.error("Participant - Join failed with error:", joinError.message);
        setErrorMessage(`Failed to join meeting: ${joinError.message}`);
        setStatus('error');
      } else if (result === 0) {
        console.log("Participant - Successfully joined meeting");
        hasJoinedRef.current = true;
        setStatus('in-meeting');
        joinTimeRef.current = Date.now();
        lastBackgroundTimeRef.current = Date.now(); // Initialize background time
      } else if (result === undefined) {
        // iOS-specific behavior or success without explicit return code
        console.warn("Participant - Result is undefined, checking if this is iOS behavior");
        await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));

        const hasAllParams = meetingNumber && params.signature && permissionsGranted;
        if (hasAllParams) {
          console.log("Participant - All params OK, assuming success (iOS behavior)");
          hasJoinedRef.current = true;
          setStatus('in-meeting');
          joinTimeRef.current = Date.now();
          lastBackgroundTimeRef.current = Date.now();
        } else {
          console.error("Participant - Undefined result with missing params");
          setErrorMessage("Failed to join meeting. Please check meeting credentials.");
          setStatus('error');
        }
      } else {
        console.error("Participant - Join failed with error code:", result);
        setErrorMessage(`Failed to join meeting. Error code: ${result}`);
        setStatus('error');
      }
    } catch (err: any) {
      console.error("Participant - Join error:", err);
      setErrorMessage(err?.message || 'Failed to join meeting');
      setStatus('error');
    }
  };

  const cleanup = () => {
    try {
      console.log("Participant - Cleaning up");
      // The SDK will handle cleanup when the meeting ends
    } catch (err) {
      console.error("Participant - Cleanup error:", err);
    }
  };

  const navigateBack = () => {
    setTimeout(() => {
      if (navigation.canGoBack()) {
        console.log("Participant - Navigating back");
        navigation.goBack();
      } else {
        console.log("Participant - Navigating to Home");
        navigation.navigate('Home' as never);
      }
    }, 100);
  };

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

  // Meeting ended - show brief message while navigating back
  if (status === 'left') {
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

  // Once joined, show minimal view - Zoom native UI takes over
  if (status === 'in-meeting') {
    return (
      <View style={styles.meetingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
        {/* Zoom native UI will display here */}
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
      <ActivityIndicator size="large" color={colors.primary} />
      <Text size={14} color={colors.icon_gray} style={styles.statusText}>
        {status === 'initializing' ? 'Initializing...' :
          status === 'joining' ? 'Joining meeting…' : 'In meeting'}
      </Text>
    </View>
  );
}

export default function ZoomMeeting() {
  const [ready, setReady] = useState(false);
  const route = useRoute();
  const params = route.params as {
    signature: string;
    meeting_number: string;
    password?: string;
    userName?: string;
  };

  useEffect(() => {
    // Delay mounting ZoomSDKProvider to ensure React Native bridge is ready
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Check native module exists
  const hasNativeModule =
    NativeModules.RNZoomSDK != null &&
    typeof NativeModules.RNZoomSDK.joinMeeting === 'function';

  if (!hasNativeModule) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
        <Text size={16} color={colors.white}>
          Zoom SDK is not available. Please ensure the app is built with the Zoom native module.
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
        <Text size={16} color={colors.white}>
          Missing meeting number.
        </Text>
      </View>
    );
  }

  if (!params?.signature) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor={colors.blackish_gray} />
        <Text size={16} color={colors.white}>
          Missing signature for Zoom meeting.
        </Text>
      </View>
    );
  }

  console.log("Participant - Initializing ZoomSDKProvider with:", {
    hasSignature: !!params.signature,
    signatureLength: params.signature?.length || 0,
    meetingNumber: params.meeting_number,
  });

  // ZoomSDKProvider config
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