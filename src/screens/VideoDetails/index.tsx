import { FlatList, View } from "react-native"
import images from "../../assets/images"
import Button from "../../components/Button"
import VideoCard from "../../components/Cards/VideoCard"
import Icon from "../../components/Icon"
import Image from "../../components/Image"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import styles from "./styles"
import useVideoDetailController from "./useVideoDetailController"

const VideoDetails = () => {

    const { values, functions } = useVideoDetailController()

    return (
        <Wrapper loading={values.isLoading} scrollable>
            <Button type="outlined" text="Movement Correction AI" />
            <View style={styles.thumbnail_wrapper}>
                <Image
                    source={{ uri: values.data?.thumbnail }}
                    style={styles.thumbnail_image}
                    resize="cover"
                />
            </View>
            <View style={styles.title_wrapper}>
                <Text size={22}>{values.data?.title}</Text>
                <Row justify="space-between" align="center">
                    <Row gap={8} align="center">
                        <Icon source={images.calendar} size={19} />
                        <Text size={18}>{values.data?.created_at}</Text>
                    </Row>
                    <Row gap={8} align="center">
                        <Icon source={images.globe} size={19} />
                        <Text size={18} capitalize>
                            {values.data?.language}
                        </Text>
                    </Row>
                </Row>
            </View>
            <View style={styles.section}>
                <Text size={16} weight="semibold">
                    Description
                </Text>
                <Text>{values.data?.description}</Text>
            </View>
            <View style={styles.section}>
                <Text size={16} weight="semibold">
                    Rest Time
                </Text>
                <Text>{values.data?.rest_time}</Text>
            </View>
            <View style={styles.section}>
                <Text size={16} weight="semibold">
                    Sets
                </Text>
                <Text>{values.data?.sets}</Text>
            </View>
            <Text
                size={24}
                weight="semibold"
                style={styles.similar_videos_title}
                line_height={30}
            >
                Similar Language Videos
            </Text>
            <FlatList
                horizontal
                data={values.data?.similar_videos}
                renderItem={({ item }) => (
                    <VideoCard
                        {...item}
                        image={{ uri: item?.thumbnail }}
                        type="secondary"
                        onSave={() => functions.onSave(item.id)}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <Seperator horizontal />}
            />
        </Wrapper>
    )
}

export default VideoDetails