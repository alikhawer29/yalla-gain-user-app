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

  const { data, isFetching: isLoading, refetch } = useViewDoctorQuery(id);

  const consultant = data?.data;
  const services = consultant?.services || [];

  const filteredServices = services.filter((service: any) =>
    service.title?.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const onReload = () => {
    refetch();
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
