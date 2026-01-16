import { CommonActions, getFocusedRouteNameFromRoute } from "@react-navigation/native"
import { Pressable, View } from "react-native"
import images from "../../assets/images"
import colors from "../../utils/colors"
import { BOTTOMBAR_HEIGHT, heightPixel, widthPixel } from "../../utils/helper"
import { NAVIGATORS, ROUTES_OPTIONS } from "../../utils/routes"
import Icon from "../Icon"
import Row from "../Row"

// Routes where bottom bar should be hidden
const getActiveRouteName = (route: any): string => {
    const routeName = getFocusedRouteNameFromRoute(route);
    return routeName || route?.name || '';
};

const shouldHideBottomBar = (state: any): boolean => {
    const focusedRoute = state.routes[state.index];
    const activeRouteName = getActiveRouteName(focusedRoute);

    // Check if the active route (nested screen) should hide bottom tab
    const routeOption = ROUTES_OPTIONS.find(
        (item) => item.route_name === activeRouteName
    );

    // If we found a route option with bottom_tab: false, hide the bar
    if (routeOption?.bottom_tab === false) {
        return true;
    }

    // Also check if the stack navigator name matches (for cases where nested route name isn't found)
    const stackOption = ROUTES_OPTIONS.find(
        (item) => item.route_name === focusedRoute.name
    );

    return stackOption?.bottom_tab === false;
};

const BottomBar = ({ state, descriptors, navigation }) => {
    // Check if we should hide the bottom bar for the current route
    if (shouldHideBottomBar(state)) {
        return null;
    }

    return (
        <View style={{ paddingHorizontal: widthPixel(10), backgroundColor: colors.transparent, paddingVertical: heightPixel(15), position: "absolute", bottom: BOTTOMBAR_HEIGHT, left: widthPixel(10), right: widthPixel(10) }}>
            <Row align="center" justify="space-between" style={{ backgroundColor: colors.blackish_gray, height: heightPixel(70), borderRadius: BOTTOMBAR_HEIGHT, paddingHorizontal: widthPixel(10) }}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const icon =
                        options.tabBarIcon !== undefined
                            ? options.tabBarIcon
                            : images.tab_home;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            // Reset stack for Chat tab to go back to Chat list
                            if (route.name === NAVIGATORS.CHAT_STACK) {
                                navigation.dispatch(
                                    CommonActions.reset({
                                        index: 0,
                                        routes: [{ name: route.name }],
                                    })
                                );
                            } else {
                                navigation.navigate(route.name, route.params);
                            }
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <Pressable
                            key={route.key}
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarButtonTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                        >
                            <Icon size={50} color={isFocused ? colors.primary : colors.gray} tint_color={isFocused ? colors.white : colors.icon_gray} rounded source={icon} />
                        </Pressable>
                    );
                })}
            </Row>
        </View>
    )
}

export default BottomBar