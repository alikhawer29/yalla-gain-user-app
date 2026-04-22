import { useState } from 'react';
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

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showLeaveSuccess, setShowLeaveSuccess] = useState(false);

  const {
    data,
    isFetching,
    isLoading: isChallengeInitialLoad,
    refetch,
  } = useGetChallengeByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });
  const [startChallenge, { isLoading: isStarting }] =
    useStartChallengeMutation();
  const [leaveChallenge, { isLoading: isLeaving }] =
    useLeaveChallengeMutation();
  const [startTodayTask, { isLoading: isStartingTask }] =
    useStartTodayTaskMutation();
  const [completeTodayTask, { isLoading: isCompletingTask }] =
    useCompleteTodayTaskMutation();

  const challenge = data?.data ?? data;
  const userChallenge = challenge?.user_challenge ?? challenge?.userChallenge;
  const rawIsStarted = (challenge?.is_started ??
    userChallenge?.is_started) as unknown;
  const isStarted =
    rawIsStarted === true ||
    rawIsStarted === 1 ||
    rawIsStarted === '1' ||
    rawIsStarted === 'true';
  const isJoined = !!(
    userChallenge?.id ||
    isStarted ||
    challenge?.is_joined ||
    challenge?.user_challenge_id ||
    challenge?.challenge_progress?.id ||
    challenge?.challenge_status === 'ongoing'
  );

  const onReload = (): void => {
    void refetch();
  };
  const onStart = async () => {
    try {
      await startChallenge(id).unwrap();
      refetch();
    } catch (e) {}
  };

  const onLeave = () => {
    setShowLeaveConfirm(true);
  };

  const onConfirmLeave = async () => {
    try {
      setShowLeaveConfirm(false);
      await leaveChallenge(id).unwrap();
      setShowLeaveSuccess(true);
    } catch (e) {
      // error handled by RTK
    }
  };

  const onSuccessOk = () => {
    setShowLeaveSuccess(false);
    goBack();
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

  const isMutationLoading =
    isStarting || isLeaving || isStartingTask || isCompletingTask;

  const isBlockingLoad = isChallengeInitialLoad || isMutationLoading;
  const isPullRefreshing =
    isFetching && !isChallengeInitialLoad && !isMutationLoading;

  return {
    values: {
      challenge,
      isJoined,
      isBlockingLoad,
      isPullRefreshing,
      showLeaveConfirm,
      showLeaveSuccess,
    },
    functions: {
      onReload,
      onStart,
      onLeave,
      onConfirmLeave,
      onSuccessOk,
      setShowLeaveConfirm,
      onStartTodayTask,
      onCompleteTodayTask,
    },
  };
};

export default useChallengeDetailController;
