import { StyleSheet } from 'react-native';
import { heightPixel } from '../../../utils/helper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image_container: {
    marginBottom: heightPixel(8),
  },
  name: {
    textAlign: 'center',
  },
  rating_row: {
    marginVertical: heightPixel(4),
  },
  button: {
    paddingVertical: heightPixel(3),
    paddingHorizontal: heightPixel(12),
    minWidth: 'auto',
    height: heightPixel(30),
    borderRadius: heightPixel(2),
  },
});

export default styles;
