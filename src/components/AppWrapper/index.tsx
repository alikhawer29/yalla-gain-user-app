import { FC, memo } from "react"
import { View } from "react-native"
import images from "../../assets/images"
import { IWrapper } from "../../interfaces"
import Image from "../Image"
import styles from "./styles"

const AppWrapper: FC<IWrapper> = ({ children }) => {

    return (
        <View style={[styles.container]}>
            {children}
        </View>
    )
}

export default memo(AppWrapper)