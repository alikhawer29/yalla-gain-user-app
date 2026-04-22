import { useState } from 'react';
import { useGetChallengesQuery } from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import useDebounce from '../../hooks/useDebounce';

const useChallengesController = () => {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isFetching, refetch } = useGetChallengesQuery({
    search: debouncedSearch || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  });

  const challenges = data?.data ?? [];

  const onSearch = (text: string) => setSearch(text);
  const onReload = () => refetch();
  const onPressChallenge = (id: number) => {
    navigate('ChallengeDetail', { id });
  };
  const onPressChallengeLogs = () => {
    navigate('ChallengeLogs');
  };
  const onFilterPress = () => setShowFilterModal(true);
  const onCloseFilterModal = () => setShowFilterModal(false);
  const onApplyFilter = (from: string | null, to: string | null) => {
    setFromDate(from);
    setToDate(to);
  };

  return {
    values: {
      challenges,
      isLoading: isFetching,
      search,
      showFilterModal,
      fromDate,
      toDate,
    },
    functions: {
      onSearch,
      onReload,
      onPressChallenge,
      onPressChallengeLogs,
      onFilterPress,
      onCloseFilterModal,
      onApplyFilter,
    },
  };
};

export default useChallengesController;
