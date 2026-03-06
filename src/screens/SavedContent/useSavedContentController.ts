import { useCallback, useEffect, useState } from 'react';
import useSearch from '../../hooks/useSearch';
import {
  useGetSavedContentQuery,
  useSaveVideoMutation,
} from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';

const useSavedContentController = () => {
  const { search, debouncedSearch, onChange: onSearch } = useSearch();

  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetSavedContentQuery({
    search: debouncedSearch,
    from: fromDate || undefined,
    to: toDate || undefined,
  });
  const [save, { isSuccess: saveSuccess }] = useSaveVideoMutation();

  useEffect(() => {
    if (saveSuccess) {
      refetch();
    }
  }, [saveSuccess]);

  const onSave = useCallback((id: number) => {
    save(id);
  }, []);

  const onPress = useCallback((id: number) => {
    navigate(ROUTES.VIDEO_DETAILS, { id });
  }, []);

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

  return {
    values: {
      data: data?.data || [],
      isLoading,
      search,
      showFilterModal,
      fromDate,
      toDate,
    },
    functions: {
      onReload: refetch,
      onSave,
      onPress,
      onSearch,
      onFilterPress,
      onCloseFilterModal,
      onApplyFilter,
    },
  };
};

export default useSavedContentController;
