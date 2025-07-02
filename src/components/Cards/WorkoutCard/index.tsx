import { FC, memo } from "react";
import { View } from "react-native";
import { IWorkoutCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import ProgressBar from "../../Animations/ProgressBar";
import CardWrapper from "../../CardWrapper";
import Image from "../../Image";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const WorkoutCard: FC<IWorkoutCard> = ({ image, title, description, schedule, duration, helper_text, progress = 0 }) => {
    return (
        <CardWrapper padding={12} height={157}>
            <Row style={styles.container}>
                <View style={styles.image_container}>
                    <Image source={image} style={styles.image} />
                </View>
                <View style={styles.content_container}>
                    <Text weight="semibold" size={18} lines={1}>{title}</Text>
                    <Text size={14} color={colors.icon_gray}>{description}</Text>
                    <Text size={14}>Schedule <Text color={colors.icon_gray} size={14}>{schedule}</Text></Text>
                    <Text size={14}>Duration <Text color={colors.icon_gray} size={14}>{duration}</Text></Text>
                    <ProgressBar progress={progress} />
                    <Text size={12} line_height={17} color={colors.icon_gray} lines={1}>{helper_text}</Text>
                </View>
            </Row>
        </CardWrapper>
    )
}

export default memo(WorkoutCard)