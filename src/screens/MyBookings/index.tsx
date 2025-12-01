import { FlatList, RefreshControl, ScrollView, View } from "react-native";
import images from "../../assets/images";
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
        values: { bookings, isLoading, search, selectedTab, selectedStatus, tabs, statusFilters },
        functions: { onReload, onSearch, onTabChange, onStatusChange, onBookingPress, getStatusColor },
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
                <View style={{ width: "15%" }}>
                    <Icon source={images.filters} size={40} rounded less_rounded border={colors.white} />
                </View>
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

            {/* Bookings List */}
            <FlatList
                data={bookings}
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
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onReload} />
                }
            />
        </Wrapper>
    );
};

export default MyBookings;

