import { FlatList, RefreshControl, View } from 'react-native';
import images from '../../assets/images';
import Input from '../../components/Input';
import Row from '../../components/Row';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import colors from '../../utils/colors';
import { heightPixel } from '../../utils/helper';
import useChallengeLogsController from './useChallengeLogsController';

const ChallengeLogs = () => {
  const {
    values: { logs, isLoading, search },
    functions: { onSearch, onReload },
  } = useChallengeLogsController();

  return (
    <Wrapper>
      <Row style={{ marginBottom: heightPixel(15) }} align="center" gap={10}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Search challenge logs"
            height={40}
            icon={images.search}
            value={search}
            onChangeText={onSearch}
          />
        </View>
      </Row>
      <FlatList
        data={logs}
        keyExtractor={(item) => String(item.id ?? item.challenge_id ?? Math.random())}
        renderItem={({ item }) => (
          <View
            style={{
              padding: heightPixel(12),
              backgroundColor: colors.grayish_black,
              borderRadius: heightPixel(8),
              marginBottom: heightPixel(10),
            }}
          >
            <Text weight="semibold" size={15}>
              {item.challenge?.title ?? item.title ?? 'Challenge'}
            </Text>
            <Text size={13} color={colors.icon_gray} style={{ marginTop: 4 }}>
              {item.completed_at
                ? `Completed: ${new Date(item.completed_at).toLocaleDateString()}`
                : item.created_at
                  ? `Started: ${new Date(item.created_at).toLocaleDateString()}`
                  : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text color={colors.icon_gray} position="center" style={{ marginTop: heightPixel(40) }}>
              No challenge logs yet.
            </Text>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onReload} />
        }
      />
    </Wrapper>
  );
};

export default ChallengeLogs;
