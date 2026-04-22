import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthPixel(20),
    paddingVertical: heightPixel(15),
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  drawerButton: {
    width: widthPixel(40),
    height: widthPixel(40),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerIcon: {
    width: widthPixel(20),
    height: widthPixel(20),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerDot: {
    width: 4,
    height: 4,
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: widthPixel(20),
  },
  coinContainer: {
    marginTop: heightPixel(60),
    alignItems: 'center',
  },
  coinImage: {
    width: widthPixel(200),
    height: heightPixel(200),
    resizeMode: 'contain',
  },
  coinText: {
    fontSize: 20,
    color: colors.white,
    marginTop: heightPixel(25),
    fontWeight: '600',
  },
  coinValue: {
    fontSize: 16,
    color: colors.white,
    marginTop: heightPixel(8),
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: heightPixel(40),
    left: widthPixel(20),
    right: widthPixel(20),
    gap: heightPixel(15),
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: heightPixel(18),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonTwo: {
    backgroundColor: colors.transparent_primary,
    outlineColor: colors.transparent_light_green,
    paddingVertical: heightPixel(18),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default styles;
