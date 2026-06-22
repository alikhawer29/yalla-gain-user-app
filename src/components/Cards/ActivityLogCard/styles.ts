import { StyleSheet } from 'react-native';
import { ACTIVITY_LOG_TRIAL_COLOR } from '../../../utils/activityLog';
import colors from '../../../utils/colors';
import { heightPixel, widthPixel } from '../../../utils/helper';

const styles = StyleSheet.create({
  card: {
    marginBottom: heightPixel(12),
  },
  headerRow: {
    marginBottom: heightPixel(8),
  },
  badgeRow: {
    marginTop: heightPixel(4),
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: widthPixel(10),
    paddingVertical: heightPixel(4),
    borderRadius: heightPixel(4),
    backgroundColor: colors.dark_gray,
  },
  trialBadge: {
    paddingHorizontal: widthPixel(10),
    paddingVertical: heightPixel(4),
    borderRadius: heightPixel(4),
    backgroundColor: ACTIVITY_LOG_TRIAL_COLOR,
  },
  description: {
    marginTop: heightPixel(6),
    lineHeight: heightPixel(20),
  },
  expiresOn: {
    marginTop: heightPixel(4),
    lineHeight: heightPixel(18),
  },
  purchaseDetails: {
    marginTop: heightPixel(6),
    gap: heightPixel(2),
  },
  detailLine: {
    marginTop: heightPixel(4),
  },
  footerRow: {
    marginTop: heightPixel(10),
  },
});

export default styles;
