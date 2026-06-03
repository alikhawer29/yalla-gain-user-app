import { FC, memo } from "react";
import { View, StyleSheet } from "react-native";
import images from "../../assets/images";
import CardWrapper from "../../components/CardWrapper";
import Icon from "../../components/Icon";
import Row from "../../components/Row";
import Text from "../../components/Text";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";

interface IBookingCard {
    booking: any;
    onPress: () => void;
    getStatusColor: (status: string) => string;
}

const BookingCard: FC<IBookingCard> = ({ booking, onPress, getStatusColor }) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return "";

        // Parse YYYY/MM/DD format
        const parts = dateString.split('/');
        if (parts.length !== 3) return "";

        // Convert to numbers (subtract 1 from month because JS months are 0-indexed)
        const monthIndex = parseInt(parts[0], 10) - 1;
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        // Create date object
        const date = new Date(year, monthIndex, day);

        // Validate date
        if (isNaN(date.getTime())) return "";

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = months[date.getMonth()];

        return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
    };

    // Test: formatDate("12/02/2025") returns "Dec 2, 2025"

    const formatStatus = (status: string) => {
        if (!status) return "";
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    };

    return (
        <CardWrapper
            color={colors.blackish_gray}
            border_radius={10}
            padding={15}
            onPress={onPress}
            height={120}
        >
            {/* Date and Status Row */}
            <Row justify="space-between" align="center" style={styles.header_row}>
                <Row align="center" gap={8}>
                    <Icon source={images.calendar} size={18} />
                    <Text weight="semibold" size={14} color={colors.white}>
                        {formatDate(booking.is_rescheduled ? booking.rescheduled_appointment_date : booking.appointment_date)}
                    </Text>
                </Row>
                <View style={[styles.status_badge, { backgroundColor: getStatusColor(booking.status) }]}>
                    <Text size={12} color={colors.white}>
                        {formatStatus(booking.status)}
                    </Text>
                </View>
            </Row>

            {/* Booking ID */}
            <Row style={styles.detail_row}>
                <Text size={15} weight="semibold" color={colors.white}>Booking Id : </Text>
                <Text size={15} color={colors.icon_gray}>#{booking.id}</Text>
            </Row>

            {/* Amount */}
            <Row align="center" style={styles.detail_row}>
                <Text size={14} weight="semibold" color={colors.white}>Amount : </Text>
                <Text size={14} color={colors.icon_gray}>{booking.amount_paid || 0} Yalla Coins {" "}</Text>
                <Icon source={images.coin} size={18} style={styles.coin_icon} />
            </Row>
        </CardWrapper>
    );
};

const styles = StyleSheet.create({
    header_row: {
        // marginBottom: heightPixel(12),
    },
    detail_row: {
        marginTop: heightPixel(6),
    },
    status_badge: {
        paddingHorizontal: widthPixel(12),
        paddingVertical: heightPixel(4),
        borderRadius: heightPixel(5),
    },
    coin_icon: {
        marginLeft: widthPixel(4),
    },
});

export default memo(BookingCard);

