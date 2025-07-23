// navigation.ts
import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { AppStackParamList, AuthStackParamList, RootStackParamList } from '../interfaces';

type CombinedParamList = RootStackParamList & AuthStackParamList & AppStackParamList;

export const navigationRef = createNavigationContainerRef<CombinedParamList>();

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
