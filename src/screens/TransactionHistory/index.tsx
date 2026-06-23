import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import ActivityLogCard from '../../components/Cards/ActivityLogCard';
import Empty from '../../components/Empty';
import Loader from '../../components/Loader';
import Seperator from '../../components/Seperator';
import Text from '../../components/Text';
import Touchable from '../../components/Touchable';
import Wrapper from '../../components/Wrapper';
import colors from '../../utils/colors';
import { heightPixel } from '../../utils/helper';
import useTransactionHistoryController from './useTransactionHistoryController';
import styles from './styles';

const TransactionHistory = () => {
  const {
    values: {
      logs,
      tabs,
      selectedTab,
      isLoading,
      isLoadingMore,
      isRefreshing,
    },
    functions: { onReload, onLoadMore, onTabChange },
  } = useTransactionHistoryController();

  return (
    <Wrapper scrollable={false}>
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={{ paddingRight: heightPixel(10), gap: heightPixel(10) }}
        >
          {tabs.map(tab => {
            const isSelected = selectedTab === tab.value;
            return (
              <Touchable
                key={tab.value}
                style={[styles.tabItem, isSelected && styles.tabItemSelected]}
                onPress={() => onTabChange(tab.value)}
              >
                <Text
                  size={14}
                  weight={isSelected ? 'bold' : 'semibold'}
                  color={isSelected ? colors.primary : colors.white}
                >
                  {tab.label}
                </Text>
              </Touchable>
            );
          })}
        </ScrollView>

        <View style={styles.listWrap}>
          {isLoading ? (
            <View style={styles.tabLoadingWrap}>
              <Loader />
            </View>
          ) : (
            <FlatList
              data={logs}
              extraData={isLoadingMore}
              removeClippedSubviews={false}
              renderItem={({ item }) => <ActivityLogCard item={item} />}
              keyExtractor={item => `${item.type}-${item.id}`}
              ItemSeparatorComponent={() => <Seperator size={4} />}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={
                logs.length === 0
                  ? { flexGrow: 1 }
                  : { paddingBottom: heightPixel(8) }
              }
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onReload}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
              onEndReached={onLoadMore}
              onEndReachedThreshold={Platform.OS === 'ios' ? 0.45 : 0.3}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Empty message="No transaction history found" />
                </View>
              }
              ListFooterComponent={
                isLoadingMore ? (
                  <View
                    style={{
                      minHeight: heightPixel(56),
                      paddingVertical: heightPixel(12),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : (
                  <View style={{ height: heightPixel(4) }} />
                )
              }
            />
          )}

          {isLoadingMore ? (
            <View style={styles.loadMoreOverlay} pointerEvents="none">
              <View style={styles.loadMorePill}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text size={13} color={colors.white}>
                  Loading more…
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Wrapper>
  );
};

export default TransactionHistory;
