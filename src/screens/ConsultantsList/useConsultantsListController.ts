import { useRoute } from '@react-navigation/native';
import { useState, useMemo } from 'react';
import {
  useGetAllDoctorsQuery,
  useGetAllTrainersQuery,
} from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import useDebounce from '../../hooks/useDebounce';

const useConsultantsListController = () => {
  const route = useRoute();
  const { type } = route.params as { type: 'doctor' | 'trainer' };

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const {
    data: doctorsData,
    isFetching: isDoctorsFetching,
    refetch: refetchDoctors,
  } = useGetAllDoctorsQuery(
    { search: debouncedSearch },
    { skip: type !== 'doctor' },
  );

  const {
    data: trainersData,
    isFetching: isTrainersFetching,
    refetch: refetchTrainers,
  } = useGetAllTrainersQuery(
    { search: debouncedSearch },
    { skip: type !== 'trainer' },
  );

  const data = useMemo(() => {
    if (type === 'doctor') {
      return doctorsData?.data || [];
    }
    return trainersData?.data || [];
  }, [type, doctorsData, trainersData]);

  const isLoading = type === 'doctor' ? isDoctorsFetching : isTrainersFetching;

  const onReload = () => {
    if (type === 'doctor') {
      refetchDoctors();
    } else {
      refetchTrainers();
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
      isLoading,
      search,
      type,
    },
    functions: {
      onReload,
      onSearch,
      onPress,
    },
  };
};

export default useConsultantsListController;
