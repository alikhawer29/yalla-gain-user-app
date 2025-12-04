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
});

export default styles;
