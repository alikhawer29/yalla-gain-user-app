import { useState } from 'react';
import { useGetChallengeLogsQuery } from '../../redux/Apis/User';
import useDebounce from '../../hooks/useDebounce';

const useChallengeLogsController = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isFetching, refetch } = useGetChallengeLogsQuery({
    search: debouncedSearch || undefined,
  });

  const logs = data?.data ?? [];

  return {
    values: { logs, isLoading: isFetching, search },
    functions: {
      onSearch: setSearch,
      onReload: refetch,
    },
  };
};

export default useChallengeLogsController;
