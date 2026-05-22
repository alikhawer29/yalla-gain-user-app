import { FC, memo } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet } from 'react-native';

export const isValidPostMediaUri = (uri?: string | null): uri is string =>
  !!uri?.trim() && uri !== 'undefined';

type PostMediaImageProps = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
};

/** Local/API post media — no dummy.png fallback (unlike custom Image wrapper). */
const PostMediaImage: FC<PostMediaImageProps> = ({ uri, style }) => {
  if (!isValidPostMediaUri(uri)) return null;
  return (
    <Image
      source={{ uri }}
      resizeMode="cover"
      style={[styles.media, style]}
    />
  );
};

const styles = StyleSheet.create({
  media: {
    width: '100%',
    height: '100%',
  },
});

export default memo(PostMediaImage);
