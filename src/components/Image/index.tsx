import { FC, memo, useEffect, useState } from 'react';
import { Image as RNImage, View } from 'react-native';
import { IImage } from '../../interfaces';
import images from '../../assets/images';
import styles from './styles';

const Image: FC<IImage> = ({ source, style, resize = 'contain' }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [
    typeof source === 'object' && !Array.isArray(source) ? (source as any)?.uri : source,
  ]);

  const handleError = () => {
    setHasError(true);
  };

  if (
    hasError ||
    (typeof source === 'object' &&
      !Array.isArray(source) &&
      source?.uri &&
      (!source.uri.trim() || source.uri === 'undefined'))
  ) {
    return (
      <RNImage
        source={images.dummy}
        style={[styles.container, style]}
        resizeMode={resize}
      />
    );
  }

  return (
    <RNImage
      source={source}
      style={[styles.container, style]}
      resizeMode={resize}
      onError={handleError}
    />
  );
};

export default memo(Image);
