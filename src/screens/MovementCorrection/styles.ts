import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scroll_content: {
    paddingBottom: heightPixel(40),
    flexGrow: 1,
  },
  cover_container: {
    height: heightPixel(220),
  },
  cover_image: {
    borderRadius: heightPixel(10),
  },
  description: {
    marginTop: heightPixel(10),
  },
  dropdown_wrapper: {
    marginTop: heightPixel(16),
    marginBottom: heightPixel(8),
    zIndex: 1,
    elevation: 1,
    overflow: 'visible',
  },
  dropdown_exercise: {
    zIndex: 3000,
    elevation: 3000,
  },
  dropdown_mode: {
    zIndex: 2000,
    elevation: 2000,
  },
  dropdown_side: {
    zIndex: 1000,
    elevation: 1000,
  },
  dropdown_open: {
    zIndex: 9999,
    elevation: 9999,
  },
  dropdown_list: {
    backgroundColor: colors.black,
    borderColor: colors.icon_gray,
  },
  next_wrap: {
    marginTop: heightPixel(20),
    marginBottom: heightPixel(24),
  },
});

export default styles;
