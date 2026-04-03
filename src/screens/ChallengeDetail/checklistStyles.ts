import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const CHECKBOX = widthPixel(22);

export default StyleSheet.create({
  section: {
    width: '100%',
  },
  list: {
    marginTop: heightPixel(12),
    gap: heightPixel(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
  },
  checkbox: {
    width: CHECKBOX,
    height: CHECKBOX,
    borderRadius: widthPixel(4),
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rowLabel: {
    flex: 1,
  },
});
