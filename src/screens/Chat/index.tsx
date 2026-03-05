import { ActivityIndicator, FlatList, View, TextInput } from "react-native"
import React, { useCallback, useRef, useState } from "react"
import images from "../../assets/images"
import Icon from "../../components/Icon"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Tabs from "../../components/Tabs"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import ChatListCard from "../../components/Cards/ChatListCard"
import Empty from "../../components/Empty"
import useChatController from "./useChatController"
import styles from "./style"
import { heightPixel } from "../../utils/helper"

const Chat = () => {
    const {
        values: { chatTypes, selectedTab, searchQuery, filteredChats, isLoading },
        functions: { setSelectedTab, onSearchChange, onChatPress },
    } = useChatController();

    const searchInputRef = useRef<TextInput>(null)
    const [isSearchFocused, setIsSearchFocused] = useState(false)

    const handleSearchChange = useCallback((text: string) => {
        onSearchChange(text)
        if (isSearchFocused) {
            requestAnimationFrame(() => {
                searchInputRef.current?.focus()
            })
        }
    }, [isSearchFocused, onSearchChange])

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
            <View style={styles.header_container}>
                <Row align="center" justify="space-between">
                    <View style={styles.search_container}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: colors.white,
                                borderRadius: 5,
                                paddingHorizontal: 15,
                                backgroundColor: 'transparent',
                                flex: 1,
                                height: heightPixel(40),
                            }}
                        >
                            <Icon source={images.search} size={13.5} />
                            <TextInput
                                ref={searchInputRef}
                                style={{
                                    flex: 1,
                                    marginLeft: 5,
                                    color: colors.white,
                                    fontSize: 14,
                                }}
                                placeholder="Search Chat"
                                placeholderTextColor={colors.white}
                                value={searchQuery}
                                onChangeText={handleSearchChange}
                                selectionColor={colors.primary}
                                autoCorrect={false}
                                autoCapitalize="none"
                                blurOnSubmit={false}
                                returnKeyType="search"
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                        </View>
                    </View>
                    <View style={styles.filter_container}>
                        <Icon source={images.filters} border={colors.white} size={40} rounded less_rounded />
                    </View>
                </Row>
                <Tabs tabs={chatTypes} selected={selectedTab} setSelected={setSelectedTab} />
            </View>

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
                ListEmptyComponent={renderEmpty}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="none"
            />
        </Wrapper>
    )
}

export default Chat