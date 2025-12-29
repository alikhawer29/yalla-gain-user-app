import { FlatList, View, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native"
import React from "react"
import Wrapper from "../../components/Wrapper"
import { heightPixel, widthPixel } from "../../utils/helper"
import colors from "../../utils/colors"
import Text from "../../components/Text"
import Row from "../../components/Row"
import { useGetBlockedUsersQuery, useUnblockUserMutation } from "../../redux/Apis/User"
import { useModal } from "../../contexts/ModalContext"

const BlockedUsers = () => {
    const { data, isLoading, isFetching, refetch } = useGetBlockedUsersQuery();
    const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();
    const { showYesNoModal, showOkModal } = useModal();
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    const handleUnblock = (userId: number, userName: string) => {
        showYesNoModal(
            {
                type: "error",
                title: "Unblock User",
                message: `Are you sure you want to unblock ${userName}?`
            },
            async () => {
                try {
                    await unblockUser(userId).unwrap();
                    showOkModal({
                        type: "success",
                        title: "Success",
                        message: "User has been unblocked successfully"
                    });
                } catch (error: any) {
                    console.error('Unblock user error:', error);
                    showOkModal({
                        type: "error",
                        title: "Error",
                        message: error?.data?.message || "Failed to unblock user"
                    });
                }
            }
        );
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const blockedUser = item?.to_user;
        const userName = blockedUser ? `${blockedUser.first_name} ${blockedUser.last_name}` : 'Unknown User';
        const userId = blockedUser?.id;

        return (
            <Row
                justify="space-between"
                align="center"
                style={{
                    paddingVertical: heightPixel(15),
                    paddingHorizontal: widthPixel(20),
                    borderBottomWidth: 1,
                    borderBottomColor: colors.dark_gray
                }}
            >
                <Text size={14} style={{ flex: 0.15 }}>{index + 1}</Text>
                <Text size={14} style={{ flex: 0.5 }}>{userName}</Text>
                <TouchableOpacity
                    onPress={() => handleUnblock(userId, userName)}
                    disabled={isUnblocking}
                    style={{
                        flex: 0.35,
                        backgroundColor: colors.primary,
                        paddingVertical: heightPixel(8),
                        paddingHorizontal: widthPixel(15),
                        borderRadius: heightPixel(6),
                        alignItems: 'center',
                        opacity: isUnblocking ? 0.6 : 1
                    }}
                >
                    <Text size={12} weight="semibold">Unblock</Text>
                </TouchableOpacity>
            </Row>
        );
    };

    const renderHeader = () => (
        <Row
            justify="space-between"
            style={{
                paddingVertical: heightPixel(15),
                paddingHorizontal: widthPixel(20),
                backgroundColor: colors.blackish_gray,
                borderBottomWidth: 2,
                borderBottomColor: colors.primary
            }}
        >
            <Text size={14} weight="bold" style={{ flex: 0.15 }}>ID</Text>
            <Text size={14} weight="bold" style={{ flex: 0.5 }}>Username</Text>
            <Text size={14} weight="bold" style={{ flex: 0.35, textAlign: 'center' }}>Status</Text>
        </Row>
    );

    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(100) }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            );
        }
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(100) }}>
                <Text size={16} color={colors.icon_gray}>No blocked users</Text>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isFetching) return null;
        return (
            <View style={{ paddingVertical: heightPixel(20) }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    };

    // Show loader only on initial load
    const hasData = data && 'data' in data && Array.isArray(data.data) && data.data.length > 0;
    if (isLoading && !hasData) {
        return (
            <Wrapper>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(100) }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <FlatList
                data={data?.data || []}
                renderItem={renderItem}
                keyExtractor={(item, index) => `blocked-user-${item.id}-${index}`}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            />
        </Wrapper>
    )
}

export default BlockedUsers

