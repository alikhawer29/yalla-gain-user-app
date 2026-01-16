import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(40),
    paddingBottom: heightPixel(100), // Extra padding for keyboard
  },
  coinContainer: {
    alignItems: 'center',
    marginBottom: heightPixel(40),
  },
  coinImage: {
    width: widthPixel(120),
    height: heightPixel(120),
    resizeMode: 'contain',
    marginBottom: heightPixel(20),
  },
  coinTitle: {
    fontSize: 20,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  formContainer: {
    gap: heightPixel(20),
    marginBottom: heightPixel(40),
  },
  inputContainer: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: widthPixel(15),
    paddingVertical: heightPixel(15),
  },
  inputLabel: {
    fontSize: 14,
    color: colors.placeholder,
    marginBottom: heightPixel(8),
  },
  input: {
    fontSize: 16,
    color: colors.white,
  },
  buttonsContainer: {
    gap: heightPixel(15),
    marginTop: heightPixel(20),
    paddingBottom: heightPixel(30), // Extra padding for keyboard
  },
});

export default styles;
