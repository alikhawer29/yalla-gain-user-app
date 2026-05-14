import React, { useEffect, useRef, useCallback, useState } from 'react';
import { BackHandler, DeviceEventEmitter, NativeModules, Platform, View } from 'react-native';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import UnityView from '@azesmway/react-native-unity';
import UnityViewNativeIOS, {
  UnityViewNativeIOSRef,
} from '../../components/UnityView/UnityViewNativeIOS';
import { useSelector } from 'react-redux';
import Wrapper from '../../components/Wrapper';
import { useModal } from '../../contexts/ModalContext';
import { usePostBodyMeasurementsMutation } from '../../redux/Apis/User';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { SOCKET_SERVER_URL } from '../../utils/data';
import UnitySplashOverlay from '../../components/UnitySplashOverlay';

const SOCKET_URL = `${SOCKET_SERVER_URL}/`;
const USER_SIGNATURE = '8lW8XtnPDVwHAdXCCoxRROvQUDtf9p2Zlt1HvJSm';
const GAME_OBJECT_MESSAGE_SENT = 'MessageSent';
const EVENT_SOCKET_CONNECTED_GAME = 'SocketConnectedGame';

const { UnityLogcatModule } = NativeModules;

const AvatarVisualization = () => {
  const navigation = useNavigation();
  const { showOkModal } = useModal();
  const unityRef = useRef<UnityView>(null);
  const unityNativeIOSRef = useRef<UnityViewNativeIOSRef>(null);
  const socketRef = useRef<Socket | null>(null);
  const hasSentUserIdRef = useRef(false);
  const isSharingBodyMeasurementsRef = useRef(false);
  const isFocused = useIsFocused();
  const user = useSelector(selectUser);
  const userId = user?.id;
  const [postBodyMeasurements] = usePostBodyMeasurementsMutation();
  // Prevent showing previous Unity frame until Unity signals SocketConnectedGame.
  const [isUnityReady, setIsUnityReady] = useState(false);

  // ─── Socket Setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isFocused || userId == null || userId === '') return;

    let socket: Socket;
    try {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true,
      });
      socketRef.current = socket;
    } catch (e) {
      console.error('[AvatarVisualization Socket] io() threw', e);
      return;
    }

    socket.on('connect', () => {
      hasSentUserIdRef.current = false;
      console.log('[AvatarVisualization Socket] Connected — waiting for Unity SocketConnectedGame');
    });

    socket.on('receiveUserId', (data: { user_id: string }) => {
      console.log('[AvatarVisualization Socket] receiveUserId ✅', data);
    });

    socket.on('connect_error', (err: Error) => {
      console.error('[AvatarVisualization Socket] connect_error', err.message);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('[AvatarVisualization Socket] Disconnected', reason);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isFocused, userId]);

  // ─── Android: Start logcat listener ───────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'android' || !isFocused) return;

    console.log('[UnityLogcat] Starting logcat listener');
    UnityLogcatModule?.startListening();

    return () => {
      console.log('[UnityLogcat] Stopping logcat listener');
      UnityLogcatModule?.stopListening();
    };
  }, [isFocused]);

  // ─── Leave / Unload Unity ──────────────────────────────────────────────────
  const leaveAndUnloadUnity = useCallback(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    }
    if (Platform.OS === 'android') {
      UnityLogcatModule?.stopListening();
    }
    // Just navigate away — Unity unloads naturally when the view unmounts.
    // Calling unloadUnity() while Unity is still rendering causes a SIGSEGV crash.
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const normaliseUnityMessage = useCallback(
    (raw: string | { message: string }): string => {
      const text = typeof raw === 'string' ? raw : (raw?.message ?? '');
      const rnReceiverMatch = text.match(/RNReceiver[:\s]+(\w+)/i);

      if (rnReceiverMatch) return rnReceiverMatch[1];

      if (/^GoBack(?:\(\))?$/i.test(text)) return 'GoBack';
      if (/^SaveGame(?:\(\))?$/i.test(text)) return 'SaveGame';
      if (/^ShareAvatar(?:\(\))?$/i.test(text)) return 'ShareAvatar';
      if (/SocketConnectedGame/i.test(text)) return 'SocketConnectedGame';

      return text;
    },
    [],
  );

  const handleShareAvatar = useCallback(async () => {
    if (isSharingBodyMeasurementsRef.current) {
      console.log('[AvatarVisualization] ShareAvatar already in progress, ignoring duplicate event');
      return;
    }

    isSharingBodyMeasurementsRef.current = true;

    try {
      await postBodyMeasurements(undefined).unwrap();
      showOkModal({
        type: 'success',
        title: 'Success',
        message: 'Body measurements shared successfully.',
      });
    } catch (error: any) {
      console.error('[AvatarVisualization] ShareAvatar failed', error);
      showOkModal({
        type: 'error',
        title: 'Error',
        message:
          error?.data?.message ||
          'Failed to share body measurements. Please try again.',
      });
    } finally {
      isSharingBodyMeasurementsRef.current = false;
    }
  }, [postBodyMeasurements, showOkModal]);

  // ─── Core Unity message handler ────────────────────────────────────────────
  const handleUnityMessage = useCallback(
    (nativeEvent: { message: string; gameObject?: string } | string) => {
      const message =
        typeof nativeEvent === 'string'
          ? nativeEvent
          : (nativeEvent?.message ?? '');
      const gameObject =
        typeof nativeEvent === 'string' ? undefined : nativeEvent?.gameObject;
      const normalisedMessage = normaliseUnityMessage(message);

      console.log('[AvatarVisualization UnityMessage] ✅', {
        gameObject,
        message,
        normalisedMessage,
      });

      const isSocketConnectedGame =
        normalisedMessage === EVENT_SOCKET_CONNECTED_GAME ||
        message === EVENT_SOCKET_CONNECTED_GAME ||
        message === `${EVENT_SOCKET_CONNECTED_GAME}()` ||
        message.includes(EVENT_SOCKET_CONNECTED_GAME) ||
        message.includes(`${GAME_OBJECT_MESSAGE_SENT}:${EVENT_SOCKET_CONNECTED_GAME}`) ||
        gameObject === GAME_OBJECT_MESSAGE_SENT;

      if (isSocketConnectedGame) {
        setIsUnityReady(true);
        if (hasSentUserIdRef.current) {
          console.log('[AvatarVisualization] sendUserId already sent, ignoring duplicate SocketConnectedGame');
          return;
        }
        hasSentUserIdRef.current = true;
        const socket = socketRef.current;
        if (socket?.connected && userId) {
          const userIdNum = Number(userId);
          socket.emit('sendUserId', {
            user_id: userIdNum,
            signature: USER_SIGNATURE,
          });
          console.log('[AvatarVisualization Socket] Emitted sendUserId ✅', { user_id: userIdNum });
        } else {
          console.warn('[AvatarVisualization Socket] SocketConnectedGame but socket not ready', {
            connected: socket?.connected,
            userId,
          });
        }
        return;
      }

      if (normalisedMessage === 'ShareAvatar') {
        void handleShareAvatar();
      } else if (normalisedMessage === 'SaveGame') {
        leaveAndUnloadUnity();
        showOkModal({
          type: 'success',
          title: 'Success',
          message: 'Avatar Saved Successfully',
        });
      } else if (normalisedMessage === 'GoBack') {
        leaveAndUnloadUnity();
      }
    },
    [userId, leaveAndUnloadUnity, normaliseUnityMessage, handleShareAvatar, showOkModal],
  );

  // ─── Android: DeviceEventEmitter listener ─────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'android' || !isFocused) return;

    const subscription = DeviceEventEmitter.addListener(
      'UnityMessage',
      (message: string | { message: string }) => {
        console.log('[AvatarVisualization DeviceEventEmitter] UnityMessage ✅', message);
        handleUnityMessage(message);
      },
    );

    return () => subscription.remove();
  }, [isFocused, handleUnityMessage]);

  // ─── Clean up socket on focus loss ────────────────────────────────────────
  useFocusEffect(
    React.useCallback(() => {
      setIsUnityReady(false);
      return () => {
        const socket = socketRef.current;
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
          socketRef.current = null;
        }
      };
    }, []),
  );

  // ─── Block Android hardware back ──────────────────────────────────────────
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => sub.remove();
      }
      return undefined;
    }, []),
  );


  // Send userId to Unity via postMessage (SetUserId) at 5s, 10s, 15s
  useEffect(() => {
    if (!isFocused || !userId) return;

    const userIdJson = JSON.stringify({ user_id: Number(userId) });

    const sendSetUserId = () => {
      try {
        if (Platform.OS === 'ios' && unityNativeIOSRef.current) {
          unityNativeIOSRef.current.postMessage('RNReceiver', 'SetUserId', userIdJson);
        } else if (Platform.OS === 'android' && unityRef.current) {
          unityRef.current.postMessage('ApiManager', 'SetUserId', userIdJson);
        }
      } catch (error) {
        console.error('[AvatarVisualization SendUserId] Error:', error);
      }
    };

    const timers = [
      setTimeout(sendSetUserId, 5000),
      setTimeout(sendSetUserId, 10000),
      setTimeout(sendSetUserId, 15000),
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, [isFocused, userId]);

  // ─── Sync Android window focus ─────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS === 'android' && unityRef?.current) {
      unityRef.current.windowFocusChanged(isFocused);
    }
  }, [isFocused]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Wrapper>
      <View style={{ flex: 1 }}>
        {isFocused && (
          <>
            {Platform.OS === 'ios' ? (
              <UnityViewNativeIOS
                ref={unityNativeIOSRef}
                style={{ flex: 1 }}
                pointerEvents="box-none"
                onUnityMessage={(result: {
                  nativeEvent: { message: string; gameObject?: string };
                }) => {
                  handleUnityMessage(result.nativeEvent);
                }}
              />
            ) : (
              <UnityView
                ref={unityRef}
                style={{ flex: 1 }}
                onUnityMessage={(result: any) => {
                  const nativeEvent = result?.nativeEvent ?? result;
                  const message = nativeEvent?.message ?? String(result ?? '');
                  const gameObject = nativeEvent?.gameObject;
                  handleUnityMessage({ message, gameObject });
                }}
              />
            )}

            <UnitySplashOverlay unityReady={isUnityReady} />
          </>
        )}
      </View>
    </Wrapper>
  );
};

export default AvatarVisualization;