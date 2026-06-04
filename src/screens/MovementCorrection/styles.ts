import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  cover_container: {
    height: '30%',
  },
  cover_image: {
    borderRadius: heightPixel(10),
  },
  description: {
    marginTop: heightPixel(10),
  },
  dropdown_wrapper: {
    marginVertical: heightPixel(20),
    zIndex: 5000,
    elevation: 5,
  },
  dropdown_list: {
    backgroundColor: colors.black,
  },
});

export default styles;
