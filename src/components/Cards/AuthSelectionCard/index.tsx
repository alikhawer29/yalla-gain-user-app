import { FC, memo } from "react";
import { View } from "react-native";
import { IAuthSelectionCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import CardWrapper from "../../CardWrapper";
import Image from "../../Image";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const AuthSelectionCard: FC<IAuthSelectionCard> = ({ image, title, description, selected = false, onPress }) => {
    return (
        <CardWrapper padding={8} height={116} color={selected ? colors.light_primary : colors.transparent} border_color={selected ? colors.primary : colors.gray} border onPress={onPress}>
            <Row style={styles.container}>
                <View style={styles.image_container}>
                    <View style={styles.image_wrapper}>
                        <Image source={image} style={styles.image} />
                    </View>
                </View>
                <View style={styles.content_container}>
                    <Text weight="semibold" size={18} lines={1}>{title}</Text>
                    <Text size={14}>{description}</Text>
                </View>
            </Row>
        </CardWrapper>
    )
}

export default memo(AuthSelectionCard)