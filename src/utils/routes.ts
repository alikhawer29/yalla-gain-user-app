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
    HELP_DESK_STACK: "HelpDeskStackNavigator",
    SUBSCRIPTION_STACK: "SubscriptionStackNavigator",
    WORKOUT_STACK: "WorkoutStackNavigator",
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
    HELP_DESK: "HelpDesk",
    SUBSCRIPTION: "Subscription",
    SUBSCRIPTION_LOGS: "SubscriptionLogs",
    CHATBOT: "Chatbot",
    MOVEMENT_CORRECTION: "MovementCorrection",
    MOVEMENT_CORRECTION_CAMERA: "MovementCorrectionCamera",
    WORKOUT: "Workout",
    WORKOUT_DETAILS: "WorkoutDetails",
    VIDEO_DETAILS: "VideoDetails",
    VIDEO_PLAYER: "VideoPlayer",
    SAVED_WORKOUT_CONTENT: "SavedWorkoutContent",
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
    {
        route_name: ROUTES.HELP_DESK,
        left: "drawer",
        right: null,
        logo: false,
        title: "Help Desk"
    },
    {
        route_name: ROUTES.SUBSCRIPTION,
        left: "drawer",
        right: null,
        logo: false,
        title: "Premium Subscription"
    },
    {
        route_name: ROUTES.SUBSCRIPTION_LOGS,
        left: "back",
        right: null,
        logo: false,
        title: "Subscription Logs"
    },
    {
        route_name: ROUTES.CHATBOT,
        left: "back",
        right: null,
        logo: false,
        title: "Chat Bot Complain"
    },
    {
        route_name: ROUTES.MOVEMENT_CORRECTION,
        left: "drawer",
        right: null,
        logo: false,
        title: "Movement Correction With Camera"
    },
    {
        route_name: ROUTES.MOVEMENT_CORRECTION_CAMERA,
        left: null,
        right: null,
        logo: false,
        title: "Movement Correction With Camera"
    },
    {
        route_name: ROUTES.WORKOUT,
        left: "drawer",
        right: null,
        logo: false,
        title: "Workout Content"
    },
    {
        route_name: ROUTES.WORKOUT_DETAILS,
        left: "back",
        right: null,
        logo: false
    },
    {
        route_name: ROUTES.VIDEO_DETAILS,
        left: "back",
        right: null,
        logo: false,
        title: "View Video"
    },
    {
        route_name: ROUTES.VIDEO_PLAYER,
        left: "back",
        right: null,
        logo: false,
        title: "Video Player",
    },
    {
        route_name: ROUTES.SAVED_WORKOUT_CONTENT,
        left: "drawer",
        right: null,
        logo: false,
        title: "Saved Content",
    },
] as const

export { ROUTES, NAVIGATORS, ROUTES_OPTIONS }