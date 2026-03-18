import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationUnreadMutation,
} from '../../redux/Apis/User';

const NOTIFICATION_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Read', value: 'read' },
  { label: 'Unread', value: 'unread' },
];

const PER_PAGE = 15;

const useNotificationController = () => {
  const [selectedTab, setSelectedTab] = useState<string>(
    NOTIFICATION_TABS[0].value,
  );
  const [page, setPage] = useState(1);
  const [accumulatedNotifications, setAccumulatedNotifications] = useState<
    any[]
  >([]);

  const statusParam = useMemo(() => {
    if (selectedTab === 'all') return undefined;
    return selectedTab;
  }, [selectedTab]);

  const {
    data,
    isFetching: isLoading,
    refetch,
    fulfilledTimeStamp,
  } = useGetNotificationsQuery({
    per_page: PER_PAGE,
    page,
    status: statusParam,
  });

  const [markRead] = useMarkNotificationReadMutation();
  const [markUnread] = useMarkNotificationUnreadMutation();

  const meta = data?.meta;
  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;
  const hasMore = currentPage < lastPage;
  const isLoadingMore = isLoading && page > 1;
  const isInitialLoading = isLoading && page === 1 && accumulatedNotifications.length === 0;
  const isRefreshing = isLoading && page === 1 && accumulatedNotifications.length > 0;

  useEffect(() => {
    setPage(1);
    setAccumulatedNotifications([]);
  }, [selectedTab]);

  useEffect(() => {
    const rows = data?.data;
    if (!rows) return;

    const responsePage = meta?.current_page ?? 1;
    if (responsePage === 1) {
      setAccumulatedNotifications(rows);
    } else if (responsePage === page) {
      setAccumulatedNotifications(prev => [...prev, ...rows]);
    }
  }, [fulfilledTimeStamp, page, meta?.current_page]);

  const notifications = useMemo(() => {
    return accumulatedNotifications.map((n: any) => ({
      ...n,
      is_read: !!n?.read,
    }));
  }, [accumulatedNotifications]);

  const onReload = useCallback(() => {
    if (page === 1) {
      refetch();
    } else {
      setPage(1);
    }
  }, [page, refetch]);

  const onLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setPage(p => p + 1);
    }
  }, [hasMore, isLoadingMore]);

  const toggleReadStatus = useCallback(
    async (uuid: string, isCurrentlyRead: boolean) => {
      try {
        if (isCurrentlyRead) {
          await markUnread({ uuid }).unwrap();
        } else {
          await markRead({ uuid }).unwrap();
        }
      } finally {
        refetch();
      }
    },
    [markRead, markUnread, refetch],
  );

  return {
    values: {
      tabs: NOTIFICATION_TABS,
      selectedTab,
      notifications,
      isLoading,
      isInitialLoading,
      isRefreshing,
      isLoadingMore,
      hasMore,
    },
    functions: {
      setSelectedTab,
      toggleReadStatus,
      onReload,
      onLoadMore,
    },
  };
};

export default useNotificationController;
