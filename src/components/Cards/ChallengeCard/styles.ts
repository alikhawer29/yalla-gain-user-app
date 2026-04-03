import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../../utils/helper';

// Figma 253-9980 / 253-10027: compact card, no arrow
const CARD_BORDER_RADIUS = 5;
const BADGE_BORDER_RADIUS = 2;
const IMAGE_HEIGHT = 100; // Shorter for compact look

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
  },
  image_container: {
    width: '100%',
    height: heightPixel(IMAGE_HEIGHT),
    borderTopLeftRadius: CARD_BORDER_RADIUS,
    borderTopRightRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
    marginBottom: heightPixel(4),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: heightPixel(4),
    right: widthPixel(4),
    paddingHorizontal: widthPixel(6),
    // paddingVertical: heightPixel(2),
    borderRadius: BADGE_BORDER_RADIUS,
  },
  title_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 0,
    overflow: 'hidden',
  },
  title_block: {
    flex: 1,
    minWidth: 0,
    marginRight: widthPixel(8),
    overflow: 'hidden',
    flexShrink: 1,
  },
  icon_wrap: {
    width: widthPixel(28),
    minWidth: widthPixel(28),
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  type_label: {
    fontSize: 12,
    marginTop: heightPixel(2),
  },
});

export default styles;
