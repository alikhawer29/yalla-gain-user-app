import { FlatList, RefreshControl, View } from 'react-native';
import images from '../../assets/images';
import ChallengeCard from '../../components/Cards/ChallengeCard';
import Button from '../../components/Button';
import DateFilterModal from '../../components/DateFilterModal';
import Icon from '../../components/Icon';
import Input from '../../components/Input';
import Row from '../../components/Row';
import Seperator from '../../components/Seperator';
import Touchable from '../../components/Touchable';
import Wrapper from '../../components/Wrapper';
import colors from '../../utils/colors';
import { heightPixel } from '../../utils/helper';
import useChallengesController from './useChallengesController';

const Challenges = () => {
  const {
    values: { challenges, isLoading, search, showFilterModal, fromDate, toDate },
    functions: {
      onSearch,
      onReload,
      onPressChallenge,
      onPressChallengeLogs,
      onFilterPress,
      onCloseFilterModal,
      onApplyFilter,
    },
  } = useChallengesController();

  return (
    <Wrapper>
      <Row style={{ marginBottom: heightPixel(15) }} align="center" gap={10}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Search Challenges"
            height={40}
            icon={images.search}
            value={search}
            onChangeText={onSearch}
          />
        </View>
        <Touchable onPress={onFilterPress}>
          <Icon
            source={images.challenges?.filter ?? images.filters}
            size={40}
            rounded
            less_rounded
            border={fromDate || toDate ? colors.primary : colors.white}
          />
        </Touchable>
      </Row>
      <Button
        text="Challenge Logs"
        type="outlined"
        onPress={onPressChallengeLogs}
        style={{ marginBottom: heightPixel(20), borderColor: colors.primary }}
      />
      <FlatList
        data={challenges}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <ChallengeCard
            id={item.id}
            image={item.image_url ?? item.image}
            title={item.title ?? ''}
            type={item.type ?? 'Activity'}
            status={
              item.user_challenge?.id ||
              item.user_challenge_id ||
              item.is_started === true ||
              item.is_joined ||
              item.challenge_progress?.id ||
              item.challenge_status === 'ongoing'
                ? 'ongoing'
                : (item.challenge_status ?? item.status ?? 'new')
            }
            onPress={() => onPressChallenge(item.id)}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={() => <Seperator size={15} />}
        ListEmptyComponent={null}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onReload} />
        }
      />
      <DateFilterModal
        visible={showFilterModal}
        onClose={onCloseFilterModal}
        onApply={onApplyFilter}
        initialFromDate={fromDate}
        initialToDate={toDate}
      />
    </Wrapper>
  );
};

export default Challenges;
