import { FC, memo } from "react"
import { View } from "react-native"
import { openSettings } from "react-native-permissions"
import images from "../../assets/images"
import { INoPermission } from "../../interfaces"
import colors from "../../utils/colors"
import { goBack } from "../../utils/navigation"
import Button from "../Button"
import Icon from "../Icon"
import Row from "../Row"
import Text from "../Text"
import Wrapper from "../Wrapper"
import styles from "./styles"

const NoPermission: FC<INoPermission> = ({ message }) => {
    return (
        <Wrapper>
            <View style={styles.container}>
                <Icon source={images.warning} size={100} />
                <View style={styles.text_wrapper}>
                    <Text
                        size={22}
                        line_height={30}
                        color={colors.primary}
                        weight="bold"
                    >
                        Permission Required
                    </Text>
                    <Text size={18} position="center" style={styles.message}>
                        {message}
                    </Text>
                </View>
                <Row justify="space-evenly" align="center" style={styles.buttons_row}>
                    <Button
                        text="Go to Settings"
                        onPress={() => {
                            setTimeout(() => {
                                openSettings()
                            }, 200)
                        }}
                    />
                    <Button
                        text="Go Back"
                        onPress={goBack}
                        type="outlined"
                    />
                </Row>
            </View>
        </Wrapper>
    )
}

export default memo(NoPermission)