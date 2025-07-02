import { FC, memo } from "react";
import { View } from "react-native";
import { IProgressCard } from "../../../interfaces";
import ProgressBar from "../../Animations/ProgressBar";
import CardWrapper from "../../CardWrapper";
import Image from "../../Image";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const ProgressCard: FC<IProgressCard> = ({ icon, title, progress = 0 }) => {
    return (
        <CardWrapper padding={6} width={142} height={136}>
            <View style={styles.image_container}>
                <Image source={icon} style={styles.image} />
            </View>
            <View style={styles.content_container}>
                <Text position="center" weight="bold" size={14}>{title}</Text>
                <Row align="center" justify="space-between">
                    <View style={styles.progress_container}>
                        <ProgressBar progress={progress} />
                    </View>
                    <View style={styles.text_container}>
                        <Text weight="bold" size={12}>{progress} %</Text>
                    </View>
                </Row>
            </View>
        </CardWrapper>
    )
}

export default memo(ProgressCard)