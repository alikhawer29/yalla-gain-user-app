import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  list_wrap: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  load_more_overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: heightPixel(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  load_more_pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(10),
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(18),
    borderRadius: heightPixel(24),
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
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
