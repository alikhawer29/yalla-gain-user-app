import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import UnityView from '@azesmway/react-native-unity';
import UnityViewNativeIOS, {
  UnityViewNativeIOSRef,
} from '../../components/UnityView/UnityViewNativeIOS';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Wrapper from '../../components/Wrapper';
import { navigate } from '../../utils/navigation';
import { NAVIGATORS } from '../../utils/routes';
import { selectUser } from '../../redux/Slices/AuthSlice';

const CreateAvatar = () => {
  // ✅ ALL HOOKS AT TOP LEVEL (before any conditionals)
  const unityRef = useRef<UnityView>(null);
  const unityNativeIOSRef = useRef<UnityViewNativeIOSRef>(null);
  const isFocused = useIsFocused();
  const user = useSelector(selectUser);
  const userId = user?.id;

  const handleUnityMessage = (message: string) => {
    console.log('[UnityMessage]', message);
    
    if (message === 'SaveGame' || message === 'GoBack') {
      navigate(NAVIGATORS.DRAWER as any, {
        screen: NAVIGATORS.BOTTOM,
        params: {
          screen: NAVIGATORS.HOME_STACK,
        },
      });
    }
  };

  // ✅ FIXED: Send userId as JSON format
  useEffect(() => {
    // ✅ No early return - conditional logic inside
    if (isFocused && userId) {
      // Convert userId to JSON format that matches RNReceiver.cs
      // Expects: {"user_id":"2"}
      const userIdJson = JSON.stringify({ user_id: String(userId) });
      
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
                onUnityMessage={(result: { nativeEvent: { message: any } }) => {
                  handleUnityMessage(result.nativeEvent.message);
                }}
              />
            ) : (
              <UnityView
                ref={unityRef}
                style={{ flex: 1 }}
                onUnityMessage={(result: { nativeEvent: { message: any } }) => {
                  handleUnityMessage(result.nativeEvent.message);
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