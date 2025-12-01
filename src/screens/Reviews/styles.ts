import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  // Rating breakdown section
  breakdown_container: {
    // flex: 1,
  },
  breakdown_row: {
    marginBottom: heightPixel(6),
  },
  star_label: {
    width: widthPixel(45),
  },
  progress_bar: {
    flex: 1,
    height: heightPixel(8),
    backgroundColor: colors.icon_gray,
    borderRadius: heightPixel(4),
    overflow: 'hidden',
  },
  progress_fill: {
    height: '100%',
    backgroundColor: '#E5A500',
    borderRadius: heightPixel(4),
  },
  // Average rating
  average_container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: heightPixel(10),
    justifyContent: 'flex-end',
  },
  average_big: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  average_small: {
    fontSize: 18,
    marginBottom: heightPixel(5),
  },
  // Filter tabs
  filters_scroll: {
    marginVertical: heightPixel(15),
    flexGrow: 0,
    flexShrink: 0,
  },
  filter_item: {
    paddingHorizontal: widthPixel(15),
    paddingVertical: heightPixel(8),
    borderRadius: heightPixel(5),
    borderWidth: 1,
    borderColor: colors.icon_gray,
    backgroundColor: colors.transparent,
    minWidth: widthPixel(50),
    alignItems: 'center',
  },
  filter_item_selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  // Review card
  review_card: {
    marginBottom: heightPixel(15),
  },
  review_header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reviewer_image: {
    width: widthPixel(45),
    height: heightPixel(45),
    borderRadius: heightPixel(22.5),
    overflow: 'hidden',
    marginRight: widthPixel(12),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  review_header_content: {
    flex: 1,
  },
  review_name_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPixel(4),
  },
  stars_row: {
    flexDirection: 'row',
    gap: 2,
  },
  review_text: {
    marginTop: heightPixel(10),
  },
});

export default styles;
