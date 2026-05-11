import { ActivityIndicator, FlatList, Platform, RefreshControl, ScrollView, View } from "react-native";
import images from "../../assets/images";
import DateFilterModal from "../../components/DateFilterModal";
import Icon from "../../components/Icon";
import Input from "../../components/Input";
import Row from "../../components/Row";
import Seperator from "../../components/Seperator";
import Tabs from "../../components/Tabs";
import Text from "../../components/Text";
import Touchable from "../../components/Touchable";
import Wrapper from "../../components/Wrapper";
import colors from "../../utils/colors";
import { heightPixel } from "../../utils/helper";
import useMyBookingsController from "./useMyBookingsController";
import styles from "./styles";
import BookingCard from "./BookingCard";

const MyBookings = () => {
    const {
        values: { bookings, isLoading, isLoadingMore, hasMore, search, selectedTab, selectedStatus, tabs, statusFilters, showFilterModal, fromDate, toDate },
        functions: { onReload, onLoadMore, onSearch, onTabChange, onStatusChange, onBookingPress, getStatusColor, onFilterPress, onCloseFilterModal, onApplyFilter },
    } = useMyBookingsController();

    return (
        <Wrapper>
            {/* Tabs */}
            <Tabs tabs={tabs} selected={selectedTab} setSelected={onTabChange} />

            <Seperator size={15} />

            {/* Search */}
            <Row style={{ marginBottom: heightPixel(15) }} align="center" gap={10}>
                <View style={{ width: "85%" }}>
                    <Input
                        placeholder="Search Booking"
                        height={40}
                        icon={images.search}
                        value={search}
                        onChangeText={onSearch}
                    />
                </View>
                <Touchable style={{ width: "15%" }} onPress={onFilterPress}>
                    <Icon source={images.filters} size={40} rounded less_rounded border={(fromDate || toDate) ? colors.primary : colors.white} />
                </Touchable>
            </Row>

            {/* Status Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filters_scroll}
                contentContainerStyle={{ paddingRight: 10 }}
            >
                <Row gap={10}>
                    {statusFilters.map((filter) => (
                        <Touchable
                            key={filter.value}
                            style={[
                                styles.filter_item,
                                selectedStatus === filter.value && styles.filter_item_selected,
                            ]}
                            onPress={() => onStatusChange(filter.value)}
                        >
                            <Text
                                size={14}
                                color={colors.white}
                            >
                                {filter.label}
                            </Text>
                        </Touchable>
                    ))}
                </Row>
            </ScrollView>

            <Seperator size={15} />

            {/* Bookings List — wrapper ensures flex height on iOS; overlay keeps spinner visible */}
            <View style={styles.list_wrap}>
                <FlatList
                    data={bookings}
                    extraData={isLoadingMore}
                    removeClippedSubviews={false}
                    renderItem={({ item }) => (
                        <BookingCard
                            booking={item}
                            onPress={() => onBookingPress(item.id)}
                            getStatusColor={getStatusColor}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    ItemSeparatorComponent={() => <Seperator size={15} />}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={
                        bookings.length === 0 ? { flexGrow: 1 } : { paddingBottom: heightPixel(8) }
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading && !isLoadingMore}
                            onRefresh={onReload}
                            tintColor={colors.transparent_primary}
                            colors={[colors.transparent_primary]}
                        />
                    }
                    onEndReached={onLoadMore}
                    onEndReachedThreshold={Platform.OS === "ios" ? 0.45 : 0.3}
                    ListFooterComponent={
                        isLoadingMore ? (
                            <View
                                style={{
                                    minHeight: heightPixel(56),
                                    paddingVertical: heightPixel(12),
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <ActivityIndicator size="large" color={colors.transparent_primary} />
                            </View>
                        ) : (
                            <View style={{ height: heightPixel(4) }} />
                        )
                    }
                />
                {isLoadingMore ? (
                    <View style={styles.load_more_overlay} pointerEvents="none">
                        <View style={styles.load_more_pill}>
                            <ActivityIndicator size="small" color={colors.transparent_primary} />
                            <Text size={13} color={colors.white}>
                                Loading more…
                            </Text>
                        </View>
                    </View>
                ) : null}
            </View>

            {/* Date Filter Modal */}
            <DateFilterModal
                visible={showFilterModal}
                onClose={onCloseFilterModal}
                onApply={onApplyFilter}
                initialFromDate={fromDate}
                initialToDate={toDate}
            />
        </Wrapper>
    );
};

export default MyBookings;

