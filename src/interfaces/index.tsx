import { ReactNode } from "react";
import { ColorValue, DimensionValue, GestureResponderEvent, ImageResizeMode, ImageSourcePropType, ImageStyle, Insets, StyleProp, TextStyle, ViewStyle } from "react-native";
import { IndicatorName } from "react-native-loader-kit";

export type TMessage = {
    id: string;
    text: string;
    sender: string;
    timestamp: Date | null;
    typing?: boolean
}

export type InputType = 'email' | 'text' | 'password' | 'number' | 'textarea' | 'time' | 'phone' | 'date';

export type AppStackParamList = {
    AuthStackNavigator: undefined
    DrawerNavigator: undefined
    Chatbot: undefined
    WalletStackNavigator: undefined
};

export type AuthStackParamList = {
    Onboarding: undefined
    UserEntry: { type: string }
    AuthType: undefined
    Login: undefined
    ForgotPassword: { type: InputType }
    VerifyCode: { via: string, email: string, dialing_code: string, phone: string }
    SetPassword: { via: string, email: string, dialing_code: string, phone: string, token: string }
};

export type RootStackParamList = {
    Home: undefined;
    MyProfile: undefined
    EditProfile: undefined
    ChangePassword: undefined
    Chat: undefined
    NewsFeed: undefined
    ProgressTracking: undefined
    MusicAuth: undefined
    PlaylistDetails: { id: string },
    HelpDesk: undefined,
    Subscription: undefined,
    SubscriptionLogs: undefined,
    Chatbot: undefined
    CreateNewsFeed: undefined
    Workout: undefined
    WorkoutDetails: undefined
    VideoDetails: undefined
    VideoPlayer: undefined
    MovementCorrection: undefined
    MovementCorrectionCamera: undefined
    SavedWorkoutContent: undefined
    CreateAvatar: undefined
    Scan: undefined
    AvatarScanForm: { frontPhoto: any; rightPhoto: any }
    // Consultation & Booking
    ConsultantsList: { type: 'doctor' | 'trainer' }
    ConsultantProfile: { id: number; type: 'doctor' | 'trainer' }
    ServiceDetails: { id: number; type: 'doctor' | 'trainer' }
    AppointmentBooking: { serviceId: number; type: 'doctor' | 'trainer'; charges: string }
    MyBookings: undefined
    BookingDetails: { id: number }
    Reviews: { consultant_id: number }
    // Chat
    ChatDetails: {
        chatId: number;
        name: string;
        image: string;
        userRole: string;
        userId: number;
    }
    // Wallet
    Wallet: undefined;
    Transfer: undefined;
    CreatePost: { initialTab?: 'photo' | 'video' | 'poll' };
    EditPost: { postData: any };
    MyPosts: undefined;
    UserProfile: { userId: number };
    BlockedUsers: undefined;
    AvatarVisualization: { type: 'initial' | 'future'; title?: string };
};

export interface IWrapper {
    children: ReactNode
    scrollable?: boolean
    bottom_bar?: boolean
    no_padding?: boolean
    loading?: boolean
    floating?: boolean
    hide_bottom_bar?: boolean
}

export interface IAuthWrapper extends IWrapper {
    title?: string,
    subtitle?: string,
}

export interface ICardWrapper extends IWrapper {
    height?: DimensionValue
    width?: DimensionValue
    border_radius?: number
    padding?: number
    border?: boolean
    border_color?: ColorValue
    color?: ColorValue
    onPress?: (event: GestureResponderEvent) => void
}

export interface IImage {
    source: ImageSourcePropType | undefined
    style?: StyleProp<ImageStyle>,
    resize?: ImageResizeMode
}

export interface IText {
    children: ReactNode
    weight?: 'bold' | 'semibold' | 'regular'
    size?: number
    style?: StyleProp<TextStyle>
    color?: string
    line_height?: number
    lines?: number
    underline?: boolean
    capitalize?: boolean
    position?: 'auto' | 'left' | 'right' | 'center' | 'justify'
    onPress?: (event: GestureResponderEvent) => void
}

export interface ITouchable {
    children: ReactNode
    onPress?: (event: GestureResponderEvent) => void
    onLongPress?: (event: GestureResponderEvent) => void
    onPressOut?: (event?: GestureResponderEvent) => void
    disabled?: boolean
    effect?: boolean
    slop?: Insets
    style?: StyleProp<ViewStyle>
}

export interface IButton {
    text: string
    font_size?: number
    onPress?: () => void
    style?: StyleProp<ViewStyle>
    type?: "primary" | "secondary" | "outlined" | "custom",
    icon?: ImageSourcePropType,
    loading?: boolean,
    textColor?: string,
}

export interface IRow {
    children: ReactNode
    align?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch"
    justify?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly"
    onPress?: () => void
    style?: StyleProp<ViewStyle>
    gap?: number
}

export interface IInput {
    label?: string;
    placeholder?: string;
    type?: InputType;
    icon?: any;
    error?: string;
    country?: string;
    value?: string;
    mode?: "primary" | "secondary";
    onChangeText?: (text: string) => void;
    onChangeCountry?: (country: any) => void;
    maxLength?: number;
    disabled?: boolean;
    required?: boolean;
    height?: number;
}

export interface IIcon {
    size?: number | `${number}%`
    color?: string
    source?: ImageSourcePropType
    rounded?: boolean
    tint_color?: string
    onPress?: () => void
    border?: string
    less_padding?: boolean
    less_rounded?: boolean
    no_padding?: boolean
    rotate?: boolean,
    resize?: ImageResizeMode
}

export interface IProgressBar {
    progress: number
}

export interface IProgressCard extends IProgressBar {
    icon: ImageSourcePropType
    title: string
}

export interface IVideoCard {
    image: ImageSourcePropType
    title: string
    description: string
    created_at: string
    language?: string,
    type?: "primary" | "secondary",
    onSave?: () => void
    onPress?: () => void
    is_saved?: boolean,
    is_video?: boolean,
}

export interface IWorkoutCard extends IProgressBar {
    image: ImageSourcePropType
    title: string
    description: string
    helper_text: string
    duration: string
    schedule: string
}

export interface IAuthSelectionCard {
    image?: ImageSourcePropType
    title: string
    description: string,
    selected?: boolean,
    onPress?: (event: GestureResponderEvent) => void
}


export interface ITrackingCard extends IProgressBar {
    icon: ImageSourcePropType
    title: string
    subtext: string
}



// ...

export interface INewsFeedCard {
    id?: string | number;
    title?: string;
    content?: string;
    media?: { type: 'image' | 'video', source: any, thumbnail?: any }[];
    post_media?: { id?: number, path?: string, media_url?: string, media_type?: 'image' | 'video' }[];
    poll?: {
        question: string;
        options: { id: string | number, label: string, option?: string, percentage: number, is_selected?: boolean }[];
        total_votes?: number;
    };
    poll_options?: any[];
    is_poll?: boolean;
    measurements?: {
        height: string;
        weight: string;
        image: any;
    };
    user?: any;
    reaction_count?: number;
    comment_count?: number;
    created_at?: string;
    time_ago?: string;
    is_liked?: boolean;
    is_reacted?: boolean;
    reaction_type?: string;
    isMyPost?: boolean;
}

export interface IChatCard {
    message: string
    user?: any
    created_at: string
    system?: boolean
}

export interface IBadge {
    icon?: ImageSourcePropType
    title: string
    color?: string
    onPress?: () => void
    style?: StyleProp<ViewStyle>
}

export interface LabelValueItem {
    label: string;
    value: string | number;
}

export interface ITabs {
    tabs: LabelValueItem[]
    selected: string | number
    setSelected: (value: string | number) => void
    type?: 'basic' | 'advanced'
}

export interface IUpload {
    text?: string
    style?: StyleProp<ViewStyle>
}

export interface ICheckbox {
    checked?: boolean
    onPress?: () => void
}

export interface ISeperator {
    horizontal?: boolean
    size?: number
}

export interface IPlaylistCard {
    icon: ImageSourcePropType
    title: string
    onPress: () => void
}

export interface ISongCard {
    icon: ImageSourcePropType
    title: string
    artist: string
    onPress: () => void,
    active?: boolean
}

export interface ILoader {
    color?: string
    type?: IndicatorName
}

export interface IHelpDeskCard {
    color?: string,
    icon: ImageSourcePropType,
    title: string,
    onPress?: () => void
}

export interface ISubscriptionLogCard {
    subscription_type: string
    subscribed_on: string
    expired_on: string
    amount: string
    label: {
        text: string
        color: string,
        underline?: boolean,
        onPress?: () => void | undefined
    }
}

export interface IEmpty {
    message?: string
    image?: ImageSourcePropType
}

export interface IChatItemCard {
    message: string
    image?: any
    created_at: string
    sender?: boolean
    typing?: boolean
}

export interface INoPermission {
    message: string
}

export interface IKeyboardAvoidingWrapper {
    children: ReactNode
}

export interface IFloatingButton {
    style?: StyleProp<ViewStyle>,
}

// Chat interfaces
export interface IChatMessage {
    id: number;
    chat_id: number;
    user_id: number;
    user_name: string;
    image: string;
    message: string;
    read_at: string | null;
    date: string;
    time: string;
    file: any[];
    is_mine: boolean;
}

export interface IChat {
    id: number;
    type: string;
    name: string;
    image: string;
    user_id: number;
    user_role: string;
    unread: number;
    last_message: IChatMessage | null;
}

export interface IChatListCard {
    chat: IChat;
    onPress: () => void;
}