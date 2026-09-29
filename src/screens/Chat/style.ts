import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

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
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: heightPixel(0),
  },
  search_container: {
    flex: 0.85,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 5,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
    height: heightPixel(40),
  },
  searchInput: {
    flex: 1,
    marginLeft: 5,
    color: colors.white,
    fontSize: 14,
    padding: 0,
  },
  searchResults: {
    backgroundColor: colors.blackish_gray,
    borderRadius: heightPixel(8),
    borderWidth: 1,
    borderColor: colors.dark_gray,
    marginTop: heightPixel(8),
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
