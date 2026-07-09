import { StyleSheet } from 'react-native';
import { heightPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: heightPixel(10),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: heightPixel(20),
    flexGrow: 0,
  },
  listContainer: {
    flex: 1,
  },
  emptyList: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    gap: heightPixel(4),
    justifyContent: 'center',
  },
  metaRow: {
    marginTop: heightPixel(4),
  },
});

export default styles;
