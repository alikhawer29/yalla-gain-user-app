import { StyleSheet } from 'react-native';
import { font, heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    paddingTop: heightPixel(40),
    alignItems: 'center',
    zIndex: 10,
  },
  lights_container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  light: {
    width: widthPixel(150),
    height: heightPixel(150),
    resizeMode: 'contain',
  },
  video_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: heightPixel(20),
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  play_button_container: {
    position: 'absolute',
    zIndex: 1,
  },
  bottom_container: {
    paddingHorizontal: widthPixel(20),
    paddingBottom: heightPixel(40),
    gap: heightPixel(30),
  },
  description: {
    textAlign: 'center',
    lineHeight: font(24),
  },
  button_row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: widthPixel(20),
  },
  button: {
    flex: 1,
  },
  outline_button: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
});

export default styles;
