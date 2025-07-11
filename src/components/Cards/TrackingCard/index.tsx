import { FC, memo } from "react";
import { View } from "react-native";
import { ITrackingCard } from "../../../interfaces";
import CardWrapper from "../../CardWrapper";
import Image from "../../Image";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const TrackingCard: FC<ITrackingCard> = ({ icon, title, progress = 0, subtext }) => {
    return (
        <CardWrapper padding={16} height={134} border_radius={15}>
            <View style={styles.container}>
                <View style={styles.title_container}>
                    <Text weight="semibold">{title}</Text>
                </View>
                <Row style={styles.content_container}>
                    <View style={styles.image_container}>
                        <Image source={icon} style={styles.image} />
                    </View>
                    <View style={styles.progress_container}>
                        <Text position="center" weight="semibold" size={19} style={styles.progress}>{progress}</Text>
                        <Text position="center" weight="semibold" size={10}>{subtext}</Text>
                    </View>
                </Row>
            </View>
        </CardWrapper>
    )
}

export default memo(TrackingCard)