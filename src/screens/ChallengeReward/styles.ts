import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  spotlight_wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: heightPixel(220),
    alignItems: 'center',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  spotlight: {
    width: widthPixel(280),
    height: heightPixel(200),
    opacity: 0.35,
  },
  hero: {
    width: widthPixel(120),
    height: heightPixel(120),
    alignSelf: 'center',
    marginBottom: heightPixel(8),
  },
  congrats: {
    textAlign: 'center',
    lineHeight: heightPixel(24),
    paddingHorizontal: widthPixel(8),
    marginBottom: heightPixel(20),
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: heightPixel(14),
    padding: widthPixel(16),
    marginBottom: heightPixel(24),
    borderWidth: 1,
    borderColor: colors.border,
  },
  card_title_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: widthPixel(12),
    marginBottom: heightPixel(16),
  },
  card_title: {
    flex: 1,
    minWidth: 0,
  },
  card_meta: {
    flexShrink: 0,
    maxWidth: '48%',
  },
  card_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(10),
    marginBottom: heightPixel(12),
  },
  card_row_last: {
    marginBottom: 0,
  },
  coin_block: {
    alignItems: 'center',
    marginBottom: heightPixel(28),
  },
  coins_image: {
    width: widthPixel(140),
    height: heightPixel(100),
    marginBottom: heightPixel(12),
  },
  reward_line: {
    textAlign: 'center',
  },
});

export default styles;
