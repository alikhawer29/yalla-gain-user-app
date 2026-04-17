import { useState } from 'react';
import { useGetChallengesQuery } from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import useDebounce from '../../hooks/useDebounce';

const useChallengesController = () => {
  const [search, setSearch] = useState('');
  const [bodyPartType, setBodyPartType] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isFetching, refetch } = useGetChallengesQuery({
    search: debouncedSearch || undefined,
    type: bodyPartType || undefined,
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
  const onApplyBodyPartFilter = (type: string) => {
    setBodyPartType(type);
  };

  return {
    values: {
      challenges,
      isLoading: isFetching,
      search,
      bodyPartType,
      showFilterModal,
    },
    functions: {
      onSearch,
      onReload,
      onPressChallenge,
      onPressChallengeLogs,
      onFilterPress,
      onCloseFilterModal,
      onApplyBodyPartFilter,
    },
  };
};

export default useChallengesController;
