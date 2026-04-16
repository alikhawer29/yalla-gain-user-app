import dayjs from 'dayjs';

export type ChallengeTaskLike = { status?: string };

export type ChallengeTimeline = {
  percent: number;
  daysLeftLabel: string;
} | null;

/** Days fully completed (`completed` / `done` / etc.) — excludes `ongoing` only. */
export function countFullyCompletedTasks(
  tasks: ChallengeTaskLike[] | undefined,
): number {
  if (!tasks?.length) return 0;
  return tasks.filter(t => {
    const s = (t.status ?? '').toLowerCase();
    return ['completed', 'complete', 'done', 'success'].includes(s);
  }).length;
}

/** Progress % and “days left” count only **fully completed** days (`completed` / `done` / …), not `ongoing`. */
function percentFromCompletedTasks(tasks: ChallengeTaskLike[] | undefined): number | null {
  if (!tasks?.length) return null;
  const done = countFullyCompletedTasks(tasks);
  return Math.min(100, Math.max(0, (done / tasks.length) * 100));
}

/** Progress bar: task completion when `challenge_tasks` exist; else calendar elapsed. */
export function getChallengeTimeline(
  startDateStr?: string,
  endDateStr?: string,
  challengeTasks?: ChallengeTaskLike[],
): ChallengeTimeline {
  if (!startDateStr || !endDateStr) return null;
  const start = dayjs(startDateStr).startOf('day');
  const end = dayjs(endDateStr).startOf('day');
  const today = dayjs().startOf('day');

  const totalDays = Math.max(1, end.diff(start, 'day') + 1);

  let elapsedDays = today.diff(start, 'day') + 1;
  if (today.isBefore(start)) elapsedDays = 0;
  else if (today.isAfter(end)) elapsedDays = totalDays;

  const calendarPercent = Math.min(
    100,
    Math.max(0, (elapsedDays / totalDays) * 100),
  );

  const taskPercent = percentFromCompletedTasks(challengeTasks);
  const percent = taskPercent !== null ? taskPercent : calendarPercent;

  const tasksTotal = challengeTasks?.length ?? 0;
  const tasksDoneCount =
    tasksTotal > 0 ? countFullyCompletedTasks(challengeTasks) : 0;

  let daysLeftLabel: string;
  if (today.isAfter(end)) {
    daysLeftLabel = 'Challenge ended';
  } else if (today.isBefore(start)) {
    const until = start.diff(today, 'day');
    daysLeftLabel =
      until === 1 ? 'Starts tomorrow' : `Starts in ${until} days`;
  } else if (tasksTotal > 0) {
    /** Remaining days = total − **fully completed** only (ongoing today still counts as remaining). */
    const remaining = Math.max(0, tasksTotal - tasksDoneCount);
    if (remaining === 0) {
      daysLeftLabel = 'Challenge completed';
    } else if (remaining === 1) {
      daysLeftLabel = '1 Day Left';
    } else {
      daysLeftLabel = `${remaining} Days Left`;
    }
  } else {
    const daysLeftInclusive = end.diff(today, 'day') + 1;
    if (daysLeftInclusive <= 1) {
      daysLeftLabel = '1 Day Left';
    } else {
      daysLeftLabel = `${daysLeftInclusive} Days Left`;
    }
  }

  return { percent, daysLeftLabel };
}
