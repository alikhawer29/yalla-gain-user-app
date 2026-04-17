import { useState } from 'react';
import { useGetChallengeLogsQuery } from '../../redux/Apis/User';
import useDebounce from '../../hooks/useDebounce';

const useChallengeLogsController = () => {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isFetching, refetch } = useGetChallengeLogsQuery({
    search: debouncedSearch || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  });

  const logs = data?.data ?? [];

  return {
    values: {
      logs,
      isLoading: isFetching,
      search,
      fromDate,
      toDate,
      showFilterModal,
    },
    functions: {
      onSearch: setSearch,
      onReload: refetch,
      onFilterPress: () => setShowFilterModal(true),
      onCloseFilterModal: () => setShowFilterModal(false),
      onApplyFilter: (from: string | null, to: string | null) => {
        setFromDate(from);
        setToDate(to);
      },
    },
  };
};

export default useChallengeLogsController;
