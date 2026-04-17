import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import images from '../../assets/images';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Image from '../../components/Image';
import Row from '../../components/Row';
import Seperator from '../../components/Seperator';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import colors from '../../utils/colors';
import useChallengeDetailController from './useChallengeDetailController';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import DailyWorkoutChecklist from './DailyWorkoutChecklist';
import ChallengeDayCompleteModal from './ChallengeDayCompleteModal';
import styles from './styles';
import {
  countFullyCompletedTasks,
  getChallengeTimeline,
} from './challengeTimeline';
import {
  formatSessionDurationLabel,
  type ChallengeDurationApi,
} from './challengeDuration';
import { capitalizeFirst, capitalizeWords } from '../../utils/data';

function formatChallengeTimer(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

const ChallengeDetail = () => {
  const {
    values: {
      challenge,
      isJoined,
      isBlockingLoad,
      isPullRefreshing,
      showLeaveConfirm,
      showLeaveSuccess,
    },
    functions: {
      onReload,
      onStart,
      onLeave,
      onConfirmLeave,
      onSuccessOk,
      setShowLeaveConfirm,
      onStartTodayTask,
      onCompleteTodayTask,
      onClaimReward,
    },
  } = useChallengeDetailController();

  const imageUrl = challenge?.image_url ?? challenge?.image;
  const isOngoing =
    challenge?.is_started === true ||
    challenge?.challenge_status === 'ongoing' ||
    challenge?.challenge_progress?.status === 'ongoing';
  const challengeType = capitalizeWords(challenge?.type ?? 'Activity');

  const checklistDurationMeta = useMemo(
    (): ChallengeDurationApi => ({
      time_hour: challenge?.time_hour,
      time_minute: challenge?.time_minute,
      timer_duration_seconds: challenge?.timer_duration_seconds,
    }),
    [
      challenge?.time_hour,
      challenge?.time_minute,
      challenge?.timer_duration_seconds,
    ],
  );

  const sessionDurationLabel = useMemo(
    () => formatSessionDurationLabel(checklistDurationMeta),
    [checklistDurationMeta],
  );

  const challengeTasks = challenge?.challenge_progress?.challenge_tasks;
  const sortedChallengeTasks = useMemo(
    () =>
      [...(challengeTasks ?? [])].sort((a, b) =>
        String(a?.date_to_complete_in ?? '').localeCompare(
          String(b?.date_to_complete_in ?? ''),
        ),
      ),
    [challengeTasks],
  );

  const progressStatusLower = String(
    challenge?.challenge_progress?.status ?? '',
  ).toLowerCase();
  const challengeStatusLower = String(
    challenge?.challenge_status ?? '',
  ).toLowerCase();
  const awaitingRewardClaim = challenge?.can_claim_reward === true;

  /** Keep checklist visible through completion until reward is claimed (`can_claim_reward` clears). */
  const showDailyWorkoutChecklist =
    isJoined &&
    sortedChallengeTasks.length > 0 &&
    (challengeStatusLower === 'ongoing' ||
      progressStatusLower === 'ongoing' ||
      awaitingRewardClaim);

  const challengeTimeline = useMemo(
    () =>
      getChallengeTimeline(
        challenge?.challenge_progress?.start_date,
        challenge?.challenge_progress?.end_date,
        challenge?.challenge_progress?.challenge_tasks,
      ),
    [
      challenge?.challenge_progress?.start_date,
      challenge?.challenge_progress?.end_date,
      challenge?.challenge_progress?.challenge_tasks,
    ],
  );

  const todayTask = useMemo(() => {
    const tasks = challenge?.challenge_progress?.challenge_tasks as
      | Array<{
        is_today?: boolean;
        day_phase?: string;
        show_start_button?: boolean;
        show_timer?: boolean;
        timer_active?: boolean;
        seconds_remaining?: number;
        status?: string;
        id?: number;
      }>
      | undefined;
    if (!tasks?.length) return null;
    return (
      tasks.find(t => t.is_today === true) ??
      tasks.find(t => t.day_phase === 'today') ??
      null
    );
  }, [challenge?.challenge_progress?.challenge_tasks]);

  /** Backend: `show_start_button: false` while today’s task is active (timer / ongoing). */
  const showStartDayButton =
    !awaitingRewardClaim &&
    (!todayTask || todayTask.show_start_button !== false);

  const showTaskTimer =
    isJoined &&
    !awaitingRewardClaim &&
    todayTask?.show_timer === true &&
    todayTask?.timer_active === true;

  /** Prefer `can_leave_challenge` from API; else hide Leave while today’s task session is active (`show_start_button: false`). */
  const showLeaveChallengeButton = useMemo(() => {
    if (!isJoined) return false;
    if (typeof challenge?.can_leave_challenge === 'boolean') {
      return challenge.can_leave_challenge;
    }
    return !todayTask || todayTask.show_start_button !== false;
  }, [isJoined, challenge?.can_leave_challenge, todayTask]);

  const [timerSeconds, setTimerSeconds] = useState(
    () => todayTask?.seconds_remaining ?? 0,
  );

  useEffect(() => {
    setTimerSeconds(todayTask?.seconds_remaining ?? 0);
  }, [
    todayTask?.id,
    todayTask?.seconds_remaining,
    todayTask?.timer_active,
    todayTask?.show_timer,
  ]);

  useEffect(() => {
    if (!showTaskTimer) return;
    const id = setInterval(() => {
      setTimerSeconds(sec => Math.max(0, sec - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [showTaskTimer]);

  const completedDayNumber = useMemo(() => {
    if (!todayTask?.id) return 1;
    const idx = sortedChallengeTasks.findIndex(
      (t: { id?: number }) => t.id === todayTask.id,
    );
    return idx >= 0 ? idx + 1 : 1;
  }, [todayTask, sortedChallengeTasks]);

  const [showDayCompleteModal, setShowDayCompleteModal] = useState(false);
  const prevTimerSecondsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!showTaskTimer) {
      prevTimerSecondsRef.current = null;
      return;
    }
    const prev = prevTimerSecondsRef.current;
    prevTimerSecondsRef.current = timerSeconds;
    if (prev !== null && prev > 0 && timerSeconds === 0) {
      setShowDayCompleteModal(true);
      void (async () => {
        try {
          await onCompleteTodayTask();
        } catch {
          await onReload();
        }
      })();
    }
  }, [timerSeconds, showTaskTimer, onCompleteTodayTask, onReload]);

  const handleDayCompleteDismiss = async () => {
    setShowDayCompleteModal(false);
    await onReload();
  };

  const leaveConfirmMessage = useMemo(() => {
    const tasks = challenge?.challenge_progress?.challenge_tasks;
    const simple = 'Are You Sure You Want To Leave The Challenge?';
    if (countFullyCompletedTasks(tasks) < 1) {
      return simple;
    }
    let pct =
      challengeTimeline != null
        ? Math.round(challengeTimeline.percent)
        : tasks?.length
          ? Math.round(
            (countFullyCompletedTasks(tasks) / tasks.length) * 100,
          )
          : 0;
    if (pct < 1) pct = 1;
    return `Are You Sure You Want To Leave The Challenge? You're Doing Great And Have Already Surpassed ${pct}%! We Can Do This!`;
  }, [challenge?.challenge_progress?.challenge_tasks, challengeTimeline]);

  return (
    <Wrapper
      scrollable
      bottom_bar
      loading={isBlockingLoad}
      onRefresh={() => {
        onReload();
      }}
      refreshing={isPullRefreshing}
    >
      <View style={styles.image_container}>
        <Image
          source={imageUrl ? { uri: imageUrl } : images.dummy}
          style={styles.image}
          resize="cover"
        />
        {challenge?.status != null ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isOngoing
                  ? colors.transparent_primary
                  : colors.new_badge,
              },
            ]}
          >
            <Text size={10} weight="semibold" color={colors.white}>
              {isOngoing ? 'Ongoing' : 'New'}
            </Text>
          </View>
        ) : null}
      </View>
      <Seperator size={20} />
      <View style={styles.title_block}>
        <View style={styles.title_row}>
          <Text
            size={20}
            weight="bold"
            style={styles.title_main_flex}
            lines={2}
          >
            {capitalizeFirst(challenge?.title ?? 'Challenge')}
          </Text>
          <View style={styles.challenge_type_inline}>
            <Text size={12} weight="bold" color={colors.white} style={styles.challenge_type_label_text}>
              Challenge Type:{' '}
              <Text size={12} weight="regular" color={colors.icon_gray}>
                {capitalizeWords(challenge?.type ?? 'Activity')}
              </Text>
            </Text>
          </View>
        </View>
      </View>
      <Seperator size={12} />
      <Text size={16} weight="semibold">
        Description
      </Text>
      <Text size={14} color={colors.icon_gray} style={styles.description}>
        {challenge?.description ?? 'No description.'}
      </Text>
      <Seperator size={16} />
      {challenge?.milestone ? (
        <>
          <View style={styles.detail_row}>
            <View style={styles.detail_icon_wrap}>
              <Icon source={images.milestone} size={22} tint_color={colors.white} no_padding />
            </View>
            <Text size={14} color={colors.icon_gray} style={styles.detail_text}>
              {challenge.milestone}
            </Text>
          </View>
          <Seperator size={12} />
        </>
      ) : null}
      {challenge?.duration != null ? (
        <>
          <View style={styles.detail_row}>
            <View style={styles.detail_icon_wrap}>
              <Icon source={images.duration} size={22} tint_color={colors.white} no_padding />
            </View>
            <Text size={14} color={colors.icon_gray} style={styles.detail_text}>
              Duration: {challenge.duration} days
            </Text>
          </View>
          <Seperator size={12} />
        </>
      ) : null}
      {sessionDurationLabel ? (
        <>
          <View style={styles.detail_row}>
            <View style={styles.detail_icon_wrap}>
              <Icon source={images.clock} size={22} tint_color={colors.white} no_padding />
            </View>
            <Text size={14} color={colors.icon_gray} style={styles.detail_text}>
              Daily task duration: {sessionDurationLabel}
            </Text>
          </View>
          <Seperator size={12} />
        </>
      ) : null}
      {challenge?.reward != null ? (
        <>
          <View style={styles.detail_row}>
            <Text size={16} color={colors.white} style={styles.detail_text}>
              Reward:
            </Text>
          </View>
          <View style={styles.detail_row}>
            <Text size={14} color={colors.primary} style={styles.detail_text}>
              Earn {challenge.reward} Yalla Coins on completing this challenge
            </Text>
          </View>
          <Seperator size={12} />
        </>
      ) : null}
      {isJoined && challengeTimeline ? (
        <>
          <Seperator size={12} />
          <View style={styles.challenge_progress_section}>
            <View style={styles.challenge_progress_outer}>
              <View style={styles.challenge_progress_inner}>
                <View
                  style={[
                    styles.challenge_progress_teal,
                    { width: `${challengeTimeline.percent}%` },
                  ]}
                />
                <View style={styles.challenge_progress_white} />
              </View>
            </View>
            <Text
              size={12}
              weight="regular"
              color={colors.white}
              style={styles.challenge_progress_days}
            >
              {challengeTimeline.daysLeftLabel}
            </Text>
          </View>
        </>
      ) : null}
      {showDailyWorkoutChecklist ? (
        <>
          <DailyWorkoutChecklist
            tasks={sortedChallengeTasks}
            challengeType={String(challenge?.type ?? 'run')}
            durationMeta={checklistDurationMeta}
          />
          <Seperator size={16} />
        </>
      ) : null}
      {challenge?.can_claim_reward === true ? (
        <>
          <Text
            size={15}
            weight="semibold"
            color={colors.completed}
            style={styles.challenge_completed_banner}
          >
            Challenge has been completed successfully.
          </Text>
          <Seperator size={12} />
          <Button text="Claim Reward" onPress={onClaimReward} />
          <Seperator size={12} />
        </>
      ) : null}
      {showTaskTimer ? (
        <View style={styles.challenge_task_timer}>
          <Text size={24} weight="bold" color={colors.primary}>
            Timer {formatChallengeTimer(timerSeconds)}
          </Text>
        </View>
      ) : null}
      <Seperator size={24} />
      {
        !isJoined && !awaitingRewardClaim ? (
          <Button text="Start Challenge" onPress={onStart} />
        ) : isJoined ? (
          <>
            {showStartDayButton ? (
              <Button
                text={`Start ${challengeType}`}
                onPress={onStartTodayTask}
              />
            ) : null}
            {showLeaveChallengeButton ? (
              <Button
                text="Leave Challenge"
                type="outlined"
                textColor={colors.danger}
                style={styles.button_spacer}
                onPress={onLeave}
              />
            ) : null}
          </>
        ) : null
      }
      <Seperator size={40} />
      <ConfirmModal
        visible={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={onConfirmLeave}
        title="Leave Challenge"
        message={leaveConfirmMessage}
        messageColor={colors.white}
      />

      <AlertModal
        visible={showLeaveSuccess}
        onClose={onSuccessOk}
        type="success"
        title="Successfully"
        message="Challenge Has Been Left Successfully"
      />

      <ChallengeDayCompleteModal
        visible={showDayCompleteModal}
        dayNumber={completedDayNumber}
        onClose={handleDayCompleteDismiss}
        onBackToChallenges={handleDayCompleteDismiss}
      />
    </Wrapper>
  );
};

export default ChallengeDetail;
