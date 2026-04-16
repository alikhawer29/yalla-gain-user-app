import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const BADGE_BORDER_RADIUS = 4;

const styles = StyleSheet.create({
  image_container: {
    width: '100%',
    height: heightPixel(200),
    borderRadius: heightPixel(12),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title_block: {
    width: '100%',
  },
  title_row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    gap: widthPixel(12),
  },
  title_main_flex: {
    flex: 1,
    minWidth: 0,
  },
  challenge_type_inline: {
    flexShrink: 0,
    maxWidth: '46%',
    alignItems: 'flex-end',
  },
  challenge_type_label_text: {
    textAlign: 'right',
  },
  badge: {
    position: 'absolute',
    top: heightPixel(4),
    right: widthPixel(4),
    paddingHorizontal: widthPixel(6),
    paddingVertical: heightPixel(2),
    borderRadius: heightPixel(BADGE_BORDER_RADIUS),
  },
  detail_row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: widthPixel(12),
  },
  detail_icon_wrap: {
    width: widthPixel(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail_text: {
    flex: 1,
    minWidth: 0,
    marginBottom: heightPixel(5),
  },
  description: {
    marginTop: heightPixel(8),
  },
  button_spacer: {
    marginTop: heightPixel(12),
  },
  challenge_progress_section: {
    width: '100%',
  },
  challenge_progress_outer: {
    width: '100%',
    padding: heightPixel(3),
    borderRadius: heightPixel(10),
    backgroundColor: colors.grayish_black,
  },
  challenge_progress_inner: {
    flexDirection: 'row',
    width: '100%',
    height: heightPixel(10),
    borderRadius: heightPixel(8),
    overflow: 'hidden',
  },
  challenge_progress_teal: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  challenge_progress_white: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    backgroundColor: colors.white,
  },
  challenge_progress_days: {
    marginTop: heightPixel(8),
    alignSelf: 'flex-end',
  },
  challenge_task_timer: {
    marginTop: heightPixel(16),
    // alignSelf: 'left',
    textAlign: 'left',
  },
  challenge_task_timer_text: {
    fontSize: heightPixel(50),
    fontWeight: '700',
    color: '#118076',
    letterSpacing: 0.5,
  },
});

export default styles;
