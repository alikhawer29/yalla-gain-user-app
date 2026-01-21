import { FC, memo } from "react";
import { View } from "react-native";
import images from "../../../assets/images";
import colors from "../../../utils/colors";
import { heightPixel } from "../../../utils/helper";
import Button from "../../Button";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

export interface IConsultantCard {
    id: number;
    photo?: string;
    first_name: string;
    last_name: string;
    rating: number;
    total_ratings: number;
    onPress?: () => void;
}

const ConsultantCard: FC<IConsultantCard> = ({
    photo,
    first_name,
    last_name,
    rating,
    total_ratings,
    onPress,
}) => {
    return (
        <CardWrapper
            // height={200}
            width="48%"
            // border
            color={colors.grayish_black}
            border_radius={5}
            padding={12}
        >
            <View style={styles.container}>
                <View style={styles.image_container}>
                    <Icon
                        source={photo ? { uri: photo } : images.dummy}
                        size={80}
                        rounded
                        no_padding
                        resize="cover"
                    />
                </View>
                <Text weight="semibold" size={14} lines={1} style={styles.name}>
                    {first_name} {last_name}
                </Text>
                <Row align="center" justify="center" gap={4} style={styles.rating_row}>
                    <Icon source={images.helpdesk.star} size={10} />
                    <Text size={12} color={colors.icon_gray}>
                        {rating || 0} ({total_ratings || 0})
                    </Text>
                </Row>
                <Button
                    text="View Details"
                    font_size={10}
                    style={styles.button}
                    onPress={onPress}
                />
            </View>
        </CardWrapper>
    );
};

export default memo(ConsultantCard);

