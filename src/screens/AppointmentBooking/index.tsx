import { ScrollView, TouchableOpacity, View } from "react-native";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Row from "../../components/Row";
import Seperator from "../../components/Seperator";
import Text from "../../components/Text";
import Touchable from "../../components/Touchable";
import Wrapper from "../../components/Wrapper";
import colors from "../../utils/colors";
import useAppointmentBookingController from "./useAppointmentBookingController";
import styles from "./styles";
import { getPhoneMaxLength } from "../../utils/helper";

const AppointmentBooking = () => {
    const {
        values: { formData, user, dates, availableSlots, selectedDate, selectedSlot, isBooking, isRefreshing, fieldErrors },
        functions: { updateFormData, onCountryChange, onDateSelect, onSlotSelect, onSlotPress, onBook, onRefresh, formatTime, isSlotPassed, isSlotConflictingWithUserBooking },
    } = useAppointmentBookingController();

    const displayName = [user?.first_name, user?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();
    const displayPhone =
        user?.phone != null && `${user.phone}`.length > 0
            ? `(${user?.dialing_code ?? ''}) ${user.phone}`
            : '';

    const formatDateHeader = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return { day, dayName: dayNames[date.getDay()] };
    };

    console.log(fieldErrors, "fieldErrors");

    return (
        <Wrapper scrollable bottom_bar onRefresh={onRefresh} refreshing={isRefreshing}>

            {/* Form Inputs */}
            <Input
                label="First Name"
                placeholder="Enter first name"
                value={formData.first_name}
                onChangeText={(text) => updateFormData("first_name", text)}
                required
                maxLength={20}
                error={fieldErrors.first_name}
            />
            <Seperator size={15} />
            <Input
                label="Last Name"
                placeholder="Enter last name"
                value={formData.last_name}
                onChangeText={(text) => updateFormData("last_name", text)}
                required
                maxLength={20}
                error={fieldErrors.last_name}
            />
            <Seperator size={15} />
            <Input
                label="Mobile Number"
                placeholder="Enter phone number"
                type="phone"
                maxLength={getPhoneMaxLength(formData.country_code || 'AE')}
                value={formData.phone}
                onChangeText={(text) => updateFormData("phone", text)}
                onChangeCountry={onCountryChange}
                country={formData.country_code}
                required
                error={fieldErrors.phone}
            />
            <Seperator size={15} />
            <Input
                label="Email Address"
                placeholder="Enter email address"
                type="email"
                value={formData.email}
                onChangeText={(text) => updateFormData("email", text)}
                required
            />

            <Seperator size={25} />

            {/* Date Selection */}
            <Text size={18} weight="semibold">Appointment Date :</Text>
            <Seperator size={10} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Row gap={10}>
                    {dates.map((date, index) => {
                        const { day, dayName } = formatDateHeader(date);
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        return (
                            <Touchable
                                key={index}
                                style={[styles.date_item, isSelected && styles.date_item_selected]}
                                onPress={() => onDateSelect(date)}
                            >
                                <Text size={16} weight="bold" color={isSelected ? colors.white : colors.primary}>
                                    {day}
                                </Text>
                                <Text size={12} color={isSelected ? colors.white : colors.icon_gray}>
                                    {dayName}
                                </Text>
                            </Touchable>
                        );
                    })}
                </Row>
            </ScrollView>

            <Seperator size={25} />

            {/* Time Slots */}
            <Text size={18} weight="semibold">Booking Time :</Text>
            <Seperator size={10} />
            <View style={styles.slots_container}>
                {availableSlots.length === 0 ? (
                    <Text size={14} color={colors.icon_gray}>
                        {selectedDate ? "No slots available for this day" : "Select a date to see available slots"}
                    </Text>
                ) : (
                    availableSlots.map((slot: any, index: number) => {
                        const slotData = { start: slot.start_time, end: slot.end_time };
                        const isSelected = selectedSlot?.start === slot.start_time && selectedSlot?.end === slot.end_time;
                        const isBooked = slot.is_booked;
                        const isPassed = isSlotPassed(slot.start_time, selectedDate);
                        const isUserConflict = isSlotConflictingWithUserBooking(slot.start_time, slot.end_time);
                        // Every slot stays tappable; onSlotPress decides whether to select or show a validation modal.
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.7}
                                style={[
                                    styles.slot_item,
                                    isSelected && styles.slot_item_selected,
                                    isBooked && styles.slot_item_booked,
                                    isUserConflict && !isBooked && styles.slot_item_conflict,
                                    isPassed && !isBooked && !isUserConflict && styles.slot_item_passed,
                                ]}
                                onPress={() => onSlotPress(slotData, { isBooked, isPassed })}
                            >
                                <Text
                                    size={14}
                                    color={isPassed && !isBooked && !isUserConflict ? colors.icon_gray : colors.white}
                                >
                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </Text>

                            </TouchableOpacity>
                        );
                    })
                )}
            </View>

            <Seperator size={40} />

            {/* Book Button */}
            <Button text="Book" onPress={onBook} loading={isBooking} />
        </Wrapper>
    );
};

export default AppointmentBooking;

