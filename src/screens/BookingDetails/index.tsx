import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import images from "../../assets/images";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import Image from "../../components/Image";
import RateReviewModal from "../../components/RateReviewModal";
import ReportModal from "../../components/ReportModal";
import Row from "../../components/Row";
import Seperator from "../../components/Seperator";
import Text from "../../components/Text";
import TipModal from "../../components/TipModal";
import Wrapper from "../../components/Wrapper";
import colors from "../../utils/colors";
import styles from "./styles";
import useBookingDetailsController from "./useBookingDetailsController";

const BookingDetails = () => {
    const {
        values: {
            booking, service, consultant, isLoading, isApproving, isRejecting,
            isCreatingChat, isRating, isReporting, isGivingTip, isDownloading,
            showRateModal, showReportModal, showTipModal
        },
        functions: {
            formatTime, getStatusColor, onApprove, onReject,
            onStartChat, onJoinSession, onRateBooking, onReportBooking, onGiveTip, onSubmitTip,
            setShowRateModal, setShowReportModal, setShowTipModal, onDownloadPrescription
        },
    } = useBookingDetailsController();

    console.log(consultant?.type, 'consultant')

    const status = booking?.status?.toLowerCase();
    const isRescheduled = status === 'rescheduled';
    const isRejected = status === 'rejected';
    const isUpcoming = status === 'upcoming';
    const isInProgress = status === 'in_progress' || status === 'inprogress';
    const isPast = status === 'past' || status === 'completed';

    const formatStatus = (status: string) => {
        if (!status) return "";
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    };

    if (isLoading) {
        return (
            <Wrapper>
                <View style={styles.loader_container}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Seperator size={10} />
                    <Text size={14} color={colors.icon_gray}>Loading booking details...</Text>
                </View>
            </Wrapper>
        );
    }

    return (
        <Wrapper scrollable>
            {/* Booking ID and Status */}
            <Row justify="space-between" align="flex-start" style={styles.header_row}>
                <View>
                    <Text size={14} weight="bold" color={colors.white}>Booking ID:</Text>
                    <Text size={14} color={colors.icon_gray}>#{booking?.id || booking?.booking_id}</Text>
                </View>
                <View style={[styles.status_badge, { backgroundColor: getStatusColor(booking?.status) }]}>
                    <Text size={12} color={colors.white}>
                        {formatStatus(booking?.status)}
                    </Text>
                </View>
            </Row>

            <Seperator size={25} />

            {/* Two Column Layout - Booking Date & Appointment Date */}
            <Row justify="space-between">
                <View style={styles.column}>
                    <Text size={14} weight="bold" color={colors.white}>Booking Date:</Text>
                    <Text size={14} color={colors.icon_gray}>{booking?.created_at || 'mm/dd/yyyy'}</Text>
                </View>
                <View style={styles.column}>
                    <Text size={14} weight="bold" color={colors.white}>Appointment Date:</Text>
                    <Text size={14} color={colors.icon_gray}>{booking?.appointment_date || 'mm/dd/yyyy'}</Text>
                </View>
            </Row>

            <Seperator size={20} />

            {/* Appointment Time & Charges */}
            <Row justify="space-between">
                <View style={styles.column}>
                    <Text size={14} weight="bold" color={colors.white}>Appointment Time:</Text>
                    <Text size={14} color={colors.icon_gray}>
                        {formatTime(booking?.appointment_start_time)} - {formatTime(booking?.appointment_end_time)}
                    </Text>
                </View>
                <View style={styles.column}>
                    <Text size={14} weight="bold" color={colors.white}>Appointment Charges:</Text>
                    <Row align="center">
                        <Text size={14} color={colors.icon_gray}>{booking?.amount_paid || 0} Yalla Coins {" "}</Text>
                        <View style={styles.coin_icon}>
                            <Icon source={images.coin} size={16} />
                        </View>
                    </Row>
                </View>
            </Row>

            <Seperator size={20} />

            {/* Doctor Name & Service Category */}
            <Row justify="space-between">
                <View style={styles.column}>
                    <Text size={14} weight="bold" color={colors.white}>Doctor Name:</Text>
                    <Text size={14} color={colors.icon_gray}>
                        {consultant?.first_name} {consultant?.last_name}
                    </Text>
                </View>
                <View style={styles.column}>
                    <Text size={14} weight="bold" color={colors.white}>Service Category:</Text>
                    <Text size={14} color={colors.icon_gray}>{service?.service_category?.title || service?.title || '-'}</Text>
                </View>
            </Row>

            <Seperator size={20} />

            {/* User Name & Contact */}
            <Row justify="space-between">
                <View style={styles.column}>
                    <Text size={14} weight="bold" color={colors.white}>User Name:</Text>
                    <Text size={14} color={colors.icon_gray}>{booking?.first_name} {booking?.last_name}</Text>
                </View>
                <View style={styles.column}>
                    <Text size={14} weight="bold" color={colors.white}>User Contact No:</Text>
                    <Text size={14} color={colors.icon_gray}>{booking?.dialing_code}{booking?.phone}</Text>
                </View>
            </Row>

            <Seperator size={20} />

            {/* User Email */}
            <View>
                <Text size={14} weight="bold" color={colors.white}>User Email:</Text>
                <Text size={14} color={colors.icon_gray}>{booking?.email || '-'}</Text>
            </View>

            {/* Rescheduled Section */}
            {isRescheduled && (
                <>
                    <Seperator size={20} />
                    <View style={styles.divider} />
                    <Seperator size={20} />

                    <Text size={18} weight="bold" color={colors.white}>Rescheduled Time And Date</Text>
                    <Seperator size={15} />

                    <Row justify="space-between">
                        <View style={styles.column}>
                            <Text size={14} weight="bold" color={colors.white}>Session Date:</Text>
                            <Text size={14} color={colors.icon_gray}>
                                {booking?.rescheduled_appointment_date || 'mm/dd/yyyy'}
                            </Text>
                        </View>
                        <View style={styles.column}>
                            <Text size={14} weight="bold" color={colors.white}>Session Time:</Text>
                            <Text size={14} color={colors.icon_gray}>
                                {formatTime(booking?.rescheduled_appointment_start_time)} To {formatTime(booking?.rescheduled_appointment_end_time)}
                            </Text>
                        </View>
                    </Row>

                    <Seperator size={30} />

                    <Row justify="space-between" gap={15}>
                        <Button
                            text="Approve"
                            style={styles.approve_btn}
                            onPress={onApprove}
                            loading={isApproving}
                        />
                        <Button
                            text="Reject"
                            type="outlined"
                            style={styles.reject_btn}
                            // textColor="#F20000"
                            onPress={onReject}
                            loading={isRejecting}
                        />
                    </Row>
                </>
            )}

            {/* Rejected Reason Section */}
            {isRejected && booking?.rejection_reason && (
                <>
                    <Seperator size={20} />

                    <Text size={14} weight="bold" color={colors.white}>Rejected Reason :</Text>
                    <Seperator size={5} />
                    <Text size={14} color={colors.icon_gray}>
                        {booking?.rejection_reason}
                    </Text>
                </>
            )}

            {/* Start Chat - For Upcoming and In Progress */}
            {(isUpcoming || isInProgress) && (
                <>
                    <Seperator size={25} />
                    <TouchableOpacity
                        style={[styles.start_chat_btn, isUpcoming && styles.disabled]}
                        onPress={onStartChat}
                        disabled={isUpcoming || isCreatingChat}
                    >
                        <View style={styles.circleIcon}>
                            <Icon source={images.helpdesk.chat} size={20} tint_color="#FFFFFF" />
                        </View>

                        <Text
                            size={16}
                            weight="semibold"
                            color={isUpcoming ? colors.icon_gray : colors.white}
                        >
                            Start Chat
                        </Text>
                    </TouchableOpacity>

                    <Seperator size={20} />

                    <Button
                        text="Join Session"
                        onPress={onJoinSession}
                        style={isUpcoming ? styles.disabled : {}}
                    />
                </>
            )}

            {/* Past Booking - Prescription & Document */}
            {isPast && (
                <>
                    <Seperator size={20} />

                    {booking?.prescription_text && (
                        <>
                            <Text size={14} weight="bold" color={colors.white}>Prescription :</Text>
                            <Seperator size={5} />
                            <Text size={14} color={colors.icon_gray}>
                                {booking?.prescription_text}
                            </Text>
                            <Seperator size={20} />
                        </>
                    )}

                    {booking?.prescription_file && (
                        <>
                            <Text size={14} weight="bold" color={colors.white}>Document :</Text>
                            <Seperator size={10} />
                            <TouchableOpacity
                                style={styles.document_btn}
                                onPress={onDownloadPrescription}
                                disabled={isDownloading}
                            >
                                {isDownloading ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <Image
                                        source={images.helpdesk.pdf}
                                        style={styles.pdf_icon}
                                    />
                                )}
                                <Text size={12} color={colors.icon_gray} lines={1} style={styles.document_name}>
                                    {isDownloading ? 'Downloading...' : (booking?.prescription_file_name || 'document.pdf')}
                                </Text>
                            </TouchableOpacity>
                            <Seperator size={20} />
                        </>
                    )}

                    <Seperator size={10} />

                    {/* Review Booking */}
                    {consultant?.type !== 'trainer' && booking?.is_rated == 0 && (
                        <Button
                            text="Review Booking"
                            onPress={() => setShowRateModal(true)}
                        />
                    )}

                    <Seperator size={15} />

                    <Row justify="space-between" gap={15}>

                        {consultant?.type == 'trainer' && booking?.is_rated == 0 ? (
                            <Button
                                text="Review Booking"
                                onPress={() => setShowRateModal(true)}
                            />
                        ) : null}

                        {consultant?.type == 'trainer' ? null : (
                            <Button
                                text="Give Tip"
                                type="outlined"
                                style={styles.half_btn}
                                onPress={onGiveTip}
                            />
                        )}
                        {booking?.is_reported == 1 ? null : (
                            <Button
                                text="Report"
                                style={styles.report_btn}
                                textColor="#F20000"
                                onPress={() => setShowReportModal(true)}
                            />
                        )}
                    </Row>
                </>
            )}

            {/* Rate Review Modal */}
            <RateReviewModal
                visible={showRateModal}
                onClose={() => setShowRateModal(false)}
                onSubmit={onRateBooking}
                loading={isRating}
            />

            {/* Report Modal */}
            <ReportModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={onReportBooking}
                loading={isReporting}
            />

            {/* Tip Modal */}
            <TipModal
                visible={showTipModal}
                onClose={() => setShowTipModal(false)}
                onSubmit={onSubmitTip}
                loading={isGivingTip}
            />
        </Wrapper>
    );
};

export default BookingDetails;

