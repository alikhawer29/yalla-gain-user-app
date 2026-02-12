import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, View } from 'react-native';
import { io, Socket } from 'socket.io-client';
import UnityView from '@azesmway/react-native-unity';
import UnityViewNativeIOS, {
  UnityViewNativeIOSRef,
} from '../../components/UnityView/UnityViewNativeIOS';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Wrapper from '../../components/Wrapper';
import { navigate } from '../../utils/navigation';
import { NAVIGATORS } from '../../utils/routes';
import { selectUser } from '../../redux/Slices/AuthSlice';

const SOCKET_URL = 'https://custom-dev.onlinetestingserver.com:2170/';
const USER_SIGNATURE = '8lW8XtnPDVwHAdXCCoxRROvQUDtf9p2Zlt1HvJSm';

const CreateAvatar = () => {
  // ✅ ALL HOOKS AT TOP LEVEL (before any conditionals)
  const unityRef = useRef<UnityView>(null);
  const unityNativeIOSRef = useRef<UnityViewNativeIOSRef>(null);
  const socketRef = useRef<Socket | null>(null);
  const isFocused = useIsFocused();
  const user = useSelector(selectUser);
  const userId = user?.id;

  // Debug: log every time CreateAvatar renders (proves component + bundle is current)
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log('[CreateAvatar] render', renderCountRef.current, Platform.OS, isFocused, userId);

  // Socket: connect, emit sendUserId, listen for receiveUserId (iOS only)
  useEffect(() => {
    const isIOS = Platform.OS === 'ios';
    console.log('[Socket] Effect run', { isIOS, isFocused, userId });

    if (!isIOS) {
      console.log('[Socket] Skip: not iOS');
      return;
    }
    if (!isFocused) {
      console.log('[Socket] Skip: not focused');
      return;
    }
    if (userId == null || userId === '') {
      console.log('[Socket] Skip: no userId', userId);
      return;
    }

    console.log('[Socket] Setup (iOS)', SOCKET_URL, 'userId:', userId);

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
      console.log('[Socket] io() created', socket.id ?? 'no id yet');
    } catch (e) {
      console.error('[Socket] io() throw', e);
      return;
    }

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected — waiting for Unity message SocketConnectedGame to send user_id');
    });

    socket.on('receiveUserId', (data: { user_id: string }) => {
      console.log('[Socket] receiveUserId', data);
    });

    socket.on('connect_error', (err: Error) => {
      console.error('[Socket] connect_error', err.message, err);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('[Socket] Disconnected', reason);
    });

    socket.io.on('reconnect_attempt', (attempt: number) => {
      console.log('[Socket] reconnect_attempt', attempt);
    });

    return () => {
      console.log('[Socket] Cleanup');
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isFocused, userId]);

  const GAME_OBJECT_MESSAGE_SENT = 'MessageSent';
  const EVENT_SOCKET_CONNECTED_GAME = 'SocketConnectedGame';

  const navigateAwayFromCreateAvatar = () => {
    navigate(NAVIGATORS.DRAWER as any, {
      screen: NAVIGATORS.BOTTOM,
      params: { screen: NAVIGATORS.HOME_STACK },
    });
  };

  /** Kill Unity and socket, then navigate. Uses @azesmway/react-native-unity unloadUnity() (same pattern as package). */
  const leaveAndKillUnity = () => {
    const socket = socketRef.current;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      console.log('[CreateAvatar] Socket cleaned up (back)');
    }
    if (Platform.OS === 'ios' && unityNativeIOSRef.current) {
      unityNativeIOSRef.current.unloadUnity();
    } else if (Platform.OS === 'android' && unityRef.current) {
      unityRef.current.unloadUnity();
    }
    console.log('[CreateAvatar] Unity unloadUnity called (back)');
    navigateAwayFromCreateAvatar();
  };

  // Fallback: clean up socket when leaving by any other means (e.g. tab/drawer)
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        const socket = socketRef.current;
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
          socketRef.current = null;
          console.log('[CreateAvatar] Socket cleaned up on leave');
        }
      };
    }, []),
  );

  // Disable hardware back (Android) and rely on in-screen back button only
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => sub.remove();
      }
      return undefined;
    }, []),
  );

  const handleUnityMessage = (nativeEvent: { message: string; gameObject?: string }) => {
    const message = nativeEvent.message ?? '';
    const gameObject = nativeEvent.gameObject;
    console.log('[UnityMessage]', { gameObject, message });

    const isSocketConnectedGame =
      (gameObject === GAME_OBJECT_MESSAGE_SENT && message === EVENT_SOCKET_CONNECTED_GAME) ||
      (!gameObject && message === EVENT_SOCKET_CONNECTED_GAME) ||
      (message.includes(GAME_OBJECT_MESSAGE_SENT) && message.includes(EVENT_SOCKET_CONNECTED_GAME));

    if (isSocketConnectedGame) {
      const socket = socketRef.current;
      if (socket?.connected && userId) {
        const userIdNum = Number(userId);
        socket.emit('sendUserId', {
          user_id: userIdNum,
          signature: USER_SIGNATURE,
        });
        console.log('[Socket] Emitted sendUserId (after Unity MessageSent/SocketConnectedGame)', { user_id: userIdNum });
      } else {
        console.warn('[Socket] SocketConnectedGame received but socket not ready', { connected: socket?.connected, userId });
      }
      return;
    }

    if (message === 'SaveGame' || message === 'GoBack') {
      leaveAndKillUnity();
    }
  };

  // ✅ FIXED: Send userId as JSON format
  useEffect(() => {
    // ✅ No early return - conditional logic inside
    if (isFocused && userId) {
      // Convert userId to JSON format that matches RNReceiver.cs
      // Expects: {"user_id":2} (number)
      const userIdJson = JSON.stringify({ user_id: Number(userId) });
      console.log('[CreateAvatar] SendUserId effect (Socket code is in this file)');
      console.log('[SendUserId] JSON payload:', userIdJson);

      const sendSetUserId = () => {
        try {
          if (Platform.OS === 'ios' && unityNativeIOSRef.current) {
            console.log('[SendUserId-iOS] Sending...');
            unityNativeIOSRef.current?.postMessage(
              'RNReceiver',
              'SetUserId',
              userIdJson,
            );
            console.log('[SendUserId-iOS] ✅ Sent');
          } else if (Platform.OS === 'android' && unityRef.current) {
            console.log('[SendUserId-Android] Sending...');
            unityRef.current.postMessage(
              'ApiManager',
              'SetUserId',
              userIdJson,
            );
            console.log('[SendUserId-Android] ✅ Sent');
          }
        } catch (error) {
          console.error('[SendUserId] Error:', error);
        }
      };

      // Send at intervals: 5s, 10s, 15s
      const timers = [
        setTimeout(sendSetUserId, 5000),
        setTimeout(sendSetUserId, 10000),
        setTimeout(sendSetUserId, 15000),
      ];

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [isFocused, userId]);

  // ✅ Android window focus handling
  useEffect(() => {
    if (Platform.OS === 'android' && unityRef?.current) {
      unityRef?.current?.windowFocusChanged(isFocused);
    }
  }, [isFocused]);

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
                onUnityMessage={(result: { nativeEvent: { message: string; gameObject?: string } }) => {
                  handleUnityMessage(result.nativeEvent);
                }}
              />
            ) : (
              <UnityView
                ref={unityRef}
                style={{ flex: 1 }}
                onUnityMessage={(result: { nativeEvent: { message: string; gameObject?: string } }) => {
                  handleUnityMessage(result.nativeEvent);
                }}
              />
            )}
          </>
        )}
      </View>
    </Wrapper>
  );
};

export default CreateAvatar;