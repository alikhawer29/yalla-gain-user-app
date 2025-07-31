import { FC, memo } from "react";
import { View } from "react-native";
import images from "../../../assets/images";
import { IHelpDeskCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Text from "../../Text";
import styles from "./styles";

const HelpDeskCard: FC<IHelpDeskCard> = ({ title, color = colors.primary, icon = images.calendar }) => {
    return (
        <CardWrapper height={155} width={"47%"} padding={16}>
            <View style={styles.icon_container}>
                <Icon source={icon} tint_color={colors.white} color={color} rounded size={72} less_padding />
            </View>
            <View style={styles.title_container}>
                <Text weight="semibold" size={16} lines={1}>{title}</Text>
            </View>
        </CardWrapper>
    )
}

export default memo(HelpDeskCard)