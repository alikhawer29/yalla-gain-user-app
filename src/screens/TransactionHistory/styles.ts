import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: heightPixel(10),
    paddingBottom: heightPixel(20),
  },
  tabsScroll: {
    marginBottom: heightPixel(15),
    flexGrow: 0,
    flexShrink: 0,
  },
  tabItem: {
    paddingHorizontal: widthPixel(14),
    paddingVertical: heightPixel(8),
    borderRadius: heightPixel(4),
    borderWidth: 1,
    borderColor: colors.dark_gray,
    backgroundColor: colors.transparent,
  },
  tabItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.light_transparent_primary,
  },
  listWrap: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  loadMoreOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: heightPixel(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(10),
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(18),
    borderRadius: heightPixel(24),
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: heightPixel(80),
  },
});

export default styles;
