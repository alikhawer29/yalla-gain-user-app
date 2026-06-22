import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: heightPixel(10),
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: heightPixel(5),
    paddingHorizontal: widthPixel(15),
    height: heightPixel(40),
    backgroundColor: 'transparent',
    gap: widthPixel(8),
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    padding: 0,
    margin: 0,
  },
  feedList: {
    flex: 1,
  },
  searchResults: {
    backgroundColor: colors.blackish_gray,
    borderRadius: heightPixel(8),
    borderWidth: 1,
    borderColor: colors.dark_gray,
    marginBottom: heightPixel(10),
    maxHeight: heightPixel(260),
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
    paddingHorizontal: widthPixel(14),
    paddingVertical: heightPixel(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.dark_gray,
  },
  searchResultItemLast: {
    borderBottomWidth: 0,
  },
  searchLoading: {
    paddingVertical: heightPixel(20),
    alignItems: 'center',
  },
  searchEmpty: {
    paddingVertical: heightPixel(20),
    paddingHorizontal: widthPixel(14),
    alignItems: 'center',
  },
});

export default styles;
