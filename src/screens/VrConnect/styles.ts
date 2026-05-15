import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { font, heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(50),
    paddingBottom: heightPixel(16),
    width: '100%',
  },
  headerSide: {
    width: widthPixel(40),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: widthPixel(20),
    paddingBottom: heightPixel(24),
  },
  heroImage: {
    width: '100%',
    height: heightPixel(280),
    alignSelf: 'center',
    marginBottom: heightPixel(24),
  },
  bodyText: {
    fontSize: font(14),
    lineHeight: font(22),
    color: colors.white,
    marginBottom: heightPixel(16),
  },
  footer: {
    paddingHorizontal: widthPixel(20),
    paddingBottom: heightPixel(32),
    paddingTop: heightPixel(8),
  },
  accessButton: {
    width: '100%',
    borderRadius: heightPixel(12),
  },
});

export default styles;
