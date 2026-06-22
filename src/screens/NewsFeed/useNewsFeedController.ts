import { useCallback, useState } from 'react';
import { useGetFeedsQuery, useSearchPostUsersQuery } from '../../redux/Apis/User';
import useDebounce from '../../hooks/useDebounce';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';

export interface PostSearchUser {
  id: number;
  first_name: string;
  last_name: string;
  type: string;
  photo?: string;
}

const useNewsFeedController = () => {
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search.trim(), 400);

  const { data, isLoading, isFetching, refetch } = useGetFeedsQuery({ page });
  const { data: searchData, isFetching: isSearching } = useSearchPostUsersQuery(
    debouncedSearch,
    { skip: debouncedSearch.length === 0 },
  );

  const searchResults: PostSearchUser[] = searchData?.data ?? [];
  const trimmedSearch = search.trim();
  const showSearchResults = trimmedSearch.length > 0;
  const isSearchPending = trimmedSearch !== debouncedSearch;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (data?.meta?.current_page < data?.meta?.last_page && !isFetching) {
      setPage(prevPage => prevPage + 1);
    }
  }, [data?.meta?.current_page, data?.meta?.last_page, isFetching]);

  const onSearch = useCallback((text: string) => {
    setSearch(text);
  }, []);

  const onUserPress = useCallback((userId: number) => {
    setSearch('');
    navigate(ROUTES.USER_PROFILE, { userId });
  }, []);

  return {
    values: {
      data,
      isLoading,
      isFetching,
      isRefreshing,
      search,
      searchResults,
      showSearchResults,
      isSearching: isSearching || isSearchPending,
    },
    functions: {
      handleRefresh,
      handleLoadMore,
      onSearch,
      onUserPress,
      refetch,
    },
  };
};

export default useNewsFeedController;
