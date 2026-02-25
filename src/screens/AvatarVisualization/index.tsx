import React, { useEffect, useRef } from 'react';
import { BackHandler, Platform, View } from 'react-native';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import UnityView from '@azesmway/react-native-unity';
import UnityViewNativeIOS, {
  UnityViewNativeIOSRef,
} from '../../components/UnityView/UnityViewNativeIOS';
import { useSelector } from 'react-redux';
import Wrapper from '../../components/Wrapper';
import { selectUser } from '../../redux/Slices/AuthSlice';

const SOCKET_URL = 'https://custom-dev.onlinetestingserver.com:2170/';
const USER_SIGNATURE = '8lW8XtnPDVwHAdXCCoxRROvQUDtf9p2Zlt1HvJSm';
const GAME_OBJECT_MESSAGE_SENT = 'MessageSent';
const EVENT_SOCKET_CONNECTED_GAME = 'SocketConnectedGame';

const AvatarVisualization = () => {
  const navigation = useNavigation();
  const unityRef = useRef<UnityView>(null);
  const unityNativeIOSRef = useRef<UnityViewNativeIOSRef>(null);
  const socketRef = useRef<Socket | null>(null);
  const isFocused = useIsFocused();
  const user = useSelector(selectUser);
  const userId = user?.id;

  // Socket: connect on iOS, wait for Unity SocketConnectedGame then emit sendUserId
  useEffect(() => {
    const isIOS = Platform.OS === 'ios';
    if (!isIOS || !isFocused || userId == null || userId === '') {
      return;
    }
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
      console.error('[AvatarVisualization Socket] io() throw', e);
      return;
    }
    socket.on('connect', () => {
      console.log('[AvatarVisualization Socket] Connected — waiting for Unity message SocketConnectedGame to send user_id');
    });
    socket.on('receiveUserId', (data: { user_id: string }) => {
      console.log('[AvatarVisualization Socket] receiveUserId', data);
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

  const leaveAndUnloadUnity = () => {
    const socket = socketRef.current;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      console.log('[AvatarVisualization] Socket cleaned up');
    }
    if (Platform.OS === 'ios' && unityNativeIOSRef.current) {
      unityNativeIOSRef.current.unloadUnity();
    } else if (Platform.OS === 'android' && unityRef.current) {
      unityRef.current.unloadUnity();
    }
    console.log('[AvatarVisualization] Unity unloadUnity called');
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        const socket = socketRef.current;
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
          socketRef.current = null;
          console.log('[AvatarVisualization] Socket cleaned up on leave');
        }
      };
    }, []),
  );

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
    console.log('[AvatarVisualization UnityMessage]', { gameObject, message });

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
        console.log('[AvatarVisualization Socket] Emitted sendUserId (after Unity SocketConnectedGame)', { user_id: userIdNum });
      } else {
        console.warn('[AvatarVisualization Socket] SocketConnectedGame received but socket not ready', { connected: socket?.connected, userId });
      }
      return;
    }

    if (message === 'SaveGame' || message === 'GoBack') {
      leaveAndUnloadUnity();
    }
  };

  // Send userId to Unity via postMessage (SetUserId) at 5s, 10s, 15s
  useEffect(() => {
    if (!isFocused || !userId) return;
    const userIdJson = JSON.stringify({ user_id: Number(userId) });
    const sendSetUserId = () => {
      try {
        if (Platform.OS === 'ios' && unityNativeIOSRef.current) {
          unityNativeIOSRef.current?.postMessage('RNReceiver', 'SetUserId', userIdJson);
        } else if (Platform.OS === 'android' && unityRef.current) {
          unityRef.current.postMessage('ApiManager', 'SetUserId', userIdJson);
        }
      } catch (error) {
        console.error('[AvatarVisualization SendUserId]', error);
      }
    };
    const timers = [
      setTimeout(sendSetUserId, 5000),
      setTimeout(sendSetUserId, 10000),
      setTimeout(sendSetUserId, 15000),
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [isFocused, userId]);

  useEffect(() => {
    if (Platform.OS === 'android' && unityRef?.current) {
      unityRef.current.windowFocusChanged(isFocused);
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

export default AvatarVisualization;
