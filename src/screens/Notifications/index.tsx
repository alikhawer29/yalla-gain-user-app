import React, { FC } from "react"
import { FlatList, View, TouchableOpacity } from "react-native"
import images from "../../assets/images"
import Icon from "../../components/Icon"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import useNotificationController from "./useNotificationController"
import styles from "./styles"
import { heightPixel, widthPixel } from "../../utils/helper"

const Notifications: FC = () => {
    const {
        values: { tabs, selectedTab, notifications },
        functions: { setSelectedTab, toggleReadStatus },
    } = useNotificationController()

    const renderTabItem = ({ item }: { item: any }) => {
        const isSelected = selectedTab === item.value;
        return (
            <TouchableOpacity
                onPress={() => setSelectedTab(item.value)}
                style={[styles.tabItem, isSelected && styles.selectedTabItem]}
            >
                <Text
                    weight={isSelected ? "bold" : "regular"}
                    color={colors.white}
                    size={14}
                >
                    {item.label}
                </Text>
            </TouchableOpacity>
        )
    }

    const renderNotificationItem = ({ item }: { item: any }) => (
        <View style={[styles.card, item.is_read ? styles.readCard : styles.unreadCard]}>
            <Text size={16} color={colors.white} style={styles.message}>
                {item.message}
            </Text>
            <Row justify="space-between" align="center">
                <View style={styles.dateTimeContainer}>
                    <View style={styles.dateTimeItem}>
                        <Icon source={images.calendar} size={16} tint_color={colors.white} no_padding />
                        <Text size={12} color={colors.white}>{item.date}</Text>
                    </View>
                    <View style={styles.dateTimeItem}>
                        <Icon source={images.clock} size={16} tint_color={colors.white} no_padding />
                        <Text size={12} color={colors.white}>{item.time}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => toggleReadStatus(item.id)}>
                    <Text
                        size={16}
                        weight="semibold"
                        color={colors.primary}
                        style={styles.markButton}
                    >
                        Mark As {item.is_read ? 'Unread' : 'Read'}
                    </Text>
                </TouchableOpacity>
            </Row>
        </View>
    )

    return (
        <Wrapper scrollable={false}>
            <View style={styles.container}>
                <View style={styles.tabsContainer}>
                    <FlatList
                        horizontal
                        data={tabs}
                        renderItem={renderTabItem}
                        keyExtractor={(item) => item.value}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </Wrapper>
    )
}

export default Notifications
