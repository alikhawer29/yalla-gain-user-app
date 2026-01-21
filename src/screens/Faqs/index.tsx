import React, { FC } from "react"
import { View, FlatList, ActivityIndicator, TouchableOpacity } from "react-native"
import { useCallback } from "react"
import { useFocusEffect } from "@react-navigation/native"
import images from "../../assets/images"
import Icon from "../../components/Icon"
import Image from "../../components/Image"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { useGetFaqsQuery } from "../../redux/Apis/User"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import styles from "./styles"
import Empty from "../../components/Empty"

const Faqs: FC = () => {
    const { data, isLoading, isFetching, refetch } = useGetFaqsQuery(undefined, {
        refetchOnFocus: true,
        refetchOnReconnect: true,
    })
    const faqs = data?.data || []

    // Ensure FAQs refresh every time this screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [refetch])
    )

    const renderFaqItem = ({ item, index }: { item: any, index: number }) => (
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

            {item.video ? (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigate(ROUTES.VIDEO_PLAYER, { video: item.video })}
                    style={styles.video}
                >
                    <Image
                        source={{ uri: item.image }}
                        style={[styles.image, { marginTop: 0 }]}
                        resize="cover"
                    />
                    <View style={styles.playIcon}>
                        <Icon source={images.video_play} size={60} no_padding />
                    </View>
                </TouchableOpacity>
            ) : item.image && (
                <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    resize="cover"
                />
            )}
        </View>
    )

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
                    // Pull-to-refresh on scroll
                    refreshing={isFetching && !isLoading}
                    onRefresh={refetch}
                />
            </View>
        </Wrapper>
    )
}

export default Faqs
