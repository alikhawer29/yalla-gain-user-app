import { Platform } from 'react-native';

const fonts = {
  sfpro: {
    bold: Platform.select({
      ios: 'SF Pro Display Bold',
      android: 'SF-Pro-Display-Bold',
    }),
    semibold: Platform.select({
      ios: 'SF Pro Display Semibold',
      android: 'SF-Pro-Display-Semibold',
    }),
    regular: Platform.select({
      ios: 'SF Pro Display Regular',
      android: 'SF-Pro-Display-Regular',
    }),
  },
};

export default fonts;
