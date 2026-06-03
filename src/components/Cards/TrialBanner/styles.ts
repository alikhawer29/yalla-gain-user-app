import { Platform, StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import { heightPixel, widthPixel } from '../../../utils/helper';

const GOLD = '#C9A227';
const GOLD_BORDER = 'rgba(201, 162, 39, 0.85)';
const BANNER_BG = '#0A1F1E';

const styles = StyleSheet.create({
  banner: {
    backgroundColor: BANNER_BG,
    borderRadius: heightPixel(14),
    borderWidth: 1.5,
    borderColor: GOLD_BORDER,
    paddingHorizontal: widthPixel(14),
    paddingVertical: heightPixel(14),
    overflow: 'hidden',
    minHeight: heightPixel(100),
    justifyContent: 'center',
  },
  decor_arc: {
    position: 'absolute',
    right: widthPixel(-20),
    top: heightPixel(-30),
    width: widthPixel(120),
    height: widthPixel(120),
    borderRadius: widthPixel(60),
    borderWidth: 1.5,
    borderColor: GOLD_BORDER,
    opacity: 0.45,
  },
  content_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: widthPixel(10),
  },
  text_block: {
    flex: 1,
    gap: heightPixel(4),
    paddingRight: widthPixel(4),
  },
  tagline: {
    color: colors.white,
    lineHeight: heightPixel(16),
  },
  headline: {
    color: GOLD,
    letterSpacing: 0.3,
    lineHeight: heightPixel(24),
  },
  days_remaining: {
    color: GOLD,
    opacity: 0.95,
    marginTop: heightPixel(2),
    lineHeight: heightPixel(16),
  },
  claim_btn_wrap: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claim_btn_glow: {
    position: 'absolute',
    width: widthPixel(108),
    height: heightPixel(40),
    borderRadius: heightPixel(20),
    backgroundColor: colors.primary,
    opacity: 0.55,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  claim_btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: widthPixel(4),
    backgroundColor: colors.primary,
    paddingHorizontal: widthPixel(14),
    paddingVertical: heightPixel(10),
    borderRadius: heightPixel(22),
    minWidth: widthPixel(100),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#00E5CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});

export default styles;
