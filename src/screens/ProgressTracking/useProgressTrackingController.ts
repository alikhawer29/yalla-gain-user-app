import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import { ROUTES } from '../../utils/routes';
import { NAVIGATORS } from '../../utils/routes';
import { useModal } from '../../contexts/ModalContext';
import { userApi } from '../../redux/Apis/User';
import { useAppSelector } from '../../hooks';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { navigate } from '../../utils/navigation';

type LoadingButton =
  | 'initial-view'
  | 'initial-edit'
  | 'future-view'
  | 'future-edit'
  | null;

const useProgressTrackingController = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { showOkModal } = useModal();
  const [updateAvatar] = userApi.useUpdateAvatarMutation();
  const [getAvatarWithChallenge] = userApi.useLazyGetAvatarWithChallengeQuery();
  const [scanStatus, { data: scanStatusData, isLoading: isLoadingScanStatus }] =
    userApi.useScanStatusMutation();
  const [loadingButton, setLoadingButton] = useState<LoadingButton>(null);
  const [pendingInitialAction, setPendingInitialAction] = useState<
    'view' | 'edit' | null
  >(null);
  const user = useAppSelector(selectUser);
  const userId = user?.id;

  // Fetch scan status (POST /scan/status) when screen mounts or userId changes.
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        await scanStatus(userId).unwrap();
      } catch (e) {
        console.error('[ProgressTracking] scanStatus failed', e);
      }
    })();
  }, [userId, scanStatus]);

  const hasFirstAvatar = scanStatusData?.has_first_avatar === true;

  const gateInitialAvatarOrPrompt = useCallback(() => {
    // If scan status is loading, do nothing here (no popup).
    if (isLoadingScanStatus) {
      return false;
    }

    // If user has not created first avatar yet -> show required popup
    if (!hasFirstAvatar) {
      showOkModal({
        type: 'info',
        title: 'Create Your Avatar',
        message: 'Please create your initial avatar.',
      });
      return false;
    }

    return true;
  }, [hasFirstAvatar, isLoadingScanStatus, showOkModal]);

  const fallbackProgressHistory = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }).map((_, index) => {
      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() - (6 - index));
      const dayLabel = dayDate.toLocaleString('en-US', { weekday: 'short' });
      const trendBase = 35 + index * 4;
      const wave = (dayDate.getDay() % 3) * 2;
      return {
        label: dayLabel,
        value: Math.min(100, trendBase + wave),
      };
    });
  }, []);

  const progressHistory = useMemo(() => {
    const source =
      user?.progress_history ??
      user?.progressHistory ??
      user?.progress?.history ??
      user?.tracking_history ??
      [];

    if (!Array.isArray(source) || source.length === 0) {
      return fallbackProgressHistory;
    }

    const normalized = source
      .map((item: any, index: number) => {
        const numericValue = Number(
          item?.progress ?? item?.value ?? item?.percentage ?? item,
        );
        if (Number.isNaN(numericValue)) return null;

        const rawLabel = item?.label ?? item?.date ?? item?.day ?? null;
        const parsedDate = rawLabel ? new Date(rawLabel) : null;
        const label =
          parsedDate && !Number.isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleString('en-US', { weekday: 'short' })
            : item?.day ?? item?.label ?? `D${index + 1}`;

        return {
          label: String(label),
          value: Math.max(0, Math.min(100, numericValue)),
        };
      })
      .filter(Boolean) as { label: string; value: number }[];

    const weeklyData = normalized.slice(-7);
    return weeklyData.length > 0 ? weeklyData : fallbackProgressHistory;
  }, [fallbackProgressHistory, user]);

  const progressChartData = useMemo(() => {
    return {
      labels: progressHistory.map(item => item.label),
      datasets: [
        {
          data: progressHistory.map(item => item.value),
        },
      ],
    };
  }, [progressHistory]);

  const currentProgress = useMemo(() => {
    if (!progressHistory.length) return 0;
    return Math.round(progressHistory[progressHistory.length - 1].value);
  }, [progressHistory]);

  // Navigate to Avatar Visualization
  const navigateToVisualization = useCallback(
    (type: 'initial' | 'future') => {
      navigation.navigate(ROUTES.AVATAR_VISUALIZATION, { type });
    },
    [navigation],
  );

  /**
   * Handles avatar update API call
   * @param avatar - "initial" (first CardWrapper) or "future" (second CardWrapper)
   * @param type - "view" or "edit"
   */
  const handleAvatarAction = useCallback(
    async (avatar: 'initial' | 'future', type: 'view' | 'edit') => {
      const buttonKey: LoadingButton = `${avatar}-${type}` as LoadingButton;

      try {
        setLoadingButton(buttonKey);

        const payload = {
          avatar,
          type,
        };

        // Call API
        const response = await updateAvatar(payload).unwrap();

        // Show success message
        // showOkModal({
        //   type: 'success',
        //   title: 'Success',
        //   message: `Avatar ${type === 'view' ? 'viewed' : 'updated'} successfully.`,
        // })

        // Navigate to visualization screen
        navigateToVisualization(avatar);

        return response;
      } catch (error: any) {
        // Show error message
        showOkModal({
          type: 'error',
          title: 'Error',
          message:
            error?.data?.message ||
            `Failed to ${type} avatar. Please try again.`,
        });
        throw error;
      } finally {
        setLoadingButton(null);
      }
    },
    [updateAvatar, showOkModal, navigateToVisualization],
  );

  /**
   * Handles button clicks for first CardWrapper (initial avatar)
   */
  const handleInitialAvatarView = useCallback(() => {
    if (isLoadingScanStatus) {
      setLoadingButton('initial-view');
      setPendingInitialAction('view');
      return;
    }
    if (!gateInitialAvatarOrPrompt()) return;
    handleAvatarAction('initial', 'view');
  }, [handleAvatarAction, gateInitialAvatarOrPrompt, isLoadingScanStatus]);

  const handleInitialAvatarEdit = useCallback(() => {
    if (isLoadingScanStatus) {
      setLoadingButton('initial-edit');
      setPendingInitialAction('edit');
      return;
    }
    if (!gateInitialAvatarOrPrompt()) return;
    handleAvatarAction('initial', 'edit');
  }, [handleAvatarAction, gateInitialAvatarOrPrompt, isLoadingScanStatus]);

  // If user tapped while scan status was loading, complete the action once
  // the status request finishes.
  useEffect(() => {
    if (!pendingInitialAction) return;
    if (isLoadingScanStatus) return;

    if (!hasFirstAvatar) {
      setLoadingButton(null);
      setPendingInitialAction(null);
      showOkModal({
        type: 'info',
        title: 'Create Your Avatar',
        message: 'Create You Avatar',
      });
      return;
    }

    const nextAction = pendingInitialAction;
    setPendingInitialAction(null);
    handleAvatarAction('initial', nextAction);
  }, [
    pendingInitialAction,
    isLoadingScanStatus,
    hasFirstAvatar,
    showOkModal,
    handleAvatarAction,
  ]);

  /**
   * Handles button clicks for second CardWrapper (future avatar).
   * First checks if user has joined a challenge via getAvatarWithChallenge.
   * If no challenge, shows modal and redirects to Challenges screen.
   */
  const handleFutureAvatarView = useCallback(async () => {
    if (!userId) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Please log in to view future avatar.',
      });
      return;
    }
    try {
      setLoadingButton('future-view');
      const result = await getAvatarWithChallenge(userId).unwrap();
      const challenge = result?.data?.challenge;
      const hasChallenge =
        challenge &&
        typeof challenge === 'object' &&
        Object.keys(challenge).length > 0;

      if (!hasChallenge) {
        showOkModal(
          {
            type: 'info',
            title: 'No Challenge Joined',
            message: 'No Challenge Joined - Start Your Challenge',
          },
          () => {
            navigate(NAVIGATORS.DRAWER as any, {
              screen: NAVIGATORS.BOTTOM,
              params: {
                screen: NAVIGATORS.HOME_STACK,
                params: { screen: ROUTES.CHALLENGES },
              },
            });
          },
        );
        return;
      }
      await handleAvatarAction('future', 'view');
    } catch (error: any) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message:
          error?.data?.message || 'Failed to load avatar. Please try again.',
      });
    } finally {
      setLoadingButton(null);
    }
  }, [userId, getAvatarWithChallenge, showOkModal, handleAvatarAction]);

  const handleFutureAvatarEdit = useCallback(() => {
    handleAvatarAction('future', 'edit');
  }, [handleAvatarAction]);

  return {
    values: {
      isLoadingInitialView: loadingButton === 'initial-view',
      isLoadingInitialEdit: loadingButton === 'initial-edit',
      isLoadingFutureView: loadingButton === 'future-view',
      isLoadingFutureEdit: loadingButton === 'future-edit',
      progressChartData,
      currentProgress,
    },
    functions: {
      handleInitialAvatarView,
      handleInitialAvatarEdit,
      handleFutureAvatarView,
      handleFutureAvatarEdit,
    },
  };
};

export default useProgressTrackingController;
