import { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  useGetChallengeByIdQuery,
  useClaimChallengeRewardMutation,
} from '../../redux/Apis/User';
import { goBack } from '../../utils/navigation';

const useChallengeRewardController = () => {
  const route = useRoute();
  const { id } = (route.params ?? {}) as { id: number };

  const { data, isLoading } = useGetChallengeByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });
  const [claimChallengeReward, { isLoading: isClaiming }] =
    useClaimChallengeRewardMutation();

  const [showSuccess, setShowSuccess] = useState(false);

  const challenge = data?.data ?? data;

  const onCollectCoins = async () => {
    try {
      await claimChallengeReward(id).unwrap();
      setShowSuccess(true);
    } catch {
      // RTK / global handlers
    }
  };

  const onSuccessDismiss = () => {
    setShowSuccess(false);
    goBack();
  };

  const isInitialLoad = isLoading && !data;

  return {
    values: {
      challenge,
      isInitialLoad,
      isClaiming,
      showSuccess,
    },
    functions: {
      onCollectCoins,
      onSuccessDismiss,
    },
  };
};

export default useChallengeRewardController;
