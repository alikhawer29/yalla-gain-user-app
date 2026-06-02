import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  loader_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    gap: 10,
  },

  circleIcon: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
    backgroundColor: '#003B36', // dark teal (same as screenshot)
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  document_name: {
    maxWidth: widthPixel(150),
  },
  half_btn: {
    flex: 1,
  },
  tip_hint: {
    marginBottom: heightPixel(10),
  },
  report_btn: {
    flex: 1,
    borderColor: '#F20000',
    borderWidth: 2,
    backgroundColor: '#1A0000', // very dark red/black like screenshot
    borderRadius: 10,
  },
});

export default styles;
