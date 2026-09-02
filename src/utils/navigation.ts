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

export const navigateToChatList = () => {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(NAVIGATORS.DRAWER, {
      screen: NAVIGATORS.BOTTOM,
      params: {
        screen: NAVIGATORS.CHAT_STACK,
        params: { screen: ROUTES.CHAT },
      },
    });
  }
};

export const navigateToBookingDetails = (bookingId: number) => {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(NAVIGATORS.DRAWER, {
      screen: NAVIGATORS.CONSULTATION_STACK,
      params: {
        screen: ROUTES.BOOKING_DETAILS,
        params: { id: bookingId },
      },
    });
  }
};

type NestedResetState = {
  index?: number;
  routes: Array<{ name: string; state?: NestedResetState }>;
};

/**
 * Drawer → Challenges must land on the list without wiping Home.
 * If Challenges is the only HomeStack route, Android hardware back
 * finishes the activity (app closes; repeating that can crash).
 */
export const getDrawerChallengesResetState = (): NestedResetState => ({
  index: 0,
  routes: [
    {
      name: NAVIGATORS.DRAWER,
      state: {
        index: 0,
        routes: [
          {
            name: NAVIGATORS.BOTTOM,
            state: {
              index: 0,
              routes: [
                {
                  name: NAVIGATORS.HOME_STACK,
                  state: {
                    index: 1,
                    routes: [
                      { name: ROUTES.HOME },
                      { name: ROUTES.CHALLENGES },
                    ],
                  },
                },
                { name: NAVIGATORS.NEWSFEED_STACK },
                { name: NAVIGATORS.PROGRESS_TRACKING_STACK },
                { name: NAVIGATORS.CHAT_STACK },
                { name: NAVIGATORS.MY_PROFILE_STACK },
              ],
            },
          },
        ],
      },
    },
  ],
});

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
