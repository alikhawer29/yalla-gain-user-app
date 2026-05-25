import { FC, memo } from 'react';
import {
  Image as RNImage,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
} from 'react-native';
import Image from '../Image';
import {
  getPrescriptionFileIcon,
  isPrescriptionImageCategory,
  resolvePrescriptionFileCategory,
} from '../../utils/prescriptionFile';

type PrescriptionFileThumbProps = {
  fileUrl?: string | null;
  fileType?: string | null;
  fileName?: string | null;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

const PrescriptionFileThumb: FC<PrescriptionFileThumbProps> = ({
  fileUrl,
  fileType,
  fileName,
  size = 28,
  style,
}) => {
  const category = resolvePrescriptionFileCategory(
    fileType,
    fileName,
    fileUrl,
  );

  if (isPrescriptionImageCategory(category) && fileUrl?.trim()) {
    return (
      <RNImage
        source={{ uri: fileUrl }}
        resizeMode="cover"
        style={[
          styles.thumb,
          { width: size, height: size, borderRadius: size * 0.2 },
          style,
        ]}
      />
    );
  }

  return (
    <View style={[styles.icon_wrap, { width: size, height: size }, style]}>
      <Image
        source={getPrescriptionFileIcon(category)}
        resize="contain"
        style={{ width: size, height: size }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  thumb: {
    backgroundColor: '#1a1a1a',
  },
  icon_wrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(PrescriptionFileThumb);
