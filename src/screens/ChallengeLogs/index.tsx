import React from 'react';
import { FlatList, RefreshControl, View, StyleSheet } from 'react-native';
import images from '../../assets/images';
import Input from '../../components/Input';
import Row from '../../components/Row';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import Icon from '../../components/Icon';
import Touchable from '../../components/Touchable';
import CardWrapper from '../../components/CardWrapper';
import DateFilterModal from '../../components/DateFilterModal';
import colors from '../../utils/colors';
import { font, heightPixel, widthPixel } from '../../utils/helper';
import { goBack } from '../../utils/navigation';
import useChallengeLogsController from './useChallengeLogsController';
import { capitalizeFirst, capitalizeWords } from '../../utils/data';

const ChallengeLogs = () => {
  const {
    values: { logs, isLoading, search, fromDate, toDate, showFilterModal },
    functions: { onSearch, onReload, onFilterPress, onCloseFilterModal, onApplyFilter },
  } = useChallengeLogsController();

  const renderSearch = () => (
    <Row style={styles.searchContainer} align="center" gap={10}>
      <View style={{ flex: 1 }}>
        <Input
          placeholder="Search challenge logs"
          height={40}
          icon={images.search}
          value={search}
          onChangeText={onSearch}
          style={styles.searchInput}
        />
      </View>
      <Touchable onPress={onFilterPress}>
        <Icon
          source={images.filters}
          size={40}
          rounded
          less_rounded
          border={(fromDate || toDate) ? colors.primary : colors.white}
        />
      </Touchable>
    </Row>
  );

  const renderItem = ({ item }: { item: any }) => {
    const challenge = item.challenge || {};
    const status = item.status || 'ongoing';
    const isCompleted = status === 'completed';
    const isFailed = status === 'failed';

    return (
      <CardWrapper
        color={colors.blackish_gray}
        padding={15}
        border_radius={15}
        height="auto"
        style={styles.card}
      >
        <Row justify="space-between" align="flex-start">
          <View style={{ flex: 1 }}>
            <Text weight="bold" size={20} color={colors.white}>
              {capitalizeFirst(challenge.title) || 'Challenge Title'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text size={14} color={colors.white} weight="semibold">
              Challenge Type: <Text size={14} color={colors.icon_gray}>{capitalizeWords(challenge.type ?? '') || 'N/A'}</Text>
            </Text>
          </View>
        </Row>

        <Row justify="space-between" align="center" style={{ marginTop: heightPixel(8) }}>
          <Row align="center" gap={8} style={{ flex: 1 }}>
            <Icon source={images.calendar} size={18} tint_color={colors.white} />
            <Text size={14} color={colors.white}>
              {item.created_at || item.start_date || 'N/A'}
            </Text>
          </Row>
          <Text size={14} color={colors.white} weight="semibold">
            Avail : <Text size={14} color={colors.icon_gray}>{challenge.reward || '0'} Points</Text>
          </Text>
        </Row>

        <Row align="center" gap={8} style={{ marginTop: heightPixel(12) }}>
          <Icon source={images.milestone} size={18} tint_color={colors.white} />
          <Text size={14} color={colors.white} style={{ flex: 1 }}>
            {challenge.milestone || 'No Milestone available'}
          </Text>
        </Row>

        <Row justify="space-between" align="center" style={{ marginTop: heightPixel(12) }}>
          <Row align="center" gap={8}>
            <Icon source={images.duration} size={18} tint_color={colors.white} />
            <Text size={14} color={colors.white}>
              Duration {challenge.duration || '0'} Days
            </Text>
          </Row>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isCompleted ? colors.completed : isFailed ? colors.danger : colors.primary,
              },
            ]}
          >
            <Text weight="semibold" size={12} color={colors.white}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </Row>
      </CardWrapper>
    );
  };

  return (
    <Wrapper>
      {/* {renderHeader()} */}
      {renderSearch()}
      <FlatList
        data={logs}
        keyExtractor={(item) => String(item.id ?? Math.random())}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text color={colors.icon_gray} position="center">
                No challenge logs found.
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onReload}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
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

const styles = StyleSheet.create({
  header: {
    marginTop: heightPixel(10),
    marginBottom: heightPixel(20),
  },
  searchContainer: {
    marginBottom: heightPixel(20),
  },
  searchInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: heightPixel(10),
  },
  listContent: {
    paddingBottom: heightPixel(100), // More space for bottom bar if any
  },
  card: {
    marginBottom: heightPixel(18),
  },
  statusBadge: {
    paddingHorizontal: widthPixel(12),
    paddingVertical: heightPixel(5),
    borderRadius: heightPixel(6),
    minWidth: widthPixel(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    marginTop: heightPixel(100),
    alignItems: 'center',
  },
});

export default ChallengeLogs;

