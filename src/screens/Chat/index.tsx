import { ActivityIndicator, FlatList, View, TextInput } from "react-native"
import React, { useCallback, useRef, useState } from "react"
import images from "../../assets/images"
import Button from "../../components/Button"
import ChatFilterModal from "../../components/ChatFilterModal"
import Icon from "../../components/Icon"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Tabs from "../../components/Tabs"
import Touchable from "../../components/Touchable"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import ChatListCard from "../../components/Cards/ChatListCard"
import Empty from "../../components/Empty"
import useChatController from "./useChatController"
import { useSubscriptionScreenGuard } from "../../hooks/useSubscriptionScreenGuard"
import styles from "./style"
import { heightPixel } from "../../utils/helper"

const Chat = () => {
    useSubscriptionScreenGuard('messaging')
    const {
        values: { chatTypes, selectedTab, searchQuery, filteredChats, isLoading, selectedFilter, showFilterModal, isOpeningAdminChat },
        functions: { setSelectedTab, onSearchChange, onChatPress, onFilterPress, onCloseFilterModal, onFilterChange, openOrCreateAdminChat },
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
        if (selectedTab === "admin") {
            return (
                <View style={styles.admin_empty}>
                    <Empty message="No admin conversation yet" />
                    <Button
                        text="Message admin"
                        onPress={openOrCreateAdminChat}
                        loading={isOpeningAdminChat}
                        style={styles.admin_empty_button}
                    />
                </View>
            );
        }
        return <Empty message="No chats found" />;
    };

    return (
        <Wrapper scrollable={false} hide_bottom_bar>
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
                        <Touchable onPress={onFilterPress}>
                            <Icon
                                source={images.filters}
                                border={selectedFilter !== 'all' ? colors.primary : colors.white}
                                size={40}
                                rounded
                                less_rounded
                            />
                        </Touchable>
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

            {showFilterModal && (
                <ChatFilterModal
                    visible={showFilterModal}
                    onClose={onCloseFilterModal}
                    onApply={onFilterChange}
                    selectedFilter={selectedFilter}
                />
            )}
        </Wrapper>
    )
}

export default Chat