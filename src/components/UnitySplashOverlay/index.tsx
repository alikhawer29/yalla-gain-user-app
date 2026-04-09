import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import images from '../../assets/images';

/** Full-opacity splash while loading; slow fade-out when Unity is ready. */
const FADE_OUT_MS = 600;

type Props = {
  /** When true, splash fades out and is removed. When false, splash is shown at full opacity. */
  unityReady: boolean;
};

const UnitySplashOverlay: React.FC<Props> = ({ unityReady }) => {
  const [layerMounted, setLayerMounted] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!unityReady) {
      setLayerMounted(true);
      opacity.setValue(1);
      return;
    }
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_OUT_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setLayerMounted(false);
      }
    });
  }, [unityReady, opacity]);

  if (!layerMounted) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { opacity }]}
    >
      <Image
        source={images.unity_splash}
        style={styles.image}
        resizeMode="cover"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default UnitySplashOverlay;
