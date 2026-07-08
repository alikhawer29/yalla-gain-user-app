import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  auth_section: {
    padding: heightPixel(14),
    borderRadius: heightPixel(10),
    backgroundColor: '#282828',
    marginBottom: heightPixel(12),
  },
  auth_row: {
    marginBottom: heightPixel(10),
  },
  auth_row_last: {
    marginBottom: 0,
  },
  date_item: {
    width: widthPixel(42),
    height: heightPixel(55),
    borderRadius: heightPixel(6),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#282828',
  },
  date_item_selected: {
    backgroundColor: colors.primary,
  },
  slots_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: heightPixel(12),
  },
  slot_item: {
    width: '48%',
    paddingVertical: heightPixel(14),
    borderRadius: heightPixel(10),
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: colors.transparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slot_item_selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slot_item_booked: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
    // opacity: 0.8,
  },
  slot_item_passed: {
    backgroundColor: '#3A3A3A',
    borderColor: '#555555',
    opacity: 0.7,
  },
  slot_item_conflict: {
    backgroundColor: '#8B4513',
    borderColor: '#A0522D',
    opacity: 0.85,
  },
});

export default styles;
