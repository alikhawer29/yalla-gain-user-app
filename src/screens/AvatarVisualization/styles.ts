import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.black, // Assuming background is handled by Wrapper or global theme
  },
  avatarContainer: {
    height: heightPixel(600), // Adjust as needed
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    height: '85%',
    width: '100%',
    resizeMode: 'contain',
  },
  measurementLabel: {
    position: 'absolute',
    // backgroundColor: "rgba(0,0,0,0.5)", // Optional readability
    padding: 5,
    borderRadius: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white, // Or teal/cyan from image
    position: 'absolute',
  },
  line: {
    height: 1,
    backgroundColor: colors.white, // Or teal/cyan
    position: 'absolute',
  },
  bottomContainer: {
    paddingHorizontal: widthPixel(20),
    paddingBottom: heightPixel(20),
  },
  sliderContainer: {
    marginTop: heightPixel(20),
  },
  buttonRow: {
    marginTop: heightPixel(20),
    marginBottom: heightPixel(10),
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
});

export default styles;
