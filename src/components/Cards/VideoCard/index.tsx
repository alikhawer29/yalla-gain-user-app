import { FC, memo } from "react";
import { View } from "react-native";
import images from "../../../assets/images";
import { IVideoCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Image from "../../Image";
import Row from "../../Row";
import Text from "../../Text";
import Touchable from "../../Touchable";
import styles from "./styles";

const VideoCard: FC<IVideoCard> = ({ image, title, description, date, language }) => {
    return (
        <CardWrapper height={230} width={224} border>
            <View style={styles.image_container}>
                <Image source={image} style={styles.image} resize="cover" />
                <Touchable style={styles.save_icon}>
                    <Icon source={images.save} color={colors.primary} rounded />
                </Touchable>
            </View>
            <View style={styles.content_container}>
                <Text weight="semibold" lines={1}>{title}</Text>
                <Row align="center" justify="space-between">
                    <Row align="center" gap={6}>
                        <Image source={images.calendar} style={styles.icon} />
                        <Text size={12}>{date}</Text>
                    </Row>
                    <Row align="center" gap={6}>
                        <Image source={images.globe} style={styles.icon} />
                        <Text size={12}>{language}</Text>
                    </Row>
                </Row>
                <Text weight="semibold" size={11} line_height={17} lines={2}>{description}</Text>
            </View>
        </CardWrapper>
    )
}

export default memo(VideoCard)