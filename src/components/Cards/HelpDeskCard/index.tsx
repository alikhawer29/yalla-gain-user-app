import { FC, memo } from "react";
import { View } from "react-native";
import images from "../../../assets/images";
import { IHelpDeskCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Text from "../../Text";
import styles from "./styles";

const HelpDeskCard: FC<IHelpDeskCard> = ({ title, color = colors.primary, icon = images.calendar, onPress }) => {
    return (
        <CardWrapper height={155} width={"48.5%"} padding={16} onPress={onPress}>
            <View style={styles.icon_container}>
                <Icon source={icon} color={color} rounded size={72} less_padding />
            </View>
            <View style={styles.title_container}>
                <Text weight="semibold" size={16} lines={1}>{title}</Text>
            </View>
        </CardWrapper>
    )
}

export default memo(HelpDeskCard)