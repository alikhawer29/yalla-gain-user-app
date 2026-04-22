import { FC, memo } from "react";
import { View } from "react-native";
import { ITrackingCard } from "../../../interfaces";
import CardWrapper from "../../CardWrapper";
import Image from "../../Image";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

import CircularProgress from "../../CircularProgress";
import colors from "../../../utils/colors";
import { heightPixel } from "../../../utils/helper";

const TrackingCard: FC<ITrackingCard> = ({ icon, title, progress = 0, subtext, type = 'graph', stats }) => {
    const isProgress = type === 'progress';
    const isWorkout = type === 'workout';

    return (
        <CardWrapper padding={16} height={145} border_radius={15}>
            <View style={styles.container}>
                <View style={styles.title_container}>
                    <Text weight="semibold">{title}</Text>
                </View>

                {isProgress ? (
                    <View style={{ flex: 0.8, alignItems: 'center', justifyContent: 'center', marginTop: heightPixel(5) }}>
                        <CircularProgress
                            size={heightPixel(85)}
                            strokeWidth={10}
                            progress={75} // Example progress for Cal
                            color={colors.primary}
                        >
                            <Text position="center" weight="bold" size={16}>{progress}</Text>
                            <Text position="center" weight="semibold" size={10}>{subtext}</Text>
                        </CircularProgress>
                    </View>
                ) : isWorkout ? (
                    <Row style={[styles.content_container, { alignItems: 'center' }]}>
                        <View style={{ flex: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress
                                size={heightPixel(70)}
                                strokeWidth={8}
                                progress={typeof progress === 'number' ? progress : parseInt(String(progress)) || 0}
                                color={colors.primary}
                            >
                                <Text weight="bold" size={14}>{progress}</Text>
                            </CircularProgress>
                        </View>
                        <View style={{ flex: 0.5, gap: heightPixel(8) }}>
                            {stats?.map((stat, index) => (
                                <Row key={index} gap={6} align="center">
                                    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={stat.icon} style={{ width: 14, height: 14 }} resize="contain" />
                                    </View>
                                    <Text size={12} weight="semibold">{stat.text}</Text>
                                </Row>
                            ))}
                        </View>
                    </Row>
                ) : (
                    <Row style={styles.content_container}>
                        <View style={styles.image_container}>
                            <Image source={icon} style={styles.image} />
                        </View>
                        <View style={styles.progress_container}>
                            <Text position="center" weight="semibold" size={19} style={styles.progress}>{progress}</Text>
                            <Text position="center" weight="semibold" size={10}>{subtext}</Text>
                        </View>
                    </Row>
                )}
            </View>
        </CardWrapper>
    )
}

export default memo(TrackingCard)