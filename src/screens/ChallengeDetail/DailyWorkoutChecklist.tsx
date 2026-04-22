import { useMemo } from 'react';
import { View } from 'react-native';
import Text from '../../components/Text';
import colors from '../../utils/colors';
import styles from './checklistStyles';
import { capitalizeWords } from '../../utils/data';
import {
  formatSessionDurationLabel,
  type ChallengeDurationApi,
} from './challengeDuration';

export type ChallengeTaskItem = {
  id: number;
  date_to_complete_in?: string;
  status?: string;
};

function getActivityShortName(typeRaw: string): string {
  const key = typeRaw.toLowerCase().trim().replace(/-/g, '_');
  const map: Record<string, string> = {
    run: 'Run',
    cycle: 'Cycling',
    workout: 'Workout',
    strength: 'Strength',
    face_yoga: 'Face Yoga',
    cardio: 'Cardio',
  };
  return map[key] ?? capitalizeWords(typeRaw);
}

/** Row prefix: API duration (`time_hour` / `time_minute` / `timer_duration_seconds`) + activity name; else static defaults. */
function getDailyTaskLabelPrefix(
  typeRaw: string,
  durationMeta?: ChallengeDurationApi | null,
): string {
  const dur = formatSessionDurationLabel(durationMeta ?? undefined);
  const activity = getActivityShortName(typeRaw);
  if (dur) {
    return `${dur} ${activity}`;
  }
  const key = typeRaw.toLowerCase().trim().replace(/-/g, '_');
  switch (key) {
    case 'run':
      return '1 Hour Run';
    case 'cycle':
      return '1 Hour Cycling';
    case 'workout':
      return '1 Hour Workout';
    case 'strength':
      return '1 Hour Strength';
    case 'face_yoga':
      return '1 Hour Face Yoga';
    case 'cardio':
      return '1 Hour Cardio';
    default:
      return `1 ${capitalizeWords(typeRaw)}`;
  }
}

/** Checked when API marks that day **completed** (`completed` / `done` / …) — not `ongoing`. */
function isTaskCheckedFromApi(status?: string) {
  const s = (status ?? '').toLowerCase();
  return ['completed', 'complete', 'done', 'success'].includes(s);
}

type Props = {
  tasks: ChallengeTaskItem[];
  challengeType: string;
  durationMeta?: ChallengeDurationApi | null;
};

const DailyWorkoutChecklist = ({
  tasks,
  challengeType,
  durationMeta,
}: Props) => {
  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) =>
        String(a.date_to_complete_in ?? '').localeCompare(
          String(b.date_to_complete_in ?? ''),
        ),
      ),
    [tasks],
  );

  const labelPrefix = useMemo(
    () => getDailyTaskLabelPrefix(challengeType, durationMeta),
    [challengeType, durationMeta],
  );

  return (
    <View style={styles.section}>
      <Text size={16} weight="semibold" color={colors.white}>
        Daily {capitalizeWords(challengeType)} checklist:
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
