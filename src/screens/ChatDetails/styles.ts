import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input_container: {
    flexDirection: 'row',
    backgroundColor: colors.transparent,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: heightPixel(15),
    borderBottomWidth: 1,
    borderBottomColor: colors.blackish_gray,
    gap: widthPixel(10),
  },
  header_name: {
    flex: 1,
  },
  role_badge: {
    paddingVertical: heightPixel(5),
    paddingHorizontal: widthPixel(15),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.icon_gray,
  },
  messages_container: {
    flex: 1,
    paddingVertical: heightPixel(15),
  },
  messages_content: {
    paddingBottom: heightPixel(20),
  },
  loading_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  date_separator: {
    alignItems: 'center',
    paddingVertical: heightPixel(15),
  },

  input_wrapper: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: heightPixel(10),
    backgroundColor: colors.blackish_gray,
    alignItems: 'center',
    paddingHorizontal: widthPixel(10),
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    color: colors.white,
    height: heightPixel(50),
    fontFamily: fonts.sfpro.regular,
    fontSize: 14,
  },
  input_icons: {
    flexDirection: 'row',
    gap: 5,
  },
  send_button: {
    width: widthPixel(50),
    height: heightPixel(50),
    borderRadius: heightPixel(25),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected_files_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: heightPixel(10),
  },
  selected_file: {
    width: widthPixel(60),
    height: heightPixel(60),
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  selected_file_image: {
    width: '100%',
    height: '100%',
  },
  remove_file_btn: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: widthPixel(20),
    height: heightPixel(20),
    borderRadius: 10,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
