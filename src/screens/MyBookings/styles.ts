import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  filters_scroll: {
    marginBottom: heightPixel(10),
    flexGrow: 0,
    flexShrink: 0,
  },
  filter_item: {
    paddingHorizontal: widthPixel(15),
    paddingVertical: heightPixel(8),
    borderRadius: heightPixel(3),
    borderWidth: 1,
    borderColor: '#666666',
    backgroundColor: colors.transparent,
    minWidth: widthPixel(60),
  },
  filter_item_selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

export default styles;
