import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useModal } from '../contexts/ModalContext';
import { selectUser } from '../redux/Slices/AuthSlice';
import {
  canAccessSubscriptionFeature,
  getUserSubscription,
  SUBSCRIPTION_UPGRADE_MESSAGE,
  SubscriptionFeature,
} from '../utils/subscription';
import { NAVIGATORS, ROUTES } from '../utils/routes';
import { useAppSelector } from './index';

export const useSubscriptionAccess = () => {
  const user = useAppSelector(selectUser);
  const subscription = getUserSubscription(user);
  const { showOkModal } = useModal();
  const navigation = useNavigation<any>();

  const showUpgradeModal = useCallback(
    (message?: string) => {
      showOkModal(
        {
          type: 'warning',
          title: 'Upgrade Required',
          message: message ?? SUBSCRIPTION_UPGRADE_MESSAGE,
        },
        () => {
          navigation.navigate(NAVIGATORS.SUBSCRIPTION_STACK, {
            screen: ROUTES.SUBSCRIPTION,
          });
        },
      );
    },
    [navigation, showOkModal],
  );

  const canAccess = useCallback(
    (feature: SubscriptionFeature) =>
      canAccessSubscriptionFeature(user, feature),
    [user],
  );

  const requireAccess = useCallback(
    (feature: SubscriptionFeature): boolean => {
      if (canAccessSubscriptionFeature(user, feature)) {
        return true;
      }
      showUpgradeModal();
      return false;
    },
    [user, showUpgradeModal],
  );

  const guardAccess = useCallback(
    (feature: SubscriptionFeature, onAllowed: () => void) => {
      if (requireAccess(feature)) {
        onAllowed();
      }
    },
    [requireAccess],
  );

  return {
    user,
    subscription,
    canAccess,
    requireAccess,
    guardAccess,
    showUpgradeModal,
  };
};
