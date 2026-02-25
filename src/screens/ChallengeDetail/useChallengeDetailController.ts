import { useRoute } from '@react-navigation/native';
import {
  useGetChallengeByIdQuery,
  useStartChallengeMutation,
  useLeaveChallengeMutation,
  useStartTodayTaskMutation,
  useCompleteTodayTaskMutation,
} from '../../redux/Apis/User';
import { goBack } from '../../utils/navigation';

const useChallengeDetailController = () => {
  const route = useRoute();
  const { id } = (route.params ?? {}) as { id: number };

  const { data, isFetching, refetch } = useGetChallengeByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });
  const [startChallenge, { isLoading: isStarting }] = useStartChallengeMutation();
  const [leaveChallenge, { isLoading: isLeaving }] = useLeaveChallengeMutation();
  const [startTodayTask, { isLoading: isStartingTask }] =
    useStartTodayTaskMutation();
  const [completeTodayTask, { isLoading: isCompletingTask }] =
    useCompleteTodayTaskMutation();

  const challenge = data?.data ?? data;
  const userChallenge = challenge?.user_challenge ?? challenge?.userChallenge;
  const isJoined = !!(
    userChallenge?.id ||
    challenge?.is_started === true ||
    challenge?.is_joined ||
    challenge?.user_challenge_id ||
    challenge?.challenge_progress?.id ||
    challenge?.challenge_status === 'ongoing'
  );

  const onReload = () => refetch();
  const onStart = async () => {
    try {
      await startChallenge(id).unwrap();
      refetch();
    } catch (e) {
      // error handled by RTK
    }
  };
  const onLeave = async () => {
    try {
      await leaveChallenge(id).unwrap();
      goBack();
    } catch (e) {}
  };
  const onStartTodayTask = async () => {
    try {
      await startTodayTask(id).unwrap();
      await refetch();
    } catch (e) {}
  };
  const onCompleteTodayTask = async () => {
    try {
      await completeTodayTask(id).unwrap();
      await refetch();
    } catch (e) {}
  };

  const loading =
    isFetching ||
    isStarting ||
    isLeaving ||
    isStartingTask ||
    isCompletingTask;

  return {
    values: { challenge, isJoined, isLoading: loading },
    functions: {
      onReload,
      onStart,
      onLeave,
      onStartTodayTask,
      onCompleteTodayTask,
    },
  };
};

export default useChallengeDetailController;
