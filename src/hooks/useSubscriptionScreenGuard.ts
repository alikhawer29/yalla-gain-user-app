import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { SubscriptionFeature } from '../utils/subscription';
import { NAVIGATORS, ROUTES } from '../utils/routes';
import { useSubscriptionAccess } from './useSubscriptionAccess';

const navigateToHomeTab = (navigation: ReturnType<typeof useNavigation>) => {
  const tabNavigation = navigation.getParent();
  if (tabNavigation) {
    tabNavigation.dispatch(
      CommonActions.navigate({
        name: NAVIGATORS.HOME_STACK,
        params: { screen: ROUTES.HOME },
      }),
    );
    return;
  }
  if (navigation.canGoBack()) {
    navigation.goBack();
  }
};

export const useSubscriptionScreenGuard = (feature: SubscriptionFeature) => {
  const navigation = useNavigation();
  const { requireAccess } = useSubscriptionAccess();

  useFocusEffect(
    useCallback(() => {
      if (!requireAccess(feature)) {
        if (feature === 'messaging') {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigateToHomeTab(navigation);
          }
          return;
        }
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }
    }, [feature, navigation, requireAccess]),
  );
};
