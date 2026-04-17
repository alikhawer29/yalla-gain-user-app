import { useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSearch from '../../hooks/useSearch';
import {
  useGetMuscleExerciseTypesQuery,
  useGetVideosByWorkoutQuery,
  useSaveVideoMutation,
} from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';

type WorkoutDetailParams = { id?: number; muscle_id?: number };

function toPositiveInt(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && /^\d+$/.test(v)) return Number(v);
  return undefined;
}

/** Pull muscle id from a video row — adjust keys if your API uses others. */
function inferMuscleIdFromVideoItem(item: unknown): number | undefined {
  if (!item || typeof item !== 'object') return undefined;
  const o = item as Record<string, unknown>;
  const top = toPositiveInt(o.muscle_id);
  if (top != null) return top;
  const ex = o.exercise;
  if (ex && typeof ex === 'object') {
    const e = ex as Record<string, unknown>;
    const em = toPositiveInt(e.muscle_id);
    if (em != null) return em;
    const emuscle = e.muscle;
    if (emuscle && typeof emuscle === 'object') {
      const id = toPositiveInt((emuscle as { id?: unknown }).id);
      if (id != null) return id;
    }
  }
  const m = o.muscle;
  if (m && typeof m === 'object') {
    const id = toPositiveInt((m as { id?: unknown }).id);
    if (id != null) return id;
  }
  return undefined;
}

const useWorkoutDetailController = () => {
  const { params } = useRoute();
  const routeParams = (params ?? {}) as WorkoutDetailParams;
  const { id: workoutContentId, muscle_id: muscleIdFromRoute } = routeParams;

  const { search, debouncedSearch, onChange: onSearch } = useSearch();
  const [exerciseId, setExerciseId] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  /** Route param or inferred from videos; kept when filtered list is empty. */
  const [stableMuscleId, setStableMuscleId] = useState<number | undefined>(() =>
    muscleIdFromRoute != null ? muscleIdFromRoute : undefined,
  );

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetVideosByWorkoutQuery({
    id: workoutContentId,
    params: {
      search: debouncedSearch || undefined,
      exercise_id: exerciseId ?? undefined,
    },
  });

  useEffect(() => {
    if (muscleIdFromRoute != null && muscleIdFromRoute !== undefined) {
      setStableMuscleId(muscleIdFromRoute);
      return;
    }
    const list = data?.data;
    if (!Array.isArray(list) || list.length === 0) return;
    for (const item of list) {
      const mid = inferMuscleIdFromVideoItem(item);
      if (mid != null) {
        setStableMuscleId(mid);
        return;
      }
    }
  }, [muscleIdFromRoute, data?.data]);

  /** Only route `muscle_id` or value inferred from video rows — never workout-content id. */
  const exerciseTypesMuscleId = useMemo(
    () => muscleIdFromRoute ?? stableMuscleId ?? undefined,
    [muscleIdFromRoute, stableMuscleId],
  );

  const {
    data: exerciseTypesPayload,
    isFetching: exerciseTypesLoading,
  } = useGetMuscleExerciseTypesQuery(Number(exerciseTypesMuscleId), {
    skip: exerciseTypesMuscleId == null,
  });

  const exerciseTypes = useMemo(() => {
    const raw = exerciseTypesPayload as
      | { data?: { id: number; name: string; muscle_id?: number }[] }
      | undefined;
    return raw?.data ?? [];
  }, [exerciseTypesPayload]);

  const [save, { isSuccess: saveSuccess }] = useSaveVideoMutation();

  useEffect(() => {
    if (saveSuccess) {
      refetch();
    }
  }, [saveSuccess]);

  const onSave = useCallback((videoId: number) => {
    save(videoId);
  }, []);

  const onPress = useCallback((videoId: number) => {
    navigate(ROUTES.VIDEO_DETAILS, { id: videoId });
  }, []);

  const onFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const onCloseFilterModal = useCallback(() => {
    setShowFilterModal(false);
  }, []);

  const onApplyExerciseFilter = useCallback((idFilter: number | null) => {
    setExerciseId(idFilter);
  }, []);

  return {
    values: {
      data: data?.data || [],
      isLoading,
      search,
      params: routeParams,
      showFilterModal,
      exerciseId,
      exerciseTypes,
      exerciseTypesLoading,
    },
    functions: {
      onReload: refetch,
      onSave,
      onPress,
      onSearch,
      onFilterPress,
      onCloseFilterModal,
      onApplyExerciseFilter,
    },
  };
};

export default useWorkoutDetailController;
