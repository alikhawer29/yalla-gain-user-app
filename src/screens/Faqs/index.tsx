import React, { FC, useCallback, useState } from "react"
import { View, FlatList, ActivityIndicator, TouchableOpacity } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import images from "../../assets/images"
import Image from "../../components/Image"
import MediaViewerModal from "../../components/MediaViewerModal"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { useGetFaqsQuery } from "../../redux/Apis/User"
import FaqVideoPlayer from "./FaqVideoPlayer"
import styles from "./styles"
import Empty from "../../components/Empty"

interface FaqItem {
    id: number
    question: string
    answer: string
    image?: string | null
    video?: string | null
    created_at?: string
}

const Faqs: FC = () => {
    const { data, isLoading, isFetching, refetch } = useGetFaqsQuery(undefined, {
        refetchOnFocus: true,
        refetchOnReconnect: true,
    })
    const faqs: FaqItem[] = data?.data || []

    const [mediaViewer, setMediaViewer] = useState({
        visible: false,
        url: '',
        isVideo: false,
    })

    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [refetch])
    )

    const openMedia = (url: string, isVideo: boolean) => {
        setMediaViewer({ visible: true, url, isVideo })
    }

    const closeMedia = () => {
        setMediaViewer({ visible: false, url: '', isVideo: false })
    }

    const renderFaqItem = ({ item, index }: { item: FaqItem, index: number }) => {
        const hasImage = !!item.image
        const hasVideo = !!item.video

        return (
            <View style={styles.itemContainer}>
                <Text color={colors.white} weight="bold" size={18} style={styles.question}>
                    Question {index + 1} :
                </Text>
                <Text color={colors.white} style={styles.question}>
                    {item.question}
                </Text>

                <View style={{ marginTop: 10 }}>
                    <Text color={colors.white} weight="bold" size={18} style={styles.answer}>
                        Response:
                    </Text>
                    <Text color={colors.white} style={styles.answer}>
                        {item.answer}
                    </Text>
                </View>

                {hasImage && (
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => openMedia(item.image!, false)}
                    >
                        <Image
                            source={{ uri: item.image! }}
                            style={styles.image}
                            resize="cover"
                            fallbackSource={images.placeholder}
                        />
                    </TouchableOpacity>
                )}

                {hasVideo && <FaqVideoPlayer videoUrl={item.video!} />}
            </View>
        )
    }

    if (isLoading) {
        return (
            <Wrapper>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </Wrapper>
        )
    }

    return (
        <Wrapper scrollable={false}>
            <View style={styles.container}>
                <FlatList
                    data={faqs}
                    renderItem={renderFaqItem}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Empty message="No FAQs found" />}
                    refreshing={isFetching && !isLoading}
                    onRefresh={refetch}
                />
            </View>

            <MediaViewerModal
                visible={mediaViewer.visible}
                mediaUrl={mediaViewer.url}
                isVideo={mediaViewer.isVideo}
                onClose={closeMedia}
            />
        </Wrapper>
    )
}

export default Faqs
