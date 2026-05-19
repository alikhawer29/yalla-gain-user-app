import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSubscriptionAccess } from '../../hooks/useSubscriptionAccess';
import { useGetMyBookingsQuery } from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import useDebounce from '../../hooks/useDebounce';

/** Number of records per page. Increase if you want larger chunks. */
const PER_PAGE = 15;

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Reschedule', value: 'rescheduled' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Past', value: 'past' },
  { label: 'Rejected', value: 'rejected' },
];

const TAB_OPTIONS = [
  { label: 'Doctor', value: 'doctor' },
  { label: 'Trainer', value: 'trainer' },
];

const useMyBookingsController = () => {
  const navigation = useNavigation();
  const { requireAccess } = useSubscriptionAccess();

  useFocusEffect(
    useCallback(() => {
      if (!requireAccess('any_appointments')) {
        navigation.goBack();
      }
    }, [navigation, requireAccess]),
  );

  const [selectedTab, setSelectedTab] = useState<string>('doctor');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(1);
  const [accumulatedBookings, setAccumulatedBookings] = useState<any[]>([]);
  /** Shows footer spinner immediately; RTK `isFetching` often lags a frame (noticeable on iOS). */
  const [pendingLoadMore, setPendingLoadMore] = useState(false);
  /** Blocks duplicate `onEndReached` before React commits `pendingLoadMore`. */
  const loadMoreRequestedRef = useRef(false);
  /** Clears pending only when a fetch finishes (`true` → `false`), not while idle before the next request starts. */
  const wasFetchingRef = useRef(false);
  const debouncedSearch = useDebounce(search, 500);

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetMyBookingsQuery({
    type: selectedTab,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    search: debouncedSearch,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    per_page: PER_PAGE,
    page,
  });

  const meta = data?.meta;
  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;
  const total = meta?.total ?? 0;
  const hasMore = currentPage < lastPage;
  const isLoadingMore = pendingLoadMore || (isLoading && page > 1);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
    setAccumulatedBookings([]);
    setPendingLoadMore(false);
    loadMoreRequestedRef.current = false;
    wasFetchingRef.current = false;
  }, [selectedTab, selectedStatus, debouncedSearch, fromDate, toDate]);

  // Accumulate results: replace on page 1, append on next pages (only when response matches current page)
  useEffect(() => {
    if (!data?.data) return;
    const responsePage = meta?.current_page ?? 1;
    if (responsePage === 1) {
      setAccumulatedBookings(data.data);
    } else if (responsePage === page) {
      setAccumulatedBookings(prev => [...prev, ...data.data]);
    }
  }, [data, page, meta?.current_page]);

  const bookings = accumulatedBookings;

  const onReload = useCallback(() => {
    setAccumulatedBookings([]);
    setPendingLoadMore(false);
    loadMoreRequestedRef.current = false;
    wasFetchingRef.current = false;
    if (page === 1) {
      refetch();
    } else {
      setPage(1);
    }
  }, [page, refetch]);

  useEffect(() => {
    if (wasFetchingRef.current && !isLoading) {
      loadMoreRequestedRef.current = false;
      setPendingLoadMore(false);
    }
    wasFetchingRef.current = isLoading;
  }, [isLoading]);

  const onLoadMore = useCallback(() => {
    if (!hasMore || pendingLoadMore || loadMoreRequestedRef.current) return;
    if (page === 1 && isLoading) return;
    if (isLoading && page > 1) return;
    loadMoreRequestedRef.current = true;
    setPendingLoadMore(true);
    setPage(p => p + 1);
  }, [hasMore, pendingLoadMore, isLoading, page]);

  const onSearch = (text: string) => {
    setSearch(text);
  };

  const onTabChange = (value: string | number) => {
    setSelectedTab(value as string);
  };

  const onStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const onBookingPress = (id: number) => {
    navigate(ROUTES.BOOKING_DETAILS, { id });
  };

  const onFilterPress = () => {
    setShowFilterModal(true);
  };

  const onCloseFilterModal = () => {
    setShowFilterModal(false);
  };

  const onApplyFilter = (from: string | null, to: string | null) => {
    setFromDate(from);
    setToDate(to);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return '#FF4F25'; // primary/teal
      case 'rescheduled':
        return '#9747FF'; // orange
      case 'pending':
        return '#D59C00'; // yellow
      case 'in-progress':
      case 'inprogress':
        return '#118076'; // blue
      case 'past':
        return '#C85929'; // gray
      case 'completed':
        return '#808080'; // gray
      case 'rejected':
        return '#F20000'; // red
      default:
        return '#808080';
    }
  };

  return {
    values: {
      bookings,
      isLoading,
      isLoadingMore,
      hasMore,
      total,
      search,
      selectedTab,
      selectedStatus,
      tabs: TAB_OPTIONS,
      statusFilters: STATUS_FILTERS,
      showFilterModal,
      fromDate,
      toDate,
    },
    functions: {
      onReload,
      onLoadMore,
      onSearch,
      onTabChange,
      onStatusChange,
      onBookingPress,
      getStatusColor,
      onFilterPress,
      onCloseFilterModal,
      onApplyFilter,
    },
  };
};

export default useMyBookingsController;
