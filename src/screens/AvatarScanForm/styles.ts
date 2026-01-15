import { StyleSheet } from 'react-native';
import { font, heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  basic_information_label: {
    marginTop: heightPixel(20),
    marginBottom: heightPixel(10),
    fontSize: font(25),
    fontWeight: 'bold',
    color: colors.white,
    alignSelf: 'flex-start',
  },
  field_container: {
    marginBottom: heightPixel(20),
    width: '100%',
  },
  body_type_container: {
    marginBottom: heightPixel(20),
    width: '50%',
    alignSelf: 'flex-start',
  },
  label: {
    marginBottom: heightPixel(10),
    alignSelf: 'flex-start',
  },
  radio_container: {
    gap: widthPixel(20),
  },
  radio_option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(2),
  },
  radio_circle: {
    width: widthPixel(20),
    height: widthPixel(20),
    borderRadius: widthPixel(10),
    borderWidth: 2,
    borderColor: colors.icon_gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radio_circle_selected: {
    borderColor: colors.primary,
  },
  radio_inner: {
    width: widthPixel(10),
    height: widthPixel(10),
    borderRadius: widthPixel(5),
    backgroundColor: colors.primary,
  },
  radio_label: {
    marginLeft: widthPixel(5),
  },
  error_text: {
    marginTop: heightPixel(5),
  },
  button: {
    marginTop: heightPixel(20),
  },
  button_row: {
    marginTop: heightPixel(20),
  },
  avatarImage: {
    width: widthPixel(200),
    height: heightPixel(300),
    alignSelf: 'center',
    marginBottom: heightPixel(20),
    borderRadius: widthPixel(10),
    backgroundColor: colors.light_gray, // fallback
  },
});

export default styles;
