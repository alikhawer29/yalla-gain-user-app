import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import { heightPixel, widthPixel } from '../../../utils/helper';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    maxWidth: '90%',
    alignItems: 'flex-start',
    gap: widthPixel(8),
  },
  sender_container: {
    alignSelf: 'flex-end',
  },
  receiver_container: {
    alignSelf: 'flex-start',
  },
  avatar_container: {
    marginTop: heightPixel(8),
  },
  message_bubble: {
    flex: 1,
    borderRadius: heightPixel(10),
    padding: heightPixel(10),
    marginTop: heightPixel(8),
    backgroundColor: colors.blackish_gray,
    gap: heightPixel(5),
  },
  sender_bubble: {
    borderTopRightRadius: 0,
  },
  receiver_bubble: {
    borderTopLeftRadius: 0,
  },
  tailLeft: {
    position: 'absolute',
    top: 0,
    left: -10,
    transform: [{ rotate: '180deg' }],
    zIndex: 99,
  },
  tailRight: {
    position: 'absolute',
    top: 0,
    right: -10,
    transform: [{ rotate: '180deg' }],
    zIndex: 99,
  },
  files_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: widthPixel(5),
    marginBottom: heightPixel(5),
  },
  file_image: {
    width: widthPixel(100),
    height: heightPixel(100),
    borderRadius: 8,
  },
  file_video_wrap: {
    position: 'relative',
  },
  file_video_overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
  },
  file_document: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(12),
    borderRadius: heightPixel(10),
    backgroundColor: colors.dark_gray,
    minWidth: widthPixel(200),
    maxWidth: widthPixel(260),
    borderWidth: 1,
    borderColor: colors.gray,
  },
  file_document_icon_wrap: {
    width: widthPixel(44),
    height: widthPixel(44),
    borderRadius: heightPixel(8),
    backgroundColor: colors.blackish_gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  file_document_text: {
    flex: 1,
    gap: heightPixel(4),
    minWidth: 0,
  },
});

export default styles;
