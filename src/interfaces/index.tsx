import { ReactNode } from "react"
import { DimensionValue, GestureResponderEvent, ImageSourcePropType, ImageStyle, Insets, StyleProp, TextStyle, ViewStyle } from "react-native"

export interface IWrapper {
    children: ReactNode
}

export interface IAuthWrapper extends IWrapper {
    title: string,
    subtitle?: string,
}

export interface ICardWrapper extends IWrapper {
    height?: DimensionValue,
    width?: DimensionValue,
    padding?: number,
    border?: boolean,
}

export interface IImage {
    source: ImageSourcePropType,
    style?: StyleProp<ImageStyle>
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
    slop?: Insets
    style?: StyleProp<ViewStyle>
}

export interface IButton {
    text: string
    font_size?: number
    onPress?: () => void
    style?: StyleProp<ViewStyle>
    type?: "primary" | "secondary" | "outlined"
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
    type?: 'text' | 'email' | 'number' | 'password' | 'textarea' | 'phone' | 'date' | 'time';
    icon?: any;
    error?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    maxLength?: number;
    disabled?: boolean;
    required?: boolean;
}

export interface IIcon {
    size?: number;
    color?: string;
    source?: ImageSourcePropType;
    rounded?: boolean;
    tint_color?: string;
    onPress?: () => void;
    border?: string;
    less_padding?: boolean;
    no_padding?: boolean;
    rotate?: boolean;
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