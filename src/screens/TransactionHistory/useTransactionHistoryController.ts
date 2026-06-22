import { useCallback, useEffect, useRef, useState } from 'react';
import { useGetActivityLogsQuery } from '../../redux/Apis/User';
import {
  ACTIVITY_LOG_TABS,
  ActivityLogItem,
  ActivityLogType,
} from '../../utils/activityLog';
import { navigateToBookingDetails } from '../../utils/navigation';

const PER_PAGE = 15;

const useTransactionHistoryController = () => {
  const [selectedTab, setSelectedTab] = useState<ActivityLogType>('all');
  const [page, setPage] = useState(1);
  const [accumulatedLogs, setAccumulatedLogs] = useState<ActivityLogItem[]>([]);
  const [pendingLoadMore, setPendingLoadMore] = useState(false);
  const loadMoreRequestedRef = useRef(false);
  const wasFetchingRef = useRef(false);

  const { data, isFetching, refetch } = useGetActivityLogsQuery({
    type: selectedTab,
    per_page: PER_PAGE,
    page,
  });

  const meta = data?.meta;
  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;
  const total = meta?.total ?? 0;
  const hasMore = currentPage < lastPage;
  const isLoading = isFetching && page === 1 && accumulatedLogs.length === 0;
  const isLoadingMore = pendingLoadMore || (isFetching && page > 1);

  useEffect(() => {
    setPage(1);
    setAccumulatedLogs([]);
    setPendingLoadMore(false);
    loadMoreRequestedRef.current = false;
    wasFetchingRef.current = false;
  }, [selectedTab]);

  useEffect(() => {
    if (!data?.data) return;
    const responsePage = meta?.current_page ?? 1;
    if (responsePage === 1) {
      setAccumulatedLogs(data.data);
    } else if (responsePage === page) {
      setAccumulatedLogs(prev => [...prev, ...data.data]);
    }
  }, [data, page, meta?.current_page]);

  useEffect(() => {
    if (wasFetchingRef.current && !isFetching) {
      loadMoreRequestedRef.current = false;
      setPendingLoadMore(false);
    }
    wasFetchingRef.current = isFetching;
  }, [isFetching]);

  const onReload = useCallback(() => {
    setAccumulatedLogs([]);
    setPendingLoadMore(false);
    loadMoreRequestedRef.current = false;
    wasFetchingRef.current = false;
    if (page === 1) {
      refetch();
    } else {
      setPage(1);
    }
  }, [page, refetch]);

  const onLoadMore = useCallback(() => {
    if (!hasMore || pendingLoadMore || loadMoreRequestedRef.current) return;
    if (page === 1 && isFetching) return;
    if (isFetching && page > 1) return;
    loadMoreRequestedRef.current = true;
    setPendingLoadMore(true);
    setPage(p => p + 1);
  }, [hasMore, pendingLoadMore, isFetching, page]);

  const onTabChange = (value: string | number) => {
    setSelectedTab(value as ActivityLogType);
  };

  const onLogPress = useCallback((item: ActivityLogItem) => {
    if (item.type === 'tips' && item.meta?.appointment_id) {
      navigateToBookingDetails(item.meta.appointment_id);
    }
  }, []);

  return {
    values: {
      logs: accumulatedLogs,
      tabs: ACTIVITY_LOG_TABS,
      selectedTab,
      isLoading,
      isLoadingMore,
      isRefreshing: isFetching && page === 1 && accumulatedLogs.length > 0,
      hasMore,
      total,
    },
    functions: {
      onReload,
      onLoadMore,
      onTabChange,
      onLogPress,
    },
  };
};

export default useTransactionHistoryController;
