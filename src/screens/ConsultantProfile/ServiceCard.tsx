import { FC, memo } from "react";
import { View, StyleSheet } from "react-native";
import images from "../../assets/images";
import CardWrapper from "../../components/CardWrapper";
import Icon from "../../components/Icon";
import Image from "../../components/Image";
import Row from "../../components/Row";
import Text from "../../components/Text";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";

interface IServiceCard {
    id: number;
    title: string;
    description: string;
    image: string;
    charges: string;
    onPress: () => void;
}

const ServiceCard: FC<IServiceCard> = ({
    title,
    description,
    image,
    charges,
    onPress,
}) => {
    return (
        <CardWrapper
            width={180}
            height={220}
            color={colors.grayish_black}
            border_radius={12}
            onPress={onPress}
        >
            <View style={styles.image_container}>
                <Image
                    source={image ? { uri: image } : images?.service_dummy}
                    style={styles.image}
                    resize="cover"
                />
            </View>
            <View style={styles.content}>
                <Text weight="semibold" size={14} lines={1}>
                    {title}
                </Text>
                <Text size={12} lines={2}>
                    {description}
                </Text>
                <Row align="center" gap={4}>
                    <Text size={14} weight="bold">{charges}</Text>
                    <Icon source={images.coin} size={14} />
                    <Text size={12} >Yalla Coins</Text>
                </Row>
            </View>
        </CardWrapper>
    );
};

const styles = StyleSheet.create({
    image_container: {
        height: heightPixel(120),
        borderTopLeftRadius: heightPixel(12),
        borderTopRightRadius: heightPixel(12),
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    content: {
        padding: widthPixel(10),
        flex: 1,
        justifyContent: "space-between",
    },
});

export default memo(ServiceCard);

