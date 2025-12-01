import { useRoute } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { useGetDoctorReviewsQuery } from '../../redux/Apis/User';

const useReviewsController = () => {
  const route = useRoute();
  const { consultant_id } = route.params as { consultant_id: number };
  const [selectedFilter, setSelectedFilter] = useState<number | 'all'>('all');

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetDoctorReviewsQuery(consultant_id);

  // API response structure
  const responseData = data?.data || data;
  const reviews = responseData?.ratings || [];
  const totalReviews = responseData?.totalCount || 0;
  const averageRating = responseData?.averageRating?.toFixed(1) || '0.0';

  // Filter tabs
  const filterTabs = [
    { label: 'All', value: 'all' as const },
    { label: ' 5', value: 5 },
    { label: ' 4', value: 4 },
    { label: ' 3', value: 3 },
    { label: ' 2', value: 2 },
    { label: ' 1', value: 1 },
  ];

  // Rating breakdown from API response
  const ratingBreakdown = useMemo(() => {
    return [
      {
        star: 5,
        count: responseData?.fiveStarCount || 0,
        percentage: responseData?.fiveStarPercent || 0,
      },
      {
        star: 4,
        count: responseData?.fourStarCount || 0,
        percentage: responseData?.fourStarPercent || 0,
      },
      {
        star: 3,
        count: responseData?.threeStarCount || 0,
        percentage: responseData?.threeStarPercent || 0,
      },
      {
        star: 2,
        count: responseData?.twoStarCount || 0,
        percentage: responseData?.twoStarPercent || 0,
      },
      {
        star: 1,
        count: responseData?.oneStarCount || 0,
        percentage: responseData?.oneStarPercent || 0,
      },
    ];
  }, [responseData]);

  // Filtered reviews based on selected filter
  const filteredReviews = useMemo(() => {
    if (selectedFilter === 'all') return reviews;
    return reviews.filter(
      (review: any) => Math.round(review.rating) === selectedFilter,
    );
  }, [reviews, selectedFilter]);

  const onReload = () => {
    refetch();
  };

  const onFilterChange = (filter: number | 'all') => {
    setSelectedFilter(filter);
  };

  return {
    values: {
      reviews: filteredReviews,
      ratingBreakdown,
      averageRating,
      totalReviews,
      isLoading,
      selectedFilter,
      filterTabs,
    },
    functions: {
      onReload,
      onFilterChange,
    },
  };
};

export default useReviewsController;
