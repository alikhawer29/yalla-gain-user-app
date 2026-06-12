import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  PanResponder,
  Platform,
  StatusBar,
  Text as RNText,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { StackActions, useRoute, useNavigation } from '@react-navigation/native';
import {
  EventType,
  VideoAspect,
  ZoomVideoSdkProvider,
  useZoom,
} from '@zoom/react-native-videosdk';
import SafeZoomView from '../../components/SafeZoomView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import images from '../../assets/images';
import Icon from '../../components/Icon';
import Image from '../../components/Image';
import Text from '../../components/Text';
import colors from '../../utils/colors';
import { widthPixel } from '../../utils/helper';
import usePermissions from '../../hooks/usePermissions';
import ZoomVideoService from '../../services/ZoomVideoService';
import {
  clearZoomSessionActive,
  markZoomSessionActive,
} from '../../utils/zoomSessionStorage';
import {
  formatCountdown,
  getRemainingSeconds,
  getSessionEndMs,
} from '../../utils/videoSessionTimer';
import { ROUTES } from '../../utils/routes';
import styles, {
  CONTROL_BAR_HEIGHT,
  PIP_HEIGHT,
  PIP_WIDTH,
} from './styles';
import {
  CameraIcon,
  MicIcon,
  SpeakerIcon,
} from './VideoSessionIcons';

type VideoSessionParams = {
  session_token: string;
  session_name: string;
  user_name: string;
  role?: number;
  doctor_name?: string;
  patient_name?: string;
  booking_id?: number;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
  duration_minutes?: number;
  started_at?: string;
  session_status?: string;
  appointment_date?: string;
  appointment_end_time?: string;
};

type SessionStatus = 'Connecting...' | 'In Session' | 'Session Ended' | 'Waiting...';

const getInitials = (name?: string): string => {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

type ControlButtonProps = {
  label: string;
  onPress: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
};

const CONNECTING_DOT_COUNT = 3;

const ConnectingStatus = () => {
  const dotOpacities = useRef(
    Array.from({ length: CONNECTING_DOT_COUNT }, () => new Animated.Value(0.25)),
  ).current;

  useEffect(() => {
    const loops = dotOpacities.map((opacity, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 180),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.25,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    const animation = Animated.parallel(loops);
    animation.start();
    return () => animation.stop();
  }, [dotOpacities]);

  return (
    <View style={styles.connectingRow}>
      <Text size={14} color={colors.white}>
        Connecting
      </Text>
      <View style={styles.connectingDots}>
        {dotOpacities.map((opacity, index) => (
          <Animated.View
            key={`connecting-dot-${index}`}
            style={[styles.connectingDot, { opacity }]}
          />
        ))}
      </View>
    </View>
  );
};

const ControlButton = ({
  label,
  onPress,
  onLongPress,
  children,
}: ControlButtonProps) => (
  <TouchableOpacity
    style={styles.controlBtn}
    onPress={onPress}
    onLongPress={onLongPress}
    activeOpacity={0.75}
  >
    <View style={styles.controlIconWrap}>{children}</View>
    <Text size={11} color={colors.white}>
      {label}
    </Text>
  </TouchableOpacity>
);

function VideoSessionContent() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const zoom = useZoom();
  const { ensurePermissions, PERMISSIONS } = usePermissions();

  const params = route.params as VideoSessionParams;
  const isHost = Number(params.role) === 1;
  const bookingId = params.booking_id;

  const sessionEndMs = useMemo(
    () =>
      getSessionEndMs({
        scheduled_start_at: params.scheduled_start_at,
        scheduled_end_at: params.scheduled_end_at,
        duration_minutes: params.duration_minutes,
        started_at: params.started_at,
        session_status: params.session_status,
        appointment_date: params.appointment_date,
        appointment_end_time: params.appointment_end_time,
      }),
    [
      params.scheduled_start_at,
      params.scheduled_end_at,
      params.duration_minutes,
      params.started_at,
      params.session_status,
      params.appointment_date,
      params.appointment_end_time,
    ],
  );

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('Connecting...');
  const [isConnecting, setIsConnecting] = useState(true);
  const [isInSession, setIsInSession] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    sessionEndMs != null ? getRemainingSeconds(sessionEndMs) : 0,
  );
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
  const [remoteVideoOn, setRemoteVideoOn] = useState(true);
  const [remoteDisplayName, setRemoteDisplayName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isBackCamera, setIsBackCamera] = useState(false);
  const [pipPosition, setPipPosition] = useState<{ x: number; y: number } | null>(
    null,
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remotePollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedRef = useRef(false);
  const leavingRef = useRef(false);
  const joinAttemptedRef = useRef(false);
  const switchingCameraRef = useRef(false);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const handlersRef = useRef({
    startTimer: () => { },
    stopTimer: () => { },
    refreshRemoteUsers: async () => false,
    pollForRemoteUsers: () => { },
    stopRemotePoll: () => { },
    exitToBooking: (_endForAll: boolean) => { },
    notifyMeetingEnded: () => { },
    navigateBackToBooking: () => { },
    tearDownSession: () => { },
  });

  const pipDragStart = useRef({ x: 0, y: 0 });
  const pipPositionRef = useRef(pipPosition);
  pipPositionRef.current = pipPosition;

  const pipShellW = PIP_WIDTH;
  const pipShellH = PIP_HEIGHT;

  const defaultPipPosition = useCallback(() => {
    const bottomLimit =
      screenH - pipShellH - CONTROL_BAR_HEIGHT - insets.bottom - widthPixel(12);
    const topLimit = insets.top + widthPixel(56);
    return {
      x: Math.max(8, screenW - pipShellW - widthPixel(16)),
      y: Math.max(topLimit, bottomLimit),
    };
  }, [screenH, screenW, insets.bottom, insets.top, pipShellH, pipShellW]);

  useEffect(() => {
    setPipPosition(defaultPipPosition());
  }, [defaultPipPosition]);

  const clampPip = useCallback(
    (x: number, y: number) => {
      const topLimit = insets.top + widthPixel(56);
      const bottomLimit =
        screenH - pipShellH - CONTROL_BAR_HEIGHT - insets.bottom - widthPixel(8);
      return {
        x: Math.max(8, Math.min(screenW - pipShellW - 8, x)),
        y: Math.max(topLimit, Math.min(bottomLimit, y)),
      };
    },
    [screenH, screenW, insets.bottom, insets.top, pipShellH, pipShellW],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
        onPanResponderGrant: () => {
          const pos = pipPositionRef.current ?? defaultPipPosition();
          pipDragStart.current = { ...pos };
        },
        onPanResponderMove: (_, gesture) => {
          setPipPosition(
            clampPip(
              pipDragStart.current.x + gesture.dx,
              pipDragStart.current.y + gesture.dy,
            ),
          );
        },
      }),
    [clampPip, defaultPipPosition],
  );

  const navigateBackToBooking = useCallback(() => {
    if (bookingId != null) {
      navigation.dispatch(
        StackActions.replace(ROUTES.BOOKING_DETAILS, {
          id: bookingId,
          refreshAfterMeeting: true,
        }),
      );
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [bookingId, navigation]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    if (sessionEndMs == null) return;

    const tick = () => {
      setRemainingSeconds(getRemainingSeconds(sessionEndMs));
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, [sessionEndMs, stopTimer]);

  const stopRemotePoll = useCallback(() => {
    if (remotePollRef.current) {
      clearTimeout(remotePollRef.current);
      remotePollRef.current = null;
    }
  }, []);

  const refreshRemoteUsers = useCallback(async (): Promise<boolean> => {
    try {
      const info = await ZoomVideoService.getSessionInfo();
      const remote = info.remoteUsers?.[0];
      if (remote?.userId) {
        setRemoteUserId(remote.userId);
        setRemoteDisplayName(
          remote.userName || params.doctor_name || params.patient_name || 'Guest',
        );
        setRemoteVideoOn(remote.isVideoOn ?? false);
        setRemoteUserJoined(true);
        setStatusMessage('');
        return true;
      }

      setRemoteUserId(null);
      setRemoteVideoOn(false);
      setRemoteUserJoined(false);
      return false;
    } catch (e) {
      console.log('[VideoSession] refreshRemoteUsers', e);
      return false;
    }
  }, [params.doctor_name, params.patient_name]);

  const pollForRemoteUsers = useCallback(() => {
    stopRemotePoll();
    let attempts = 0;

    const tick = async () => {
      if (leavingRef.current || !joinedRef.current) {
        stopRemotePoll();
        return;
      }

      attempts += 1;
      const found = await refreshRemoteUsers();
      if (found || attempts >= 20) {
        stopRemotePoll();
        return;
      }

      remotePollRef.current = setTimeout(tick, 1500);
    };

    void tick();
  }, [refreshRemoteUsers, stopRemotePoll]);

  const tearDownSession = useCallback(() => {
    setIsInSession(false);
    setMyUserId(null);
    joinedRef.current = false;
    setRemoteUserJoined(false);
    setRemoteUserId(null);
    setRemoteVideoOn(false);
  }, []);

  const exitToBooking = useCallback(
    (endForAll: boolean) => {
      if (leavingRef.current) return;
      leavingRef.current = true;
      ZoomVideoService.markIntentionalLeave();
      stopTimer();
      tearDownSession();
      try {
        ZoomVideoService.leaveSession(endForAll);
      } catch (e) {
        console.log('[VideoSession] leaveSession', e);
      }
      setIsConnecting(false);
      void clearZoomSessionActive();
      navigateBackToBooking();
    },
    [stopTimer, tearDownSession, navigateBackToBooking],
  );

  /** Host ended session (or session closed by SDK) — native alert, then booking details. */
  const notifyMeetingEnded = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    ZoomVideoService.markIntentionalLeave();
    stopTimer();
    tearDownSession();
    setIsConnecting(false);

    Alert.alert(
      'Meeting Ended',
      isHost
        ? 'This meeting has ended.'
        : 'The Doctor has ended this meeting.',
      [
        {
          text: 'OK',
          onPress: () => {
            void clearZoomSessionActive();
            navigateBackToBooking();
          },
        },
      ],
    );
  }, [isHost, stopTimer, tearDownSession, navigateBackToBooking]);

  const confirmLeave = useCallback(() => {
    const title = isHost ? 'End Session' : 'Leave Session';
    const message = isHost
      ? 'End this session for everyone?'
      : 'Leave this video session?';

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: isHost ? 'End Session' : 'Leave',
        style: 'destructive',
        onPress: () => exitToBooking(isHost),
      },
    ]);
  }, [exitToBooking, isHost]);

  handlersRef.current = {
    startTimer,
    stopTimer,
    refreshRemoteUsers,
    pollForRemoteUsers,
    stopRemotePoll,
    exitToBooking,
    notifyMeetingEnded,
    navigateBackToBooking,
    tearDownSession,
  };

  const applyJoinedState = useCallback(async () => {
    if (joinedRef.current) return;
    joinedRef.current = true;
    setIsInSession(true);
    setSessionStatus('In Session');
    setIsConnecting(false);
    try {
      const { userId, isVideoOn: videoOn } =
        await ZoomVideoService.prepareLocalVideo();
      if (userId) {
        setMyUserId(userId);
      }
      setIsVideoOn(videoOn);
      const back = await ZoomVideoService.getActiveCameraIsBack();
      setIsBackCamera(back);
      const speakerOn = await ZoomVideoService.syncSpeakerState();
      setIsSpeakerOn(speakerOn);
    } catch (e) {
      console.log('[VideoSession] prepareLocalVideo', e);
    }
    handlersRef.current.startTimer();
    await handlersRef.current.refreshRemoteUsers();
    handlersRef.current.pollForRemoteUsers();
    await markZoomSessionActive();
  }, []);

  // Release native Zoom session as early as possible on unmount (Metro reload).
  useLayoutEffect(() => {
    return () => {
      leavingRef.current = true;
      if (joinedRef.current) {
        ZoomVideoService.releaseActiveSessionSync();
      }
    };
  }, []);

  // Attach SDK + listeners once (avoid cleanup() during join — it was breaking the session).
  useEffect(() => {
    ZoomVideoService.attach(zoomRef.current);

    const subs = [
      zoomRef.current.addListener(EventType.onSessionJoin, async () => {
        console.log('[VideoSession] onSessionJoin');
        await applyJoinedState();
      }),
      zoomRef.current.addListener(EventType.onSessionLeave, () => {
        console.log('[VideoSession] onSessionLeave');
        if (!leavingRef.current) {
          handlersRef.current.notifyMeetingEnded();
        }
      }),
      zoomRef.current.addListener(EventType.onUserJoin, async () => {
        console.log('[VideoSession] onUserJoin');
        await new Promise<void>(resolve => {
          setTimeout(resolve, 500);
        });
        await handlersRef.current.refreshRemoteUsers();
        handlersRef.current.pollForRemoteUsers();
      }),
      zoomRef.current.addListener(
        EventType.onUserAudioStatusChanged,
        async (event: { changedUsers?: Array<{ userId?: string | number }> }) => {
          const myId = ZoomVideoService.getMyUserId();
          if (!myId) {
            return;
          }

          const changedUsers = event?.changedUsers ?? [];
          const localAudioChanged = changedUsers.some(
            user => String(user?.userId) === String(myId),
          );
          if (!localAudioChanged) {
            return;
          }

          try {
            const speakerOn =
              await ZoomVideoService.refreshSpeakerAfterAudioConnect();
            setIsSpeakerOn(speakerOn);
          } catch (e) {
            console.log('[VideoSession] refreshSpeakerAfterAudioConnect', e);
          }
        },
      ),
      zoomRef.current.addListener(EventType.onUserLeave, () => {
        console.log('[VideoSession] onUserLeave');
        setRemoteUserJoined(false);
        setRemoteUserId(null);
        setRemoteVideoOn(false);
        setStatusMessage('Other person left the session');
      }),
      zoomRef.current.addListener(EventType.onError, (err: unknown) => {
        console.log('[VideoSession] onError', err);
        setIsConnecting(false);
        handlersRef.current.tearDownSession();
        joinedRef.current = false;
        try {
          zoomRef.current.leaveSession(false);
        } catch (e) {
          console.log('[VideoSession] leave on error', e);
        }
        ZoomVideoService.detach();
        const message =
          typeof err === 'object' &&
            err !== null &&
            'errorType' in err &&
            String((err as { errorType?: string }).errorType).includes('Join_Failed')
            ? 'Unable to join the video session. Please try again.'
            : 'Could not continue the video session.';
        Alert.alert('Session Error', message, [
          { text: 'OK', onPress: handlersRef.current.navigateBackToBooking },
        ]);
      }),
      zoomRef.current.addListener(EventType.onUserVideoStatusChanged, async () => {
        await handlersRef.current.refreshRemoteUsers();
      }),
    ];

    return () => {
      leavingRef.current = true;
      subs.forEach(s => s.remove());
      handlersRef.current.stopTimer();
      handlersRef.current.stopRemotePoll();
      const wasJoined = joinedRef.current;
      joinedRef.current = false;
      if (wasJoined) {
        ZoomVideoService.releaseActiveSessionSync();
      }
      ZoomVideoService.detach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only
  }, []);

  // Join once per session credentials
  useEffect(() => {
    if (joinAttemptedRef.current) return;
    joinAttemptedRef.current = true;

    let cancelled = false;

    const join = async () => {
      try {
        await clearZoomSessionActive();

        let staleSession = false;
        try {
          staleSession = await zoomRef.current.isInSession();
        } catch (e) {
          console.log('[VideoSession] isInSession check', e);
        }

        if (staleSession) {
          console.log('[VideoSession] Leaving stale session before join');
          await ZoomVideoService.releaseActiveSession();
          await new Promise<void>(resolve => {
            setTimeout(resolve, 400);
          });
        }
        if (cancelled) return;

        const perms = Platform.select({
          ios: [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE],
          android: [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO],
          default: [],
        });
        const granted = await ensurePermissions(perms);
        if (!granted) {
          setIsConnecting(false);
          Alert.alert(
            'Permissions required',
            'Camera and microphone are required for video sessions.',
            [{ text: 'OK', onPress: navigateBackToBooking }],
          );
          return;
        }

        await ZoomVideoService.initializeSDK(params.session_token);
        if (cancelled) return;

        await ZoomVideoService.joinSession({
          sessionName: params.session_name,
          userName: params.user_name,
          sessionToken: params.session_token,
        });
        if (cancelled) return;

        const inSession = await ZoomVideoService.waitUntilInSession(20000);
        if (cancelled) return;

        if (!inSession) {
          throw new Error('Session join timed out. Please try again.');
        }

        await applyJoinedState();
      } catch (e: any) {
        console.log('[VideoSession] join failed', e);
        if (!cancelled) {
          setIsConnecting(false);
          tearDownSession();
          joinedRef.current = false;
          try {
            zoomRef.current.leaveSession(false);
          } catch (leaveErr) {
            console.log('[VideoSession] leave after join failed', leaveErr);
          }
          ZoomVideoService.detach();
          Alert.alert(
            'Join failed',
            e?.message || 'Unable to join the video session.',
            [{ text: 'OK', onPress: navigateBackToBooking }],
          );
        }
      }
    };

    void join();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- join once for this appointment
  }, [params.session_token, params.session_name, params.user_name]);

  const onToggleVideo = async () => {
    try {
      const on = await ZoomVideoService.toggleVideo();
      setIsVideoOn(on);
    } catch (e) {
      console.log('[VideoSession] toggleVideo', e);
    }
  };

  const onToggleAudio = async () => {
    try {
      const on = await ZoomVideoService.toggleAudio();
      setIsAudioOn(on);
    } catch (e) {
      console.log('[VideoSession] toggleAudio', e);
    }
  };

  const onToggleSpeaker = async () => {
    const requested = !isSpeakerOn;
    console.log('[VideoSession] speaker toggle pressed', {
      platform: Platform.OS,
      requested,
      uiStateBefore: isSpeakerOn,
    });
    try {
      const on = await ZoomVideoService.setSpeakerOn(requested);
      console.log('[VideoSession] speaker toggle complete', {
        requested,
        actual: on,
      });
      setIsSpeakerOn(on);
    } catch (e) {
      console.log('[VideoSession] toggleSpeaker failed', e);
      try {
        const actual = await ZoomVideoService.syncSpeakerState();
        setIsSpeakerOn(actual);
      } catch (syncErr) {
        console.log('[VideoSession] syncSpeakerState after toggle error', syncErr);
      }
    }
  };

  const onSwitchCamera = async () => {
    console.log('[VideoSession] onSwitchCamera called - isInSession:', isInSession, 'isVideoOn:', isVideoOn, 'switching:', switchingCameraRef.current, 'currentIsBack:', isBackCamera);
    if (!isInSession || !isVideoOn || switchingCameraRef.current) {
      console.log('[VideoSession] Switch camera blocked - conditions not met');
      return;
    }
    switchingCameraRef.current = true;
    try {
      const nextBack = !isBackCamera;
      console.log('[VideoSession] Switching camera to:', nextBack ? 'BACK' : 'FRONT');
      const { isBackCamera: actualBack } =
        await ZoomVideoService.switchToFacing(nextBack);
      console.log('[VideoSession] Camera switched, actualBack:', actualBack);
      setIsBackCamera(actualBack);
    } catch (e) {
      console.log('[VideoSession] switchCamera error:', e);
    } finally {
      switchingCameraRef.current = false;
      console.log('[VideoSession] Switch camera completed');
    }
  };

  const remoteLabel =
    remoteDisplayName || params.doctor_name || params.patient_name || 'Participant';
  const waitingForName = isHost
    ? params.patient_name || 'patient'
    : params.doctor_name || 'doctor';
  const waitingTitle = isHost
    ? 'Waiting for patient to join...'
    : 'Waiting for doctor to join...';
  const pipCoords = pipPosition ?? defaultPipPosition();
  const localDisplayName = params.user_name?.trim() || 'You';
  const localInitials = getInitials(localDisplayName);

  const bottomControls = (
    <View
      style={[styles.controls, { paddingBottom: insets.bottom + widthPixel(14) }]}
    >
      <ControlButton
        label={isAudioOn ? 'Mute' : 'Unmute'}
        onPress={onToggleAudio}
      >
        <MicIcon muted={!isAudioOn} />
      </ControlButton>

      <ControlButton
        label={isVideoOn ? 'Camera' : 'Camera off'}
        onPress={onToggleVideo}
        onLongPress={isInSession && isVideoOn ? onSwitchCamera : undefined}
      >
        <CameraIcon off={!isVideoOn} />
      </ControlButton>

      <TouchableOpacity
        style={styles.endBtn}
        onPress={confirmLeave}
        activeOpacity={0.85}
      >
        <Text size={15} weight="bold" color={colors.white}>
          {isHost ? 'End Session' : 'Leave Session'}
        </Text>
      </TouchableOpacity>

      <ControlButton
        label={isSpeakerOn ? 'Speaker' : 'Muted'}
        onPress={onToggleSpeaker}
      >
        <SpeakerIcon
          on={isSpeakerOn}
          color={isSpeakerOn ? colors.white : colors.icon_gray}
        />
      </ControlButton>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />

      {isConnecting ? (
        <>
          <View style={styles.connectingScreen}>
            <Image source={images.logo} style={styles.connectingLogo} resize="contain" />
            <ConnectingStatus />
          </View>
          {bottomControls}
        </>
      ) : (
        <>
          {/* Remote / waiting area */}
          <View style={styles.videoArea}>
            {isInSession && !isConnecting && remoteUserJoined && remoteUserId ? (
              remoteVideoOn ? (
                <SafeZoomView
                  key={`remote-${remoteUserId}`}
                  userId={remoteUserId}
                  style={styles.remoteVideo}
                  videoAspect={VideoAspect.PanAndScan}
                  fullScreen
                />
              ) : (
                <View style={styles.remoteAvatarScreen}>
                  <View style={styles.avatarStack}>
                    <View style={styles.avatarHalo} />
                    <View style={styles.avatarCircle}>
                      <Text size={30} weight="bold" color={colors.white}>
                        {getInitials(remoteLabel)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    size={16}
                    weight="semibold"
                    color={colors.white}
                    style={styles.remoteAvatarName}
                  >
                    {remoteLabel}
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.waitingBox}>
                <View style={styles.avatarStack}>
                  <View style={styles.avatarHalo} />
                  <View style={styles.avatarCircle}>
                    <Text size={30} weight="bold" color={colors.white}>
                      {getInitials(remoteLabel)}
                    </Text>
                  </View>
                </View>
                <Text
                  size={16}
                  weight="semibold"
                  color={colors.white}
                  style={styles.waitingTitle}
                >
                  {statusMessage && remoteUserJoined
                    ? statusMessage
                    : waitingTitle}
                </Text>
                {!remoteUserJoined && (
                  <Text size={13} color={colors.icon_gray} style={styles.waitingSubtitle}>
                    Waiting for {waitingForName}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Draggable local PiP — same pattern as YallaGainDoctor */}
          {isInSession && myUserId ? (
            <View
              style={[
                styles.localPip,
                { left: pipCoords.x, top: pipCoords.y },
              ]}
              {...panResponder.panHandlers}
            >
              {isVideoOn ? (
                <SafeZoomView
                  key={`local-${myUserId}`}
                  userId={myUserId}
                  preview={false}
                  isPiPView
                  videoAspect={VideoAspect.Original}
                  style={styles.localPipVideo}
                />
              ) : (
                <View style={styles.localPipAvatar}>
                  <RNText style={styles.localPipAvatarText}>{localInitials}</RNText>
                </View>
              )}
              <View style={styles.localPipLabel} pointerEvents="none">
                <RNText style={styles.localPipLabelText} numberOfLines={1}>
                  {localDisplayName}
                </RNText>
              </View>
            </View>
          ) : null}

          {/* Header */}
          <View style={[styles.topBar, { paddingTop: insets.top }]}>
            <View style={styles.headerRow}>
              <View style={styles.headerSide}>
                <TouchableOpacity onPress={confirmLeave} style={styles.leaveBtn}>
                  <Icon
                    source={images.back}
                    size={18}
                    tint_color={colors.white}
                    no_padding
                  />
                  <Text size={14} weight="semibold" color={colors.white}>
                    Leave
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.headerCenter}>
                <Text size={16} weight="bold" color={colors.white}>
                  YallaGain
                </Text>
              </View>

              <View style={styles.headerSideRight}>
                <View style={styles.timerWrap}>
                  {isInSession && !isConnecting ? <View style={styles.liveDot} /> : null}
                  <Text size={14} weight="semibold" color={colors.completed}>
                    {sessionEndMs != null
                      ? formatCountdown(remainingSeconds)
                      : '--:--'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom controls */}
          {bottomControls}
        </>
      )}
    </View>
  );
}

export default function VideoSessionScreen() {
  const zoomSdkConfig = useMemo(
    () => ({
      domain: 'zoom.us',
      enableLog: __DEV__,
    }),
    [],
  );

  return (
    <ZoomVideoSdkProvider config={zoomSdkConfig}>
      <VideoSessionContent />
    </ZoomVideoSdkProvider>
  );
}
