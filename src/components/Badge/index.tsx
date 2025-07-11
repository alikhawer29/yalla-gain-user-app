import { FC, memo } from "react"
import { IBadge } from "../../interfaces"
import Icon from "../Icon"
import Row from "../Row"
import Text from "../Text"
import styles from "./styles"

const Badge: FC<IBadge> = ({ icon, title, color = "#282828", style, onPress }) => {

    let default_style = {
        backgroundColor: color
    }

    return (
        <Row align="center" style={[styles.container, style, default_style]} onPress={onPress}>
            {icon && <Icon source={icon} size={16} />}
            <Text size={12}>{title}</Text>
        </Row>
    )
}

export default memo(Badge)