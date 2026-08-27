import { Platform, StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input_container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: heightPixel(10),
    backgroundColor: colors.blackish_gray,
    paddingHorizontal: widthPixel(10),
    paddingVertical: heightPixel(8),
  },
  input_attachments_row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: widthPixel(8),
    paddingBottom: heightPixel(8),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    marginBottom: heightPixel(6),
  },
  input_attachment_chip: {
    width: widthPixel(72),
    height: heightPixel(72),
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.dark_gray,
  },
  input_attachment_image: {
    width: '100%',
    height: '100%',
  },
  input_attachment_doc: {
    flex: 1,
    padding: widthPixel(6),
    justifyContent: 'center',
    alignItems: 'center',
    gap: heightPixel(4),
  },
  input_attachment_doc_name: {
    textAlign: 'center',
  },
  input_attachment_remove: {
    position: 'absolute',
    top: widthPixel(4),
    right: widthPixel(4),
    width: widthPixel(20),
    height: widthPixel(20),
    borderRadius: widthPixel(10),
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  input_row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    paddingHorizontal: widthPixel(4),
    color: colors.white,
    minHeight: Platform.OS === 'ios' ? heightPixel(30) : heightPixel(40),
    maxHeight: heightPixel(120),
    fontSize: 14,
  },
  input_with_attachments: {
    minHeight: heightPixel(36),
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
    alignSelf: 'flex-end',
    flexShrink: 0,
  },
});

export default styles;
