import { useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { useViewDoctorQuery } from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import useDebounce from '../../hooks/useDebounce';

const useConsultantProfileController = () => {
  const route = useRoute();
  const { id, type } = route.params as {
    id: number;
    type: 'doctor' | 'trainer';
  };

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isFetching, refetch } = useViewDoctorQuery(id);

  const consultant = data?.data;
  const services = consultant?.services || [];

  const filteredServices = services.filter((service: any) =>
    service.title?.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  /** Pull-to-refresh only; avoid full-screen loader on refetch when data exists. */
  const isRefreshing = isFetching && !isLoading;

  const onReload = () => {
    void refetch();
  };

  const onSearch = (text: string) => {
    setSearch(text);
  };

  const onServicePress = (serviceId: number) => {
    navigate(ROUTES.SERVICE_DETAILS, { id: serviceId, type });
  };

  const onShowReviews = () => {
    navigate(ROUTES.REVIEWS, { consultant_id: id });
  };

  return {
    values: {
      consultant,
      services: filteredServices,
      isLoading,
      isRefreshing,
      search,
      type,
    },
    functions: {
      onReload,
      onSearch,
      onServicePress,
      onShowReviews,
    },
  };
};

export default useConsultantProfileController;
