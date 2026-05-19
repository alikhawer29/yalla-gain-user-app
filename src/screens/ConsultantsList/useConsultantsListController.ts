import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useSubscriptionAccess } from '../../hooks/useSubscriptionAccess';
import {
  useGetAllDoctorsQuery,
  useGetAllTrainersQuery,
} from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import useDebounce from '../../hooks/useDebounce';

const PER_PAGE = 15;

const useConsultantsListController = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { type } = route.params as { type: 'doctor' | 'trainer' };
  const { requireAccess } = useSubscriptionAccess();
  const appointmentFeature =
    type === 'doctor' ? 'doctor_appointments' : 'trainer_appointments';

  useFocusEffect(
    useCallback(() => {
      if (!requireAccess(appointmentFeature)) {
        navigation.goBack();
      }
    }, [appointmentFeature, navigation, requireAccess]),
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
    setAccumulatedData([]);
  }, [debouncedSearch]);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      page,
      per_page: PER_PAGE,
    }),
    [debouncedSearch, page],
  );

  const {
    data: doctorsData,
    isFetching: isDoctorsFetching,
    refetch: refetchDoctors,
  } = useGetAllDoctorsQuery(queryParams, { skip: type !== 'doctor' });

  const {
    data: trainersData,
    isFetching: isTrainersFetching,
    refetch: refetchTrainers,
  } = useGetAllTrainersQuery(queryParams, { skip: type !== 'trainer' });

  const apiData = type === 'doctor' ? doctorsData : trainersData;
  const isFetching = type === 'doctor' ? isDoctorsFetching : isTrainersFetching;

  const rows = Array.isArray(apiData?.data) ? apiData.data : [];

  const meta = apiData?.meta;
  const currentPage = meta?.current_page ?? page;
  const lastPage = meta?.last_page ?? 1;
  const hasMore =
    meta != null
      ? currentPage < lastPage
      : rows.length >= PER_PAGE;

  useEffect(() => {
    const nextRows = Array.isArray(apiData?.data) ? apiData.data : [];
    if (!nextRows.length) {
      if (page === 1) setAccumulatedData([]);
      return;
    }
    if (page === 1) {
      setAccumulatedData(nextRows);
    } else if (currentPage === page) {
      setAccumulatedData(prev => [...prev, ...nextRows]);
    }
  }, [apiData, page, currentPage]);

  const data = accumulatedData;

  const isInitialLoading = isFetching && page === 1;
  const isLoadingMore = isFetching && page > 1;

  const onReload = () => {
    setPage(1);
    setAccumulatedData([]);
    if (type === 'doctor') {
      refetchDoctors();
    } else {
      refetchTrainers();
    }
  };

  const onLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      setPage(p => p + 1);
    }
  };

  const onSearch = (text: string) => {
    setSearch(text);
  };

  const onPress = (id: number) => {
    const title = type === 'doctor' ? 'Doctor Profile' : 'Trainer Profile';
    navigate(ROUTES.CONSULTANT_PROFILE, { id, type, title });
  };

  return {
    values: {
      data,
      isLoading: isInitialLoading,
      isLoadingMore,
      hasMore,
      search,
      type,
    },
    functions: {
      onReload,
      onLoadMore,
      onSearch,
      onPress,
    },
  };
};

export default useConsultantsListController;
