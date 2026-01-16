import { ActivityIndicator, FlatList, View } from "react-native"
import images from "../../assets/images"
import Icon from "../../components/Icon"
import Input from "../../components/Input"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Tabs from "../../components/Tabs"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import ChatListCard from "../../components/Cards/ChatListCard"
import Empty from "../../components/Empty"
import useChatController from "./useChatController"
import styles from "./style"

const Chat = () => {
    const {
        values: { chatTypes, selectedTab, searchQuery, filteredChats, isLoading },
        functions: { setSelectedTab, onSearchChange, onChatPress },
    } = useChatController();

    const renderHeader = () => (
        <View style={styles.header_container}>
            <Row align="center" justify="space-between">
                <View style={styles.search_container}>
                    <Input
                        placeholder="Search Chat"
                        icon={images.search}
                        height={40}
                        value={searchQuery}
                        onChangeText={onSearchChange}
                    />
                </View>
                <View style={styles.filter_container}>
                    <Icon source={images.filters} border={colors.white} size={40} rounded less_rounded />
                </View>
            </Row>
            <Tabs tabs={chatTypes} selected={selectedTab} setSelected={setSelectedTab} />
        </View>
    )

    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View style={styles.loading_container}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            );
        }
        return <Empty message="No chats found" />;
    };

    return (
        <Wrapper scrollable={false} floating hide_bottom_bar>
            <FlatList
                data={filteredChats}
                renderItem={({ item }) => (
                    <ChatListCard
                        chat={item}
                        onPress={() => onChatPress(item)}
                    />
                )}
                keyExtractor={(item) => String(item.id)}
                ItemSeparatorComponent={() => <Seperator size={15} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                ListHeaderComponentStyle={styles.list_header}
                ListEmptyComponent={renderEmpty}
            />
        </Wrapper>
    )
}

export default Chat