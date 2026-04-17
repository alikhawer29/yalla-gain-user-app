import { View } from 'react-native';
import dayjs from 'dayjs';
import images from '../../assets/images';
import AlertModal from '../../components/AlertModal';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Image from '../../components/Image';
import Seperator from '../../components/Seperator';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import colors from '../../utils/colors';
import { capitalizeWords } from '../../utils/data';
import useChallengeRewardController from './useChallengeRewardController';
import styles from './styles';

const ChallengeReward = () => {
  const {
    values: {
      challenge,
      isInitialLoad,
      isClaiming,
      showSuccess,
    },
    functions: { onCollectCoins, onSuccessDismiss },
  } = useChallengeRewardController();

  const title = challenge?.title ?? 'Challenge';
  const typeLabel = capitalizeWords(String(challenge?.type ?? 'Activity'));
  const milestone = challenge?.milestone ?? challenge?.description ?? '';
  const durationRaw = challenge?.duration;
  const durationLabel =
    durationRaw != null && String(durationRaw).trim() !== ''
      ? `${durationRaw} ${Number(durationRaw) === 1 ? 'Day' : 'Days'}`
      : '—';
  const rewardAmount = challenge?.reward ?? '—';

  const completionDateStr =
    challenge?.challenge_progress?.end_date ??
    challenge?.challenge_progress?.start_date;
  const dateLine = completionDateStr
    ? dayjs(completionDateStr).format('MMM D, YYYY')
    : dayjs().format('MMM D, YYYY');

  const canClaim = challenge?.can_claim_reward === true;

  return (
    <Wrapper scrollable loading={isInitialLoad}>
      <View style={styles.spotlight_wrap}>
        <Image
          source={images.center_light}
          style={styles.spotlight}
          resize="contain"
        />
      </View>
      <Image
        source={images.challenge_reward_hero}
        style={styles.hero}
        resize="contain"
      />
      <Text
        size={16}
        weight="semibold"
        color={colors.white}
        style={styles.congrats}
        position="center"
      >
        Congratulations You Have Completed The &apos;{title}&apos; Successfully
      </Text>

      <View style={styles.card}>
        <View style={styles.card_title_row}>
          <View style={styles.card_title}>
            <Text size={18} weight="bold" color={colors.white}>
              {title}
            </Text>
          </View>
          <View style={styles.card_meta}>
            <Text
              size={11}
              color={colors.white}
              style={{ textAlign: 'right' }}
            >
              Challenge Type: {typeLabel}
            </Text>
          </View>
        </View>

        <View style={styles.card_row}>
          <Icon source={images.calendar} size={20} tint_color={colors.white} />
          <Text size={14} color={colors.white} style={{ flex: 1 }}>
            {dateLine}
          </Text>
        </View>
        {milestone ? (
          <View style={styles.card_row}>
            <Icon source={images.clock} size={20} tint_color={colors.white} />
            <Text size={14} color={colors.white} style={{ flex: 1 }}>
              {milestone}
            </Text>
          </View>
        ) : null}
        <View style={[styles.card_row, styles.card_row_last]}>
          <Icon source={images.duration} size={20} tint_color={colors.white} />
          <Text size={14} color={colors.white} style={{ flex: 1 }}>
            Duration {durationLabel}
          </Text>
        </View>
      </View>

      <View style={styles.coin_block}>
        <Image
          source={require('../../assets/images/coins.png')}
          style={styles.coins_image}
          resize="contain"
        />
        <Text size={16} weight="semibold" color={colors.white} style={styles.reward_line}>
          You Avail {rewardAmount} Yalla Coins
        </Text>
      </View>

      <Seperator size={8} />
      <Button
        text="Collect Coins"
        onPress={onCollectCoins}
        loading={isClaiming}
        disabled={!canClaim || isClaiming}
      />

      <AlertModal
        visible={showSuccess}
        onClose={onSuccessDismiss}
        type="success"
        title="Success"
        message="Your reward has been claimed. Yalla Coins have been added to your wallet."
      />
    </Wrapper>
  );
};

export default ChallengeReward;
