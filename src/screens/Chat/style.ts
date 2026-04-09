import { StyleSheet } from 'react-native';
import { heightPixel } from '../../utils/helper';

const SPACING = 15;

const styles = StyleSheet.create({
  list_header: {
    marginBottom: heightPixel(SPACING),
  },
  header_container: {
    gap: heightPixel(SPACING),
  },
  filter_container: {
    flex: 0.15,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  search_container: {
    flex: 0.85,
  },
  loading_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: heightPixel(50),
  },
  admin_empty: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: heightPixel(24),
    paddingHorizontal: heightPixel(20),
  },
  admin_empty_button: {
    marginTop: heightPixel(20),
    minWidth: '60%',
  },
});

export default styles;
