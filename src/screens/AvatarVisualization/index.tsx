import React, { useEffect, useRef, useCallback } from 'react';
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
import { selectUser } from '../../redux/Slices/AuthSlice';

const SOCKET_URL = 'https://custom-dev.onlinetestingserver.com:2170/';
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

  // ─── Core Unity message handler ────────────────────────────────────────────
  const handleUnityMessage = useCallback(
    (nativeEvent: { message: string; gameObject?: string } | string) => {
      const message =
        typeof nativeEvent === 'string'
          ? nativeEvent
          : (nativeEvent?.message ?? '');
      const gameObject =
        typeof nativeEvent === 'string' ? undefined : nativeEvent?.gameObject;

      console.log('[AvatarVisualization UnityMessage] ✅', { gameObject, message });

      const isSocketConnectedGame =
        message === EVENT_SOCKET_CONNECTED_GAME ||
        message === `${EVENT_SOCKET_CONNECTED_GAME}()` ||
        message.includes(EVENT_SOCKET_CONNECTED_GAME) ||
        message.includes(`${GAME_OBJECT_MESSAGE_SENT}:${EVENT_SOCKET_CONNECTED_GAME}`) ||
        gameObject === GAME_OBJECT_MESSAGE_SENT;

      if (isSocketConnectedGame) {
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

      if (message === 'SaveGame') {
        leaveAndUnloadUnity();
        showOkModal({
          type: 'success',
          title: 'Success',
          message: 'Avatar Saved Successfully',
        });
      } else if (message === 'GoBack') {
        leaveAndUnloadUnity();
      }
    },
    [userId, leaveAndUnloadUnity],
  );
  //ios working
  // const handleUnityMessage = useCallback(
  //   (nativeEvent: { message: string; gameObject?: string } | string) => {
  //     const message =
  //       typeof nativeEvent === 'string'
  //         ? nativeEvent
  //         : (nativeEvent?.message ?? '');
  //     const gameObject =
  //       typeof nativeEvent === 'string' ? undefined : nativeEvent?.gameObject;

  //     console.log('[AvatarVisualization UnityMessage] ✅', { gameObject, message });

  //     const isSocketConnectedGame =
  //       message === EVENT_SOCKET_CONNECTED_GAME ||
  //       message === `${EVENT_SOCKET_CONNECTED_GAME}()` ||
  //       message.includes(EVENT_SOCKET_CONNECTED_GAME) ||
  //       message.includes(`${GAME_OBJECT_MESSAGE_SENT}:${EVENT_SOCKET_CONNECTED_GAME}`) ||
  //       gameObject === GAME_OBJECT_MESSAGE_SENT;

  //     if (isSocketConnectedGame) {
  //       if (hasSentUserIdRef.current) {
  //         console.log('[AvatarVisualization] sendUserId already sent, ignoring duplicate SocketConnectedGame');
  //         return;
  //       }
  //       hasSentUserIdRef.current = true;
  //       const socket = socketRef.current;
  //       if (socket?.connected && userId) {
  //         const userIdNum = Number(userId);
  //         socket.emit('sendUserId', {
  //           user_id: userIdNum,
  //           signature: USER_SIGNATURE,
  //         });
  //         console.log('[AvatarVisualization Socket] Emitted sendUserId ✅', { user_id: userIdNum });
  //       } else {
  //         console.warn('[AvatarVisualization Socket] SocketConnectedGame but socket not ready', {
  //           connected: socket?.connected,
  //           userId,
  //         });
  //       }
  //       return;
  //     }

  //     if (message === 'SaveGame' || message === 'GoBack') {
  //       leaveAndUnloadUnity();
  //     }
  //   },
  //   [userId, leaveAndUnloadUnity],
  // );
  // const handleUnityMessage = (nativeEvent: {
  //   message: string;
  //   gameObject?: string;
  // }) => {
  //   const message = nativeEvent.message ?? '';
  //   const gameObject = nativeEvent.gameObject;
  //   console.log('[AvatarVisualization UnityMessage]', { gameObject, message });

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
  //         '[AvatarVisualization Socket] Emitted sendUserId (after Unity SocketConnectedGame)',
  //         { user_id: userIdNum },
  //       );
  //     } else {
  //       console.warn(
  //         '[AvatarVisualization Socket] SocketConnectedGame received but socket not ready',
  //         { connected: socket?.connected, userId },
  //       );
  //     }
  //     return;
  //   }

  //   if (message === 'SaveGame') {
  //     leaveAndUnloadUnity();
  //     showOkModal({
  //       type: 'success',
  //       title: 'Success',
  //       message: 'Avatar Saved Successfully',
  //     });
  //   } else if (message === 'GoBack') {
  //     leaveAndUnloadUnity();
  //   }
  // };


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
          </>
        )}
      </View>
    </Wrapper>
  );
};

export default AvatarVisualization;