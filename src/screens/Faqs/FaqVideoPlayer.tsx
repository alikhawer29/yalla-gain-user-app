import React, { FC, useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Video from 'react-native-video';
import images from '../../assets/images';
import Image from '../../components/Image';
import styles from './styles';

interface FaqVideoPlayerProps {
  videoUrl: string;
}

const FaqVideoPlayer: FC<FaqVideoPlayerProps> = ({ videoUrl }) => {
  const videoRef = useRef<any>(null);
  const [paused, setPaused] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    setPaused(true);
    setHasEnded(false);
  }, [videoUrl]);

  const handlePlay = () => {
    if (hasEnded) {
      videoRef.current?.seek(0);
      setHasEnded(false);
    }
    setPaused(false);
  };

  const handlePause = () => {
    setPaused(true);
  };

  const handleEnd = () => {
    setHasEnded(true);
    setPaused(true);
  };

  return (
    <View style={styles.video}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        paused={paused}
        resizeMode="cover"
        style={styles.videoPlayer}
        onEnd={handleEnd}
        repeat={false}
      />
      {paused && (
        <TouchableOpacity
          style={styles.videoPlayOverlay}
          onPress={handlePlay}
          activeOpacity={0.85}
        >
          <Image source={images.video_play} style={styles.videoPlayIcon} />
        </TouchableOpacity>
      )}
      {!paused && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handlePause}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

export default FaqVideoPlayer;
