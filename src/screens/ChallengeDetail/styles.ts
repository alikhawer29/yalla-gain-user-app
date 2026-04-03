import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';

const BADGE_BORDER_RADIUS = 4;

const styles = StyleSheet.create({
  image_container: {
    width: '100%',
    height: heightPixel(200),
    borderRadius: heightPixel(12),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title_block: {
    width: '100%',
  },
  title_main: {
    marginBottom: heightPixel(4),
  },
  badge: {
    position: 'absolute',
    top: heightPixel(4),
    right: widthPixel(4),
    paddingHorizontal: widthPixel(6),
    paddingVertical: heightPixel(2),
    borderRadius: heightPixel(BADGE_BORDER_RADIUS),
  },
  challenge_type_label: {},
  detail_row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: widthPixel(12),
  },
  detail_icon_wrap: {
    width: widthPixel(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail_text: {
    flex: 1,
    minWidth: 0,
    marginBottom: heightPixel(5),
  },
  description: {
    marginTop: heightPixel(8),
  },
  button_spacer: {
    marginTop: heightPixel(12),
  },
});

export default styles;
