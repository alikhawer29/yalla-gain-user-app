import { FlatList, View, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native"
import { useRoute, RouteProp, useFocusEffect, useNavigation } from "@react-navigation/native"
import React, { useCallback, useState } from "react"
import NewsFeedCard from "../../components/Cards/NewsFeedCard"
import Wrapper from "../../components/Wrapper"
import { heightPixel, widthPixel } from "../../utils/helper"
import {
    useGetFeedsQuery,
    useGetUserPostProfileQuery,
    useCreateChatMutation,
    useBlockUserMutation,
} from "../../redux/Apis/User"
import colors from "../../utils/colors"
import Text from "../../components/Text"
import Icon from "../../components/Icon"
import images from "../../assets/images"
import { RootStackParamList } from "../../interfaces"
import Row from "../../components/Row"
import { useModal } from "../../contexts/ModalContext"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"

type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

const UserProfile = () => {
    const route = useRoute<UserProfileRouteProp>();
    const navigation = useNavigation();
    const { showOkModal, showYesNoModal } = useModal();
    const { userId } = route.params;
    const [page, setPage] = useState(1)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const {
        data: profileResponse,
        isLoading: isProfileLoading,
        refetch: refetchProfile,
    } = useGetUserPostProfileQuery(userId)

    const {
        data: postsData,
        isLoading: isPostsLoading,
        isFetching: isPostsFetching,
        refetch: refetchPosts,
    } = useGetFeedsQuery({ page, user_id: userId })

    const [createChat] = useCreateChatMutation();
    const [blockUser] = useBlockUserMutation();

    const userData = profileResponse?.data;

    useFocusEffect(
        useCallback(() => {
            const parent = navigation.getParent()
            if (parent) {
                parent.setOptions({
                    tabBarStyle: { display: 'none' }
                })
            }
        }, [navigation])
    )

    const handleRefresh = async () => {
        setIsRefreshing(true)
        setPage(1)
        await Promise.all([refetchProfile(), refetchPosts()])
        setIsRefreshing(false)
    }

    const handleLoadMore = () => {
        if (postsData?.meta?.current_page < postsData?.meta?.last_page && !isPostsFetching) {
            setPage(prevPage => prevPage + 1)
        }
    }

    const renderFooter = () => {
        if (!isPostsFetching || page === 1) return null
        return (
            <View style={{ paddingVertical: heightPixel(20) }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )
    }

    const renderEmpty = () => {
        if (isPostsLoading) {
            return (
                <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(60) }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )
        }
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(60) }}>
                <Text size={16} color={colors.icon_gray}>No Posts Yet</Text>
            </View>
        )
    }

    const handleChat = async () => {
        try {
            const response = await createChat(userId).unwrap();
            const chatId = response?.id || response?.data?.id || 0;

            navigate(ROUTES.CHAT_DETAILS, {
                chatId: chatId,
                name: `${userData?.first_name} ${userData?.last_name}`,
                image: userData?.photo || '',
                userRole: userData?.type || 'user',
                userId: userId
            });
        } catch (error: any) {
            console.error('Create chat error:', error);
            showOkModal({
                type: "error",
                title: "Error",
                message: error?.data?.message || "Failed to create chat"
            });
        }
    };

    const handleBlock = () => {
        showYesNoModal(
            {
                type: "error",
                title: "Block User",
                message: "Are You Sure You Wish To Block This User?"
            },
            async () => {
                try {
                    await blockUser(userId).unwrap();
                    showOkModal(
                        {
                            type: "success",
                            title: "Successfully",
                            message: "User Has Been Blocked Successfully"
                        },
                        () => {
                            navigate(ROUTES.NEWSFEED);
                        }
                    );
                } catch (error: any) {
                    console.error('Block user error:', error);
                    showOkModal({
                        type: "error",
                        title: "Error",
                        message: error?.data?.message || "Failed to block user"
                    });
                }
            }
        );
    };

    const renderHeader = () => {
        if (!userData) return null;

        return (
            <View style={{
                backgroundColor: colors.blackish_gray,
                padding: widthPixel(20),
                marginBottom: heightPixel(10),
                alignItems: 'center'
            }}>
                <Icon
                    source={userData.photo ? { uri: userData.photo } : images.dummy}
                    size={100}
                    rounded
                    no_padding
                    border={colors.white}
                    resize="cover"
                />
                <Text size={20} weight="bold" style={{ marginTop: heightPixel(15) }}>
                    {userData.first_name} {userData.last_name}
                </Text>
                {userData.email ? (
                    <Text size={14} color={colors.icon_gray} style={{ marginTop: heightPixel(5) }}>
                        {userData.email}
                    </Text>
                ) : null}

                <Row gap={10} style={{ marginTop: heightPixel(20), width: '100%' }}>
                    <TouchableOpacity
                        onPress={handleChat}
                        style={{
                            flex: 1,
                            backgroundColor: colors.primary,
                            paddingVertical: heightPixel(12),
                            borderRadius: heightPixel(8),
                            alignItems: 'center'
                        }}
                    >
                        <Text weight="semibold">Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleBlock}
                        style={{
                            flex: 1,
                            backgroundColor: colors.danger,
                            paddingVertical: heightPixel(12),
                            borderRadius: heightPixel(8),
                            alignItems: 'center'
                        }}
                    >
                        <Text weight="semibold">Block</Text>
                    </TouchableOpacity>
                </Row>
            </View>
        );
    }

    if (isProfileLoading && !userData) {
        return (
            <Wrapper scrollable>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(100) }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </Wrapper>
        )
    }

    return (
        <Wrapper scrollable>
            <FlatList
                data={postsData?.data || []}
                renderItem={({ item }) => <NewsFeedCard {...item} />}
                keyExtractor={(item, index) => `user-post-${item.id}-${index}`}
                ItemSeparatorComponent={() => <View style={{ height: heightPixel(10) }} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
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

export default UserProfile
