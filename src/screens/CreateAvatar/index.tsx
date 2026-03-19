import React, { useEffect, useRef, useCallback } from 'react';
import { BackHandler, DeviceEventEmitter, NativeModules, Platform, View } from 'react-native';
import { io, Socket } from 'socket.io-client';
import UnityView from '@azesmway/react-native-unity';
import UnityViewNativeIOS, {
  UnityViewNativeIOSRef,
} from '../../components/UnityView/UnityViewNativeIOS';
import {
  CommonActions,
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Wrapper from '../../components/Wrapper';
import { useModal } from '../../contexts/ModalContext';
import { navigate } from '../../utils/navigation';
import { NAVIGATORS, ROUTES } from '../../utils/routes';
import { selectUser } from '../../redux/Slices/AuthSlice';

const SOCKET_URL = 'https://custom-dev.onlinetestingserver.com:2170/';
const USER_SIGNATURE = '8lW8XtnPDVwHAdXCCoxRROvQUDtf9p2Zlt1HvJSm';
const GAME_OBJECT_MESSAGE_SENT = 'MessageSent';
const EVENT_SOCKET_CONNECTED_GAME = 'SocketConnectedGame';

const { UnityLogcatModule } = NativeModules;

const CreateAvatar = () => {
  const navigation = useNavigation();
  const { showOkModal } = useModal();
  const unityRef = useRef<UnityView>(null);
  const unityNativeIOSRef = useRef<UnityViewNativeIOSRef>(null);
  const socketRef = useRef<Socket | null>(null);
  const hasSentUserIdRef = useRef(false);
  const isFocused = useIsFocused();
  const user = useSelector(selectUser);
  const userId = user?.id;

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
  // UnityLogcatModule clears the buffer on start so only NEW Unity logs are read.
  // When Unity fires SocketConnectedGame, the module emits 'UnityMessage' via
  // DeviceEventEmitter which is picked up by the listener below.
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
    const stack = navigation.getParent();
    if (stack) {
      stack.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROUTES.AVATAR_SCAN_FORM as never }],
        }),
      );
    }
    navigate(NAVIGATORS.DRAWER as any, {
      screen: NAVIGATORS.BOTTOM,
      params: { screen: NAVIGATORS.HOME_STACK },
    });
  }, [navigation]);

  // ─── Leave / Unload Unity ──────────────────────────────────────────────────
  const leaveAndKillUnity = useCallback(() => {
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
    navigateAwayFromCreateAvatar();
  }, [navigateAwayFromCreateAvatar]);

  // ─── Core Unity message handler ────────────────────────────────────────────
  // iOS  → called from onUnityMessage prop on UnityViewNativeIOS
  // Android → called from DeviceEventEmitter('UnityMessage') via logcat module
  // const handleUnityMessage = useCallback(
  //   (nativeEvent: { message: string; gameObject?: string } | string) => {
  //     const message =
  //       typeof nativeEvent === 'string'
  //         ? nativeEvent
  //         : (nativeEvent?.message ?? '');
  //     const gameObject =
  //       typeof nativeEvent === 'string' ? undefined : nativeEvent?.gameObject;

  //     console.log('[UnityMessage] ✅', { gameObject, message });

  //     const isSocketConnectedGame =
  //       message === EVENT_SOCKET_CONNECTED_GAME ||
  //       message === `${EVENT_SOCKET_CONNECTED_GAME}()` ||
  //       message.includes(EVENT_SOCKET_CONNECTED_GAME) ||
  //       message.includes(`${GAME_OBJECT_MESSAGE_SENT}:${EVENT_SOCKET_CONNECTED_GAME}`) ||
  //       gameObject === GAME_OBJECT_MESSAGE_SENT;

  //     if (isSocketConnectedGame) {
  //       if (hasSentUserIdRef.current) {
  //         console.log('[CreateAvatar] sendUserId already sent, ignoring duplicate SocketConnectedGame');
  //         return;
  //       }
  //       hasSentUserIdRef.current = true;
  //       console.log('[UnityMessage] SocketConnectedGame — emitting sendUserId');
  //       const socket = socketRef.current;
  //       if (socket?.connected && userId) {
  //         const userIdNum = Number(userId);
  //         socket.emit('sendUserId', {
  //           user_id: userIdNum,
  //           signature: USER_SIGNATURE,
  //         });
  //         console.log('[Socket] Emitted sendUserId ✅', { user_id: userIdNum });
  //       } else {
  //         console.warn('[Socket] SocketConnectedGame but socket not ready', {
  //           connected: socket?.connected,
  //           userId,
  //         });
  //       }
  //       return;
  //     }

  //     if (message === 'SaveGame' || message === 'GoBack') {
  //       leaveAndKillUnity();
  //     }
  //   },
  //   [userId, leaveAndKillUnity],
  // );

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
        leaveAndKillUnity();
        showOkModal({
          type: 'success',
          title: 'Success',
          message: 'Avatar Saved Successfully',
        });
      } else if (message === 'GoBack') {
        leaveAndKillUnity();
      }
    },
    [userId, leaveAndKillUnity],
  );

  // ─── Android: DeviceEventEmitter listener ─────────────────────────────────
  // Receives messages forwarded from UnityLogcatModule
  useEffect(() => {
    if (Platform.OS !== 'android' || !isFocused) return;

    const subscription = DeviceEventEmitter.addListener(
      'UnityMessage',
      (message: string | { message: string }) => {
        console.log('[DeviceEventEmitter] UnityMessage ✅', message);
        handleUnityMessage(message);
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

  // const handleUnityMessage = (nativeEvent: {
  //   message: string;
  //   gameObject?: string;
  // }) => {
  //   const message = nativeEvent.message ?? '';
  //   const gameObject = nativeEvent.gameObject;
  //   console.log('[UnityMessage]', { gameObject, message });

  //   const isSocketConnectedGame =
  //     (gameObject === GAME_OBJECT_MESSAGE_SENT &&
  //       message === EVENT_SOCKET_CONNECTED_GAME) ||
  //     (!gameObject && message === EVENT_SOCKET_CONNECTED_GAME) ||
  //     (message.includes(GAME_OBJECT_MESSAGE_SENT) &&
  //       message.includes(EVENT_SOCKET_CONNECTED_GAME));

  //   if (isSocketConnectedGame) {
  //     const socket = socketRef.current;
  //     if (socket?.connected && userId) {
  //       const userIdNum = Number(userId);
  //       socket.emit('sendUserId', {
  //         user_id: userIdNum,
  //         signature: USER_SIGNATURE,
  //       });
  //       console.log(
  //         '[Socket] Emitted sendUserId (after Unity MessageSent/SocketConnectedGame)',
  //         { user_id: userIdNum },
  //       );
  //     } else {
  //       console.warn(
  //         '[Socket] SocketConnectedGame received but socket not ready',
  //         { connected: socket?.connected, userId },
  //       );
  //     }
  //     return;
  //   }

  //   if (message === 'SaveGame') {
  //     leaveAndKillUnity();
  //     showOkModal({
  //       type: 'success',
  //       title: 'Success',
  //       message: 'Avatar Saved Successfully',
  //     });
  //   } else if (message === 'GoBack') {
  //     leaveAndKillUnity();
  //   }
  // };

  // ✅ FIXED: Send userId as JSON format
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
                // androidKeepPlayerMounted={false}
              />
            )}
          </>
        )}
      </View>
    </Wrapper>
  );
};

export default CreateAvatar;