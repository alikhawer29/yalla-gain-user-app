import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  rootOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  overlay: {
    flexGrow: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: heightPixel(24),
    paddingHorizontal: widthPixel(12),
  },
  modalContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    width: '90%',
    maxWidth: widthPixel(400),
    padding: widthPixel(20),
  },
  header: {
    alignItems: 'center',
    marginBottom: heightPixel(20),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    gap: heightPixel(20),
  },
  coinValueBox: {
    backgroundColor: colors.inputBackground,
    padding: heightPixel(15),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: heightPixel(8),
  },
  coinValue: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  commissionNote: {
    fontSize: 13,
    color: colors.icon_gray,
    textAlign: 'center',
  },
  commissionAmount: {
    fontSize: 13,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputContainer: {
    gap: heightPixel(10),
  },
  conversionContainer: {
    minHeight: heightPixel(36),
    justifyContent: 'center',
  },
  conversionPreview: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: widthPixel(8),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: widthPixel(15),
    marginTop: heightPixel(10),
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

export default styles;
