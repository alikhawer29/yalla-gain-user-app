import React, { useEffect, useRef, useCallback, useState } from 'react';
import { BackHandler, DeviceEventEmitter, NativeModules, Platform, StyleSheet, View } from 'react-native';
import { io, Socket } from 'socket.io-client';
import UnityView from '@azesmway/react-native-unity';
import UnityViewNativeIOS, {
  UnityViewNativeIOSRef,
} from '../../components/UnityView/UnityViewNativeIOS';
import {
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Wrapper from '../../components/Wrapper';
import { useModal } from '../../contexts/ModalContext';
import { navigate } from '../../utils/navigation';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { NAVIGATORS } from '../../utils/routes';

const SOCKET_URL = 'https://custom-dev.onlinetestingserver.com:2170/';
const USER_SIGNATURE = '8lW8XtnPDVwHAdXCCoxRROvQUDtf9p2Zlt1HvJSm';
const GAME_OBJECT_MESSAGE_SENT = 'MessageSent';
const EVENT_SOCKET_CONNECTED_GAME = 'SocketConnectedGame';

const { UnityLogcatModule } = NativeModules;

const CreateAvatar = () => {
  const { showOkModal } = useModal();
  const unityRef = useRef<UnityView>(null);
  const unityNativeIOSRef = useRef<UnityViewNativeIOSRef>(null);
  const socketRef = useRef<Socket | null>(null);
  const hasSentUserIdRef = useRef(false);
  // Guards against duplicate SaveGame/GoBack messages firing navigation twice.
  const isLeavingRef = useRef(false);
  // When true the <UnityView> is removed from the tree BEFORE we navigate,
  // so Unity tears down cleanly and the next visit always starts fresh.
  const [unityVisible, setUnityVisible] = useState(true);
  // Prevent showing the previous Unity frame on remount.
  // Unity is considered "ready" only after we receive SocketConnectedGame
  // for this visit.
  const [isUnityReady, setIsUnityReady] = useState(false);

  const isFocused = useIsFocused();
  const user = useSelector(selectUser);
  const userId = user?.id;

  // ─── Reset all per-visit state on focus ───────────────────────────────────
  useFocusEffect(
    React.useCallback(() => {
      hasSentUserIdRef.current = false;
      isLeavingRef.current = false;
      setUnityVisible(true);
      setIsUnityReady(false);
    }, []),
  );

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
    } catch (e) {
      console.error('[Socket] io() threw', e);
      return;
    }

    socketRef.current = socket;

    socket.on('connect', () => {
      hasSentUserIdRef.current = false;
      console.log('[Socket] Connected — waiting for Unity SocketConnectedGame');
    });

    socket.on('receiveUserId', (data: { user_id: string }) => {
      console.log('[Socket] receiveUserId ✅', data);
    });

    socket.on('connect_error', (err: Error) => {
      console.error('[Socket] connect_error', err.message);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('[Socket] Disconnected', reason);
    });

    socket.io.on('reconnect_attempt', (attempt: number) => {
      console.log('[Socket] reconnect_attempt', attempt);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isFocused, userId]);

  // ─── Android: Start logcat listener when screen is focused ────────────────
  useEffect(() => {
    if (Platform.OS !== 'android' || !isFocused) return;

    console.log('[UnityLogcat] Starting logcat listener');
    UnityLogcatModule?.startListening();

    return () => {
      console.log('[UnityLogcat] Stopping logcat listener');
      UnityLogcatModule?.stopListening();
    };
  }, [isFocused]);

  // ─── Navigate away helper ──────────────────────────────────────────────────
  const navigateAwayFromCreateAvatar = useCallback(() => {
    navigate(NAVIGATORS.DRAWER as any, {
      screen: NAVIGATORS.BOTTOM,
      params: { screen: NAVIGATORS.HOME_STACK },
    });
  }, []);

  // ─── Leave / Unload Unity ──────────────────────────────────────────────────
  // Key principle (learned from the original simple version of this screen):
  //   Do NOT call unloadUnity(). It is async/slow and causes the "flash of
  //   previous state" on the next visit. Simply removing <UnityView> from the
  //   React tree is enough — Unity resets cleanly on its own when unmounted.
  //
  // Sequence:
  //   1. Guard with isLeavingRef so this only ever fires once per visit.
  //   2. Tear down socket & stop logcat immediately.
  //   3. setUnityVisible(false) → React unmounts <UnityView> synchronously on
  //      the next render. This is the teardown — no unloadUnity() needed.
  //   4. requestAnimationFrame waits for that render to commit, then we
  //      run the optional callback (e.g. show modal) and navigate away.
  const leaveAndKillUnity = useCallback((afterLeave?: () => void) => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;

    // Tear down socket.
    const socket = socketRef.current;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    }

    // Stop logcat on Android.
    if (Platform.OS === 'android') {
      UnityLogcatModule?.stopListening();
    }

    // Unmount <UnityView> — this IS the teardown, no unloadUnity() call needed.
    setUnityVisible(false);

    // Wait one animation frame for React to commit the unmount, then navigate.
    requestAnimationFrame(() => {
      afterLeave?.();
      navigateAwayFromCreateAvatar();
    });
  }, [navigateAwayFromCreateAvatar]);

  // ─── Core Unity message handler ────────────────────────────────────────────
  const handleUnityMessage = useCallback(
    (nativeEvent: { message: string; gameObject?: string } | string) => {
      const message =
        typeof nativeEvent === 'string'
          ? nativeEvent
          : (nativeEvent?.message ?? '');
      const gameObject =
        typeof nativeEvent === 'string' ? undefined : nativeEvent?.gameObject;

      console.log('[UnityMessage] ✅', { gameObject, message });

      const isSocketConnectedGame =
        message === EVENT_SOCKET_CONNECTED_GAME ||
        message === `${EVENT_SOCKET_CONNECTED_GAME}()` ||
        message.includes(EVENT_SOCKET_CONNECTED_GAME) ||
        message.includes(`${GAME_OBJECT_MESSAGE_SENT}:${EVENT_SOCKET_CONNECTED_GAME}`) ||
        gameObject === GAME_OBJECT_MESSAGE_SENT;

      if (isSocketConnectedGame) {
        setIsUnityReady(true);
        if (hasSentUserIdRef.current) {
          console.log('[CreateAvatar] sendUserId already sent, ignoring duplicate SocketConnectedGame');
          return;
        }
        hasSentUserIdRef.current = true;
        console.log('[UnityMessage] SocketConnectedGame — emitting sendUserId');

        const socket = socketRef.current;
        if (socket?.connected && userId) {
          const userIdNum = Number(userId);
          socket.emit('sendUserId', {
            user_id: userIdNum,
            signature: USER_SIGNATURE,
          });
          console.log('[Socket] Emitted sendUserId ✅', { user_id: userIdNum });
        } else {
          console.warn('[Socket] SocketConnectedGame but socket not ready', {
            connected: socket?.connected,
            userId,
          });
        }
        return;
      }

      if (message === 'SaveGame') {
        leaveAndKillUnity(() => {
          showOkModal({
            type: 'success',
            title: 'Success',
            message: 'Avatar Saved Successfully',
          });
        });
      } else if (message === 'GoBack') {
        leaveAndKillUnity();
      }
    },
    [userId, leaveAndKillUnity, showOkModal],
  );

  // ─── Android: DeviceEventEmitter listener ─────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'android' || !isFocused) return;

    const normaliseLogcatMessage = (
      raw: string | { message: string },
    ): string => {
      const text = typeof raw === 'string' ? raw : (raw?.message ?? '');

      const rnReceiverMatch = text.match(/RNReceiver[:\s]+(\w+)/i);
      if (rnReceiverMatch) return rnReceiverMatch[1];

      if (/GoBack/i.test(text)) return 'GoBack';
      if (/SaveGame/i.test(text)) return 'SaveGame';
      if (/SocketConnectedGame/i.test(text)) return 'SocketConnectedGame';

      return text;
    };

    const subscription = DeviceEventEmitter.addListener(
      'UnityMessage',
      (raw: string | { message: string }) => {
        console.log('[DeviceEventEmitter] UnityMessage RAW ✅', raw);
        const normalised = normaliseLogcatMessage(raw);
        console.log('[DeviceEventEmitter] UnityMessage NORMALISED ✅', normalised);
        handleUnityMessage(normalised);
      },
    );

    return () => subscription.remove();
  }, [isFocused, handleUnityMessage]);

  // ─── Clean up socket on focus loss ────────────────────────────────────────
  useFocusEffect(
    React.useCallback(() => {
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

  // ─── Send userId to Unity via postMessage ─────────────────────────────────
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
        console.error('[SendUserId] Error:', error);
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
  // The render gate is `isFocused && unityVisible`.
  //
  // - isFocused:    standard focus guard, same as the original simple version.
  // - unityVisible: flipped to false by leaveAndKillUnity() before navigation,
  //                 so the Unity view is always unmounted cleanly. It is reset
  //                 back to true by useFocusEffect on the next visit.
  return (
    <Wrapper>
      <View style={{ flex: 1 }}>
        {isFocused && unityVisible && (
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
                  console.log('[UnityView] RAW Unity message received:', result);
                  const nativeEvent = result?.nativeEvent ?? result;
                  const message = nativeEvent?.message ?? String(result ?? '');
                  const gameObject = nativeEvent?.gameObject;
                  console.log('[UnityView] Parsed Unity message:', { message, gameObject });
                  handleUnityMessage({ message, gameObject });
                }}
              />
            )}

            {!isUnityReady && (
              <View
                pointerEvents="none"
                style={styles.unityLoadingOverlay}
              />
            )}
          </>
        )}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  // Solid black overlay while Unity reloads its scene.
  // This hides the previous Unity frame that may show briefly on remount.
  unityLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
});

export default CreateAvatar;