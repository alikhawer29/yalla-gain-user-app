// navigation.ts
import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {
  AppStackParamList,
  AuthStackParamList,
  RootStackParamList,
} from '../interfaces';
import { NAVIGATORS, ROUTES } from './routes';

type CombinedParamList = RootStackParamList &
  AuthStackParamList &
  AppStackParamList;

export const navigationRef = createNavigationContainerRef<CombinedParamList>();

/** Open Avatar flow on the Form screen. */
export const navigateToAvatarForm = () => {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(NAVIGATORS.DRAWER, {
      screen: NAVIGATORS.AVATAR_STACK,
      params: { screen: ROUTES.AVATAR_SCAN_FORM },
    });
  }
};

export const navigateToMyProfile = () => {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(NAVIGATORS.DRAWER, {
      screen: NAVIGATORS.MY_PROFILE_STACK,
      params: { screen: ROUTES.MY_PROFILE },
    });
  }
};

/** Navigate to Workout stack from drawer level */
export const navigateToWorkout = () => {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(NAVIGATORS.DRAWER, {
      screen: NAVIGATORS.WORKOUT_STACK,
    });
  }
};

/** Navigate to Home stack from drawer level */
export const navigateToHome = () => {
    if (navigationRef.isReady()) {
        (navigationRef as any).navigate(NAVIGATORS.DRAWER, {
            screen: NAVIGATORS.HOME_STACK,
        });
    }
};

/** Navigate to Challenges stack from drawer level */
export const navigateToChallenges = () => {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(NAVIGATORS.DRAWER, {
      screen: NAVIGATORS.CHALLENGES_STACK,
    });
  }
};

export const navigate = <RouteName extends keyof CombinedParamList>(
  name: RouteName,
  params?: undefined extends CombinedParamList[RouteName]
    ? CombinedParamList[RouteName] | undefined
    : CombinedParamList[RouteName],
) => {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
};

export const goBack = () => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.goBack());
  }
};

export const navigateAndSimpleReset = <
  RouteName extends keyof CombinedParamList,
>(
  name: RouteName,
  index: number = 0,
  params?: undefined extends CombinedParamList[RouteName]
    ? CombinedParamList[RouteName] | undefined
    : CombinedParamList[RouteName],
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
