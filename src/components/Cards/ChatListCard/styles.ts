import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import { heightPixel, widthPixel } from '../../../utils/helper';

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: colors.blackish_gray,
  },
  icon_container: {
    flex: 0.12,
  },
  content_container: {
    flex: 0.88,
    height: '100%',
    justifyContent: 'space-between',
  },
  badge: {
    paddingVertical: heightPixel(1),
    paddingHorizontal: widthPixel(26),
  },
  unread_badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: widthPixel(20),
    height: heightPixel(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: widthPixel(5),
  },
});

export default styles;
