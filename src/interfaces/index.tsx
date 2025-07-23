import { ReactNode } from "react"
import { ColorValue, DimensionValue, GestureResponderEvent, ImageResizeMode, ImageSourcePropType, ImageStyle, Insets, StyleProp, TextStyle, ViewStyle } from "react-native"

export type InputType = 'email' | 'text' | 'password' | 'number' | 'textarea' | 'time' | 'phone' | 'date';

export type AppStackParamList = {
    AuthStackNavigator: undefined
    DrawerNavigator: undefined
};

export type AuthStackParamList = {
    Onboarding: undefined
    UserEntry: { type: string }
    AuthType: undefined
    Login: undefined
    ForgotPassword: { type: InputType }
    VerifyCode: undefined
    SetPassword: undefined
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
    PlaylistDetails: { id: string }
};

export interface IWrapper {
    children: ReactNode
    scrollable?: boolean
    bottom_bar?: boolean
    no_padding?: boolean
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
    value?: string;
    onChangeText?: (text: string) => void;
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
    rotate?: boolean
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
    date: string
    language: string
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

export interface INewsFeedCard {
    content: string
    user?: any
    reaction_count: number
    comment_count: number
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