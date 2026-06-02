import { StyleSheet } from 'react-native';
import { heightPixel } from '../../../utils/helper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  remaining_block: {
    gap: heightPixel(6),
  },
  remaining_value: {
    marginTop: heightPixel(4),
  },
});

export default styles;
