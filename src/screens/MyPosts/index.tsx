import { FlatList, View, ActivityIndicator, RefreshControl } from "react-native"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import React, { useState } from "react"
import NewsFeedCard from "../../components/Cards/NewsFeedCard"
import CreatePostCard from "../../components/Cards/CreatePostCard"
import Wrapper from "../../components/Wrapper"
import { heightPixel } from "../../utils/helper"
import { useGetMyFeedsQuery } from "../../redux/Apis/User"
import colors from "../../utils/colors"
import Text from "../../components/Text"

const MyPosts = () => {
    const navigation = useNavigation()
    const [page, setPage] = useState(1)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const { data, isLoading, isFetching, refetch } = useGetMyFeedsQuery({ page })

    useFocusEffect(
        React.useCallback(() => {
            // Hide bottom tab bar when screen is focused
            const parent = navigation.getParent()
            if (parent) {
                parent.setOptions({
                    tabBarStyle: { display: 'none' }
                })
            }
            // Refetch posts when screen is focused
            refetch()
        }, [navigation])
    )

    const handleRefresh = async () => {
        setIsRefreshing(true)
        setPage(1)
        await refetch()
        setIsRefreshing(false)
    }

    const handleLoadMore = () => {
        if (data?.meta?.current_page < data?.meta?.last_page && !isFetching) {
            setPage(prevPage => prevPage + 1)
        }
    }

    const renderFooter = () => {
        if (!isFetching) return null
        return (
            <View style={{ paddingVertical: heightPixel(20) }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )
    }

    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(100) }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )
        }
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(100) }}>
                <Text size={16} color={colors.icon_gray}>No posts yet</Text>
                <Text size={12} color={colors.icon_gray} style={{ marginTop: heightPixel(10) }}>
                    Your posts will appear here
                </Text>
            </View>
        )
    }

    // Show loader only on initial load, not when refreshing
    const hasData = data && 'data' in data && Array.isArray(data.data) && data.data.length > 0;
    if (isLoading && !hasData) {
        return (
            <Wrapper>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(100) }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </Wrapper>
        )
    }

    return (
        <Wrapper>
            <FlatList
                data={data?.data || []}
                renderItem={({ item }) => <NewsFeedCard {...item} isMyPost={true} />}
                keyExtractor={(item, index) => `my-post-${item.id}-${index}`}
                ItemSeparatorComponent={() => <View style={{ height: heightPixel(10) }} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => <CreatePostCard />}
                ListHeaderComponentStyle={{ marginBottom: heightPixel(10) }}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />
        </Wrapper>
    )
}

export default MyPosts

