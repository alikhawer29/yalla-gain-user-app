import { FlatList, View, TouchableOpacity, ActivityIndicator } from "react-native"
import React from "react"
import Wrapper from "../../components/Wrapper"
import { heightPixel, widthPixel } from "../../utils/helper"
import colors from "../../utils/colors"
import Text from "../../components/Text"
import Row from "../../components/Row"

// Mock data - replace with actual API call
const mockBlockedUsers = [
    { id: 1, username: 'Abc' },
    { id: 2, username: 'Abc' },
    { id: 3, username: 'Abc' },
    { id: 4, username: 'Abc' },
    { id: 5, username: 'Abc' },
    { id: 6, username: 'Abc' },
    { id: 7, username: 'Abc' },
    { id: 8, username: 'Abc' },
    { id: 9, username: 'Abc' },
];

const BlockedUsers = () => {
    const [blockedUsers, setBlockedUsers] = React.useState(mockBlockedUsers);
    const [loading, setLoading] = React.useState(false);

    const handleUnblock = (userId: number) => {
        // TODO: Call unblock API
        setBlockedUsers(prev => prev.filter(user => user.id !== userId));
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => (
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
            <Text size={14} style={{ flex: 0.5 }}>{item.username}</Text>
            <TouchableOpacity
                onPress={() => handleUnblock(item.id)}
                style={{
                    flex: 0.35,
                    backgroundColor: colors.primary,
                    paddingVertical: heightPixel(8),
                    paddingHorizontal: widthPixel(15),
                    borderRadius: heightPixel(6),
                    alignItems: 'center'
                }}
            >
                <Text size={12} weight="semibold">Unblock</Text>
            </TouchableOpacity>
        </Row>
    );

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

    const renderEmpty = () => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: heightPixel(100) }}>
            <Text size={16} color={colors.icon_gray}>No blocked users</Text>
        </View>
    );

    return (
        <Wrapper>
            <FlatList
                data={blockedUsers}
                renderItem={renderItem}
                keyExtractor={(item) => `blocked-user-${item.id}`}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />
        </Wrapper>
    )
}

export default BlockedUsers

