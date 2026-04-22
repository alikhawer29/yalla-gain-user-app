import { useCallback, useMemo, useState } from 'react';
import useSearch from '../../hooks/useSearch';
import { useGetMusclesQuery, useGetWorkoutQuery } from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';

const useWorkoutController = () => {
  const { search, debouncedSearch, onChange: onSearch } = useSearch();

  const [muscleId, setMuscleId] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { data: musclesPayload, isFetching: musclesLoading } =
    useGetMusclesQuery();

  const muscles = useMemo(() => {
    const raw = musclesPayload as { data?: { id: number; name: string }[] } | undefined;
    return raw?.data ?? [];
  }, [musclesPayload]);

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetWorkoutQuery({
    search: debouncedSearch || undefined,
    muscle_id: muscleId ?? undefined,
  });

  const onWorkoutPress = useCallback(
    (item: { id: number; muscle_id?: number }) => {
      const resolvedMuscle =
        item.muscle_id != null ? item.muscle_id : muscleId != null ? muscleId : undefined;
      navigate(ROUTES.WORKOUT_DETAILS, {
        id: item.id,
        ...(resolvedMuscle != null ? { muscle_id: resolvedMuscle } : {}),
      });
    },
    [muscleId],
  );

  const onFilterPress = () => {
    setShowFilterModal(true);
  };

  const onCloseFilterModal = () => {
    setShowFilterModal(false);
  };

  const onApplyMuscleFilter = (id: number | null) => {
    setMuscleId(id);
  };

  return {
    values: {
      data: data?.data || [],
      isLoading,
      search,
      showFilterModal,
      muscleId,
      muscles,
      musclesLoading,
    },
    functions: {
      onReload: refetch,
      onWorkoutPress,
      onSearch,
      onFilterPress,
      onCloseFilterModal,
      onApplyMuscleFilter,
    },
  };
};

export default useWorkoutController;
