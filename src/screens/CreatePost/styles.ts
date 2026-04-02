import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel, font } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  contentContainer: {
    // paddingHorizontal: widthPixel(20),
    // paddingTop: heightPixel(20),
  },
  inputContainer: {
    backgroundColor: colors.blackish_gray,
    borderRadius: heightPixel(10),
    padding: widthPixel(15),
    minHeight: heightPixel(200),
  },
  userInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: font(14),
    textAlignVertical: 'top',
    minHeight: heightPixel(100),
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: heightPixel(10),
  },
  mediaItem: {
    width: '48%',
    height: heightPixel(150),
    borderRadius: heightPixel(10),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.dark_gray,
  },
  largeMediaItem: {
    width: '100%',
    height: heightPixel(250),
    borderRadius: heightPixel(10),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.dark_gray,
    marginTop: heightPixel(10),
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    // backgroundColor: colors.danger,
    // borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  videoPlayButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoPlayIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    // backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: heightPixel(20),
    marginBottom: heightPixel(20),
  },
  postButton: {
    backgroundColor: colors.primary,
    borderRadius: heightPixel(10),
    height: heightPixel(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: heightPixel(20),
  },
  postButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: font(16),
  },
  pollContainer: {
    marginTop: heightPixel(20),
  },
  pollInput: {
    backgroundColor: colors.blackish_gray,
    borderRadius: heightPixel(10),
    padding: widthPixel(15),
    marginBottom: heightPixel(10),
    color: colors.white,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: heightPixel(10),
    gap: 10,
  },
});

export default styles;
