import { Platform } from 'react-native';

const fonts = {
  sfpro: {
    bold: Platform.select({
      ios: 'SF Pro Display Bold',
      android: 'SF-Pro-Display-Bold',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'SF Pro Display Semibold',
      android: 'SF-Pro-Display-Semibold',
      default: 'System',
    }),
    regular: Platform.select({
      ios: 'SF Pro Display Regular',
      android: 'SF-Pro-Display-Regular',
      default: 'System',
    }),
  },
};

export default fonts;
