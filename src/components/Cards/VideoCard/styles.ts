import { StyleSheet } from 'react-native';
import { heightPixel } from '../../../utils/helper';

const styles = StyleSheet.create({
  content_container: {
    flex: 0.4,
    padding: heightPixel(8),
    justifyContent: 'flex-start',
    gap: heightPixel(6),
  },
  image_container: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  video_count_badge: {
    position: 'absolute',
    top: heightPixel(8),
    right: heightPixel(10),
    zIndex: 2,
    paddingHorizontal: heightPixel(8),
    paddingVertical: heightPixel(4),
    borderRadius: heightPixel(6),
    backgroundColor: 'rgba(31, 31, 31, 0.82)',
  },
  video_count_badge_offset_save: {
    right: heightPixel(50),
  },
  video_count_badge_offset_secondary: {
    right: heightPixel(42),
  },
  image: {
    height: '100%',
    width: '100%',
  },
  icon: {
    width: heightPixel(12),
    height: heightPixel(12),
    resizeMode: 'contain',
  },
  save_icon: {
    position: 'absolute',
    top: heightPixel(14),
    right: heightPixel(14),
  },
  secondary_save_icon: {
    top: heightPixel(5),
    right: heightPixel(5),
  },
});

export default styles;
