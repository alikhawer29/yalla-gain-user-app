import { useState, useMemo } from 'react';
import { useGetMyBookingsQuery } from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import useDebounce from '../../hooks/useDebounce';

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
  const [selectedTab, setSelectedTab] = useState<string>('doctor');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetMyBookingsQuery({
    type: selectedTab,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    search: debouncedSearch,
  });

  const bookings = data?.data || [];

  const onReload = () => {
    refetch();
  };

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return '#FF4F25'; // primary/teal
      case 'rescheduled':
        return '#9747FF'; // orange
      case 'pending':
        return '#D59C00'; // yellow
      case 'in_progress':
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
      search,
      selectedTab,
      selectedStatus,
      tabs: TAB_OPTIONS,
      statusFilters: STATUS_FILTERS,
    },
    functions: {
      onReload,
      onSearch,
      onTabChange,
      onStatusChange,
      onBookingPress,
      getStatusColor,
    },
  };
};

export default useMyBookingsController;
