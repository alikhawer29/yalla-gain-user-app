import { FC, memo } from "react"
import images from "../../assets/images"
import { ICheckbox } from "../../interfaces"
import colors from "../../utils/colors"
import { createInsets } from "../../utils/helper"
import Icon from "../Icon"
import Touchable from "../Touchable"
import styles from "./styles"

const Checkbox: FC<ICheckbox> = ({ checked, onPress }) => {
    return (
        <Touchable style={styles.container} onPress={onPress} slop={createInsets(15)}>
            {
                checked &&
                <Icon source={images.check} size={9} tint_color={colors.white} />
            }
        </Touchable>
    )
}

export default memo(Checkbox)