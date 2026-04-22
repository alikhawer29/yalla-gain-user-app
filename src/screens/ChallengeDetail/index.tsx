import { useMemo } from 'react';
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
import styles from './styles';
import { capitalizeFirst } from '../../utils/data';

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
    },
  } = useChallengeDetailController();

  const imageUrl = challenge?.image_url ?? challenge?.image;
  const isOngoing =
    challenge?.is_started === true ||
    challenge?.challenge_status === 'ongoing' ||
    challenge?.challenge_progress?.status === 'ongoing';
  const challengeType = capitalizeFirst(challenge?.type ?? 'Activity');

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

  const showDailyWorkoutChecklist =
    isJoined &&
    sortedChallengeTasks.length > 0 &&
    (challenge?.challenge_status === 'ongoing' ||
      String(challenge?.challenge_progress?.status ?? '').toLowerCase() ===
      'ongoing');

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
        <Text size={20} weight="bold" style={styles.title_main}>
          {capitalizeFirst(challenge?.title ?? 'Challenge')}
        </Text>
      </View>
      <Seperator size={12} />
      <Text size={16} weight="semibold">
        Description
      </Text>
      <Text size={14} color={colors.icon_gray} style={styles.description}>
        {challenge?.description ?? 'No description.'}
      </Text>
      <Seperator size={12} />
      <Text size={14} color={colors.white} style={styles.challenge_type_label} weight="bold">
        Challenge Type: {capitalizeFirst(challenge?.type ?? 'Activity')}
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
      {showDailyWorkoutChecklist ? (
        <>
          <DailyWorkoutChecklist
            tasks={sortedChallengeTasks}
            challengeType={String(challenge?.type ?? 'run')}
          />
          <Seperator size={16} />
        </>
      ) : null}
      <Seperator size={24} />
      {
        !isJoined ? (
          <Button text="Start Challenge" onPress={onStart} />
        ) : (
          <>
            <Button
              text={`Start ${challengeType}`}
              onPress={onStartTodayTask}
            />
            <Button
              text={`Complete ${challengeType}`}
              type="outlined"
              style={styles.button_spacer}
              onPress={onCompleteTodayTask}
            />
            <Button
              text="Leave Challenge"
              type="outlined"
              textColor={colors.danger}
              style={styles.button_spacer}
              onPress={onLeave}
            />
          </>
        )
      }
      <Seperator size={40} />
      <ConfirmModal
        visible={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={onConfirmLeave}
        title="Leave Challenge"
        message={`Are You Sure You Want To Leave The Challenge?`}
      />

      <AlertModal
        visible={showLeaveSuccess}
        onClose={onSuccessOk}
        type="success"
        title="Successfully"
        message="Challenge Has Been Left Successfully"
      />
    </Wrapper>
  );
};

export default ChallengeDetail;
