import { FC, memo } from "react";
import { View } from "react-native";
import images from "../../../assets/images";
import colors from "../../../utils/colors";
import Icon from "../../Icon";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const InfoCard: FC = () => {
    return (
        <Row style={styles.container} align="center">
            <View style={[styles.abstract_graphic, styles.top_graphic]} />
            <View style={[styles.abstract_graphic, styles.bottom_graphic]} />
            <View style={styles.left_image_container}>
                <Icon source={images.puzzle} color={colors.white} rounded size={42} less_padding />
            </View>
            <View style={styles.content_container}>
                <Text size={16.9} weight="semibold">"You're just one step away from Completing your profile</Text>
            </View>
            <View style={styles.right_image_container}>
                <Icon source={images.right_arrow} size={22} />
            </View>
        </Row>
    )
}

export default memo(InfoCard)