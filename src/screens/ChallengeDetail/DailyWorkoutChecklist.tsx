import { useMemo } from 'react';
import { View } from 'react-native';
import Text from '../../components/Text';
import colors from '../../utils/colors';
import styles from './checklistStyles';
import { capitalizeFirst } from '../../utils/data';

export type ChallengeTaskItem = {
  id: number;
  date_to_complete_in?: string;
  status?: string;
};

/** Checked only from API: `ongoing` (and completed-style) = checked, `pending` = unchecked. */
function isTaskCheckedFromApi(status?: string) {
  const s = (status ?? '').toLowerCase();
  if (s === 'pending') return false;
  if (s === 'ongoing') return true;
  return ['completed', 'complete', 'done', 'success'].includes(s);
}

type Props = {
  tasks: ChallengeTaskItem[];
  challengeType: string;
};

const DailyWorkoutChecklist = ({ tasks, challengeType }: Props) => {
  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) =>
        String(a.date_to_complete_in ?? '').localeCompare(
          String(b.date_to_complete_in ?? ''),
        ),
      ),
    [tasks],
  );

  const labelPrefix =
    challengeType.toLowerCase() === 'workout' ? '1 Workout' : '1 Hour Run';

  return (
    <View style={styles.section}>
      <Text size={16} weight="semibold" color={colors.white}>
        Daily {capitalizeFirst(challengeType)} checklist:
      </Text>
      <View style={styles.list}>
        {sortedTasks.map((task, index) => {
          const checked = isTaskCheckedFromApi(task.status);
          const label = `${labelPrefix} – Day ${index + 1}`;
          return (
            <View key={task.id} style={styles.row}>
              <View
                style={[styles.checkbox, checked && styles.checkboxChecked]}
              >
                {checked ? (
                  <Text size={14} weight="bold" color={colors.white}>
                    ✓
                  </Text>
                ) : null}
              </View>
              <Text
                size={14}
                color={checked ? colors.white : colors.icon_gray}
                style={styles.rowLabel}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default DailyWorkoutChecklist;
