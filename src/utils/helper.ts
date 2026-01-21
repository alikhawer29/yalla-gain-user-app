import dayjs from 'dayjs';
import { Dimensions, Insets, PixelRatio, Platform, StatusBar } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const widthBaseScale = SCREEN_WIDTH / 393;
const heightBaseScale = SCREEN_HEIGHT / 852;

function normalize(size: number, based = 'width') {
    const newSize = based === 'height' ? size * heightBaseScale : size * widthBaseScale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export const heightPixel = (size: number) => {
    return normalize(size, 'height');
};

export const widthPixel = (size: number) => {
    return normalize(size, 'width');
};

export const font = (size: number, factor = 1) => {
    return Math.round(PixelRatio.roundToNearestPixel(widthBaseScale * size * factor));
};

export const STATUSBAR_HEIGHT =
    (Platform.OS === 'ios'
        ? initialWindowMetrics?.insets.top
        : StatusBar.currentHeight) || 0;

export const BOTTOMBAR_HEIGHT = initialWindowMetrics?.insets.bottom || 0

export const vh = (SCREEN_HEIGHT - STATUSBAR_HEIGHT) * 0.01;
export const vw = SCREEN_WIDTH * 0.01;

export const HEADER_HEIGHT = vh * 9 + STATUSBAR_HEIGHT;
export const PAGE_WIDTH = vw * 100;

export const createInsets = (value: number): Insets => ({
    top: value,
    bottom: value,
    left: value,
    right: value,
})

export const dateFormatter = (date: Date) => {
    return dayjs(date).format("YYYY-MM-DD")
};

export const timeFormatter = (date: Date | string) => {
    return dayjs(date).format("hh:mm a")
};

export const formatTimer = (s: number): string => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

export const formHandler = (data: any) => {

    let formdata = new FormData()

    if (data) {
        Object.entries(data).forEach(item => {

            if (item[1]) {

                if (typeof item[1] === "object" && item[1]?.length && item[1]?.length > 0) {
                    item[1].forEach((i, index) => {
                        if (item[0] !== "valid_id" && item[0] !== "files" && item[0] !== "images" && typeof i === "object") {
                            Object.entries(i).forEach(element => {
                                formdata.append(`${item[0]}[${index}][${element[0]}]`, element[1])
                            })
                        } else {
                            formdata.append(`${item[0]}[${index}]`, i)
                        }
                    })
                } else if (item[0] !== "image" && item[0] !== "photo" && item[0] !== "file" && typeof item[1] === "object") {
                    Object.entries(item[1]).forEach(element => {
                        formdata.append(`${item[0]}[${element[0]}]`, element[1])
                    })
                } else {
                    formdata.append(item[0], item[1])
                }

            }

        })
    }

    return formdata
}

export const capitalize = (str: string) => {
    if (str) {
        return str?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return ""
}

export const getGreetingText = () => {

    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
        return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
        return "Good Evening";
    } else {
        return "Good Night";
    }

}