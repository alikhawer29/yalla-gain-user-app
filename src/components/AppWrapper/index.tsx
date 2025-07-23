import { FC, memo } from "react"
import { View } from "react-native"
import images from "../../assets/images"
import { IWrapper } from "../../interfaces"
import Image from "../Image"
import styles from "./styles"

const AppWrapper: FC<IWrapper> = ({ children }) => {

    return (
        <View style={[styles.container]}>
            <View style={styles.left_image} >
                <Image source={images.left_light} />
            </View>
            <View style={styles.bg_image} >
                <Image source={images.center_light} />
            </View>
            <View style={styles.right_image} >
                <Image source={images.right_light} />
            </View>
            {children}
        </View>
    )
}

export default memo(AppWrapper)