import { RefreshControl, ScrollView, View } from 'react-native';
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
import styles from './styles';

const ChallengeDetail = () => {
  const {
    values: { challenge, isJoined, isLoading },
    functions: {
      onReload,
      onStart,
      onLeave,
      onStartTodayTask,
      onCompleteTodayTask,
    },
  } = useChallengeDetailController();

  const imageUrl = challenge?.image_url ?? challenge?.image;

  return (
    <Wrapper
      scrollable
      bottom_bar
      loading={isLoading}
      onRefresh={onReload}
      refreshing={isLoading}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onReload} />
        }
      >
        <View style={styles.image_container}>
          <Image
            source={imageUrl ? { uri: imageUrl } : images.dummy}
            style={styles.image}
            resize="cover"
          />
        </View>
        <Seperator size={20} />
        <View style={styles.title_block}>
          <Text size={20} weight="bold" style={styles.title_main}>
            {challenge?.title ?? 'Challenge'}
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
        <Text size={14} color={colors.icon_gray} style={styles.challenge_type_label}>
          Challenge Type: {challenge?.type ?? 'Activity'}
        </Text>
        <Seperator size={16} />
        {challenge?.milestone ? (
          <>
            <View style={styles.detail_row}>
              <View style={styles.detail_icon_wrap}>
                <Icon source={images.clock} size={22} tint_color={colors.white} no_padding />
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
                <Icon source={images.calendar} size={22} tint_color={colors.white} no_padding />
              </View>
              <Text size={14} color={colors.icon_gray} style={styles.detail_text}>
                {challenge.duration} days
              </Text>
            </View>
            <Seperator size={12} />
          </>
        ) : null}
        {challenge?.reward != null ? (
          <>
            <View style={styles.detail_row}>
              <View style={styles.detail_icon_wrap}>
                <Icon source={images.coin} size={22} tint_color="#F5B700" no_padding />
              </View>
              <Text size={14} color={colors.primary} style={styles.detail_text}>
                {challenge.reward} Yalla Coins
              </Text>
            </View>
            <Seperator size={12} />
          </>
        ) : null}
        <Seperator size={24} />
        {!isJoined ? (
          <Button text="Start Challenge" onPress={onStart} />
        ) : (
          <>
            <Button text="Start Today's Task" onPress={onStartTodayTask} />
            <Button
              text="Complete Today's Task"
              type="outlined"
              style={styles.button_spacer}
              onPress={onCompleteTodayTask}
            />
            <Button
              text="Leave Challenge"
              type="secondary"
              textColor={colors.danger}
              style={styles.button_spacer}
              onPress={onLeave}
            />
          </>
        )}
        <Seperator size={40} />
      </ScrollView>
    </Wrapper>
  );
};

export default ChallengeDetail;
