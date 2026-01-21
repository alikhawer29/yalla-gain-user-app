import { FC, memo } from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import images from "../../../assets/images";
import colors from "../../../utils/colors";
import Icon from "../../Icon";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";
import { NAVIGATORS, ROUTES } from "../../../utils/routes";

const InfoCard: FC = () => {
    const navigation = useNavigation<any>();

    const handlePress = () => {
        // Switch to the MyProfile bottom-tab stack, then show the MyProfile screen
        navigation.navigate(NAVIGATORS.MY_PROFILE_STACK, {
            screen: ROUTES.MY_PROFILE,
        });
    };

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
            <Row style={styles.container} align="center">
                <View style={[styles.abstract_graphic, styles.top_graphic]} />
                <View style={[styles.abstract_graphic, styles.bottom_graphic]} />
                <View style={styles.left_image_container}>
                    <Icon source={images.puzzle} color={colors.white} rounded size={42} less_padding />
                </View>
                <View style={styles.content_container}>
                    <Text size={16.9} weight="semibold">{"You're just one step away from Completing your profile"}</Text>
                </View>
                <View style={styles.right_image_container}>
                    <Icon source={images.right_arrow} size={22} />
                </View>
            </Row>
        </TouchableOpacity>
    )
}

export default memo(InfoCard)