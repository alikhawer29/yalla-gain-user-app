// navigation.ts
import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { AppStackParamList, AuthStackParamList, RootStackParamList } from '../interfaces';
import { NAVIGATORS, ROUTES } from './routes';

type CombinedParamList = RootStackParamList & AuthStackParamList & AppStackParamList;

export const navigationRef = createNavigationContainerRef<CombinedParamList>();

/** Open Avatar flow on the Form screen. */
export const navigateToAvatarForm = () => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(NAVIGATORS.DRAWER as keyof CombinedParamList, {
      screen: NAVIGATORS.AVATAR_STACK,
      params: { screen: ROUTES.AVATAR_SCAN_FORM },
    } as any);
  }
};

export const navigate = <RouteName extends keyof CombinedParamList>(
    name: RouteName,
    params?: undefined extends CombinedParamList[RouteName]
        ? CombinedParamList[RouteName] | undefined
        : CombinedParamList[RouteName]
) => {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    }
};

export const goBack = () => {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.goBack());
    }
};

export const navigateAndSimpleReset = <RouteName extends keyof CombinedParamList>(
    name: RouteName,
    index: number = 0,
    params?: undefined extends CombinedParamList[RouteName]
        ? CombinedParamList[RouteName] | undefined
        : CombinedParamList[RouteName]
) => {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.reset({
                index,
                routes: [{ name, params }],
            }),
        );
    }
};
