const NAVIGATORS = {
    AUTH_STACK: "AuthStackNavigator",
    BOTTOM: "BottomTabNavigator",
    DRAWER: "DrawerNavigator",
    HOME_STACK: "HomeStackNavigator",
    NEWSFEED_STACK: "NewsFeedStackNavigator",
    PROGRESS_TRACKING_STACK: "ProgressTrackingStackNavigator",
    CHAT_STACK: "ChatStackNavigator",
    MY_PROFILE_STACK: "MyProfileStackNavigator",
    MUSIC_PANEL_STACK: "MusicPanelStackNavigator",
} as const

const ROUTES = {
    ONBOARDING: "Onboarding",
    USER_ENTRY: "UserEntry",
    AUTH_TYPE: "AuthType",
    FORGOT_PASSWORD: "ForgotPassword",
    VERIFY_CODE: "VerifyCode",
    SET_PASSWORD: "SetPassword",
    HOME: "Home",
    NEWSFEED: "NewsFeed",
    PROGRESS_TRACKING: "ProgressTracking",
    CHAT: "Chat",
    MY_PROFILE: "MyProfile",
    CHANGE_PASSWORD: "ChangePassword",
    MUSIC_AUTH: "MusicAuth",
    PLAYLIST_DETAILS: "PlaylistDetails",
} as const

const ROUTES_OPTIONS = [
    {
        route_name: ROUTES.HOME,
        left: "drawer",
        right: "notifications",
        logo: true
    },
    {
        route_name: ROUTES.NEWSFEED,
        left: "drawer",
        right: "notifications",
        logo: false,
        title: "News Feed"
    },
    {
        route_name: ROUTES.PROGRESS_TRACKING,
        left: "drawer",
        right: "notifications",
        logo: false,
        title: "Progress Tracking"
    },
    {
        route_name: ROUTES.CHAT,
        left: "drawer",
        right: "notifications",
        logo: false,
        title: "Chats"
    },
    {
        route_name: ROUTES.MY_PROFILE,
        left: "drawer",
        right: "notifications",
        logo: false,
        title: "My Profile"
    },
    {
        route_name: ROUTES.CHANGE_PASSWORD,
        left: "back",
        right: null,
        logo: false,
        title: "Change Password",
        bottom_tab: false
    },
    {
        route_name: ROUTES.MUSIC_AUTH,
        left: "drawer",
        right: null,
        logo: false,
        title: "Music"
    },
    {
        route_name: ROUTES.PLAYLIST_DETAILS,
        left: "back",
        right: null,
        logo: false,
        title: ""
    },
] as const

export { ROUTES, NAVIGATORS, ROUTES_OPTIONS }