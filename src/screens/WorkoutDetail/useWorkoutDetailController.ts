import { useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import useSearch from '../../hooks/useSearch';
import {
  useGetVideosByWorkoutQuery,
  useSaveVideoMutation,
} from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';

const useWorkoutDetailController = () => {
  const { params } = useRoute();
  const { search, debouncedSearch, onChange: onSearch } = useSearch();
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetVideosByWorkoutQuery({
    id: params?.id,
    params: {
      search: debouncedSearch,
      from: fromDate || undefined,
      to: toDate || undefined,
    },
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

  const onFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const onCloseFilterModal = useCallback(() => {
    setShowFilterModal(false);
  }, []);

  const onApplyFilter = useCallback(
    (from: string | null, to: string | null) => {
      setFromDate(from);
      setToDate(to);
    },
    [],
  );

  return {
    values: {
      data: data?.data || [],
      isLoading,
      search,
      params,
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

export default useWorkoutDetailController;
