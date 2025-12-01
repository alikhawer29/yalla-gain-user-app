import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  header_row: {
    marginBottom: heightPixel(5),
  },
  status_badge: {
    paddingHorizontal: widthPixel(15),
    paddingVertical: heightPixel(6),
    borderRadius: heightPixel(4),
  },
  column: {
    width: '48%',
  },
  coin_icon: {
    marginLeft: widthPixel(4),
  },
  divider: {
    height: 1,
    backgroundColor: '#3D3D3D',
    width: '100%',
  },
  approve_btn: {
    flex: 1,
  },
  reject_btn: {
    flex: 1,
  },
  start_chat_btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(10),
    backgroundColor: colors.grayish_black,
    padding: widthPixel(12),
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  document_btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(10),
    backgroundColor: colors.light_primary,
    padding: widthPixel(10),
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pdf_icon: {
    width: widthPixel(40),
    height: heightPixel(45),
    backgroundColor: '#F20000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  document_name: {
    maxWidth: widthPixel(150),
  },
  half_btn: {
    flex: 1,
  },
  report_btn: {
    flex: 1,
    borderColor: '#F20000',
    backgroundColor: '#F20000',
  },
});

export default styles;
