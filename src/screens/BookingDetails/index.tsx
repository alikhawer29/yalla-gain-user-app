import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import images from "../../assets/images";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import PrescriptionFileThumb from "../../components/PrescriptionFileThumb";
import RateReviewModal from "../../components/RateReviewModal";
import ReportModal from "../../components/ReportModal";
import Row from "../../components/Row";
import Seperator from "../../components/Seperator";
import Text from "../../components/Text";
import TipModal from "../../components/TipModal";
import Wrapper from "../../components/Wrapper";
import colors from "../../utils/colors";
import { formatPhoneDisplay } from "../../utils/helper";
import styles from "./styles";
import useBookingDetailsController from "./useBookingDetailsController";

const BookingDetails = () => {
    const {
        values: {
            booking, service, consultant, isLoading, isApproving, isRejecting,
            isCreatingChat, isRating, isReporting, isGivingTip, isJoiningSession, isDownloading,
            showRateModal, showReportModal, showTipModal
        },
        functions: {
            formatScheduledLocalTime, formatDate, getStatusColor, onApprove, onReject,
            onStartChat, onJoinSession, onRateBooking, onReportBooking, onGiveTip, onSubmitTip,
            setShowRateModal, setShowReportModal, setShowTipModal, onDownloadPrescription,
            onReload,
        },
    } = useBookingDetailsController();

    const status = booking?.status?.toLowerCase();
    const isRescheduled = status === 'rescheduled';
    const isRejected = status === 'rejected';
    const isUpcoming = status === 'upcoming';
    const isInProgress = status === 'in-progress' || status === 'inprogress';
    const isPast = status === 'past' || status === 'completed';

    const formatStatus = (status: string) => {
        if (!status) return "";
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    };

    if (isLoading && !booking) {
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
        <Wrapper
            scrollable
            onRefresh={onReload}
            refreshing={isLoading}
        >
            {/* Booking ID and Status */}
            <Row justify="space-between" align="flex-start" style={styles.header_row}>
                <View>
                    <Text size={14} weight="bold" color={colors.white}>Booking ID:</Text>
                    <Text size={14} color={colors.icon_gray}>#{booking?.id}</Text>
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
                    <Text size={14} color={colors.icon_gray}>{formatDate(booking?.created_at) || '-'}</Text>
                </View>
                <View style={styles.column}>
                    <Text size={14} weight="bold" color={colors.white}>Appointment Date:</Text>
                    <Text size={14} color={colors.icon_gray}>{formatDate(booking?.is_rescheduled ? booking?.rescheduled_appointment_date : booking?.appointment_date) || '-'}</Text>
                </View>
            </Row>

            <Seperator size={20} />

            {/* Appointment Time & Charges */}
            <Row justify="space-between">
                <View style={styles.column}>
                    <Text size={14} weight="bold" color={colors.white}>Appointment Time:</Text>
                    <Text size={14} color={colors.icon_gray}>
                        {formatScheduledLocalTime(booking?.scheduled_start_at, booking?.scheduled_end_at) || '-'}
                    </Text>
                </View>
                <View style={styles.column}>
                    <Text size={14} weight="bold" color={colors.white}>Appointment Charges:</Text>
                    <Row align="center">
                        {booking?.payment_type === 'subscription_included' ? (
                            <Text size={14} color={colors.icon_gray}>Included in Plan</Text>
                        ) : (
                            <>
                                <Text size={14} color={colors.icon_gray}>{booking?.amount_paid || 0} Yalla Coins {" "}</Text>
                                <View style={styles.coin_icon}>
                                    <Icon source={images.coin} size={16} />
                                </View>
                            </>
                        )}

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
                    <Text size={14} color={colors.icon_gray}>
                        {formatPhoneDisplay(booking?.dialing_code, booking?.phone, booking?.country_code)}
                    </Text>
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
                                {formatDate(booking?.rescheduled_appointment_date) || '-'}
                            </Text>
                        </View>
                        <View style={styles.column}>
                            <Text size={14} weight="bold" color={colors.white}>Session Time:</Text>
                            <Text size={14} color={colors.icon_gray}>
                                {formatScheduledLocalTime(booking?.scheduled_start_at, booking?.scheduled_end_at) || '-'}
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
                        loading={isJoiningSession}
                        disabled={isUpcoming || isJoiningSession}
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
                                    <PrescriptionFileThumb
                                        fileUrl={booking.prescription_file}
                                        fileType={booking.prescription_file_type}
                                        fileName={booking.prescription_file_name}
                                        size={28}
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

                    {booking?.is_rated == 0 ? (
                        <>
                            <Button
                                text="Review Booking"
                                onPress={() => setShowRateModal(true)}
                            />
                            <Seperator size={15} />
                        </>
                    ) : null}

                    {!booking?.tip || booking?.is_reported != 1 ? (
                        <Row justify="space-between" gap={10} style={styles.action_row}>
                            {!booking?.tip ? (
                                <Button
                                    text="Give Tip"
                                    type="outlined"
                                    style={styles.action_btn}
                                    font_size={14}
                                    onPress={onGiveTip}
                                />
                            ) : null}
                            {booking?.is_reported == 1 ? null : (
                                <Button
                                    text="Report"
                                    style={[styles.action_btn, styles.report_btn]}
                                    textColor="#F20000"
                                    font_size={14}
                                    onPress={() => setShowReportModal(true)}
                                />
                            )}
                        </Row>
                    ) : null}
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

