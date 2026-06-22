import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import { heightPixel, widthPixel } from '../../../utils/helper';

const styles = StyleSheet.create({
  card: {
    marginBottom: heightPixel(12),
  },
  headerRow: {
    marginBottom: heightPixel(8),
  },
  typeBadge: {
    paddingHorizontal: widthPixel(10),
    paddingVertical: heightPixel(4),
    borderRadius: heightPixel(4),
    backgroundColor: colors.dark_gray,
  },
  description: {
    marginTop: heightPixel(6),
    lineHeight: heightPixel(20),
  },
  footerRow: {
    marginTop: heightPixel(10),
  },
});

export default styles;
