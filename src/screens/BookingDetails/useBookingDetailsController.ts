import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useAppSelector } from '../../hooks';
import { selectUser } from '../../redux/Slices/AuthSlice';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import {
  ensureDownloadDirectory,
  showDownloadSuccessToast,
} from '../../utils/fileDownload';
import {
  useGetBookingDetailsQuery,
  useJoinZoomSessionMutation,
  useZoomCheckInMutation,
  useApproveRescheduleMutation,
  useRejectRescheduleMutation,
  useCreateChatMutation,
  useRateBookingMutation,
  useReportBookingMutation,
  useGiveTipMutation,
} from '../../redux/Apis/User';
import { useModal } from '../../contexts/ModalContext';
import { navigate } from '../../utils/navigation';
import { NAVIGATORS, ROUTES } from '../../utils/routes';
import { clearZoomSessionActive } from '../../utils/zoomSessionStorage';
import {
  MIN_TIP_YALLA_POINTS,
  MIN_TIP_YALLA_POINTS_MESSAGE,
} from '../../utils/tip';
import {
  isDoctorSessionNotStartedError,
  mapJoinSessionMessage,
} from '../../utils/mapJoinSessionMessage';
import dayjs from 'dayjs';

const useBookingDetailsController = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: number; refreshAfterMeeting?: boolean };
  const user = useAppSelector(selectUser);

  const { showOkModal, showYesNoModal, showInputModal } = useModal();

  const [showRateModal, setShowRateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetBookingDetailsQuery(id);

  useFocusEffect(
    useCallback(() => {
      const params = route.params as { refreshAfterMeeting?: boolean };
      if (params.refreshAfterMeeting) {
        refetch();
        navigation.setParams({ refreshAfterMeeting: false } as never);
      }
    }, [navigation, refetch, route.params]),
  );

  const [approveReschedule, { isLoading: isApproving }] =
    useApproveRescheduleMutation();
  const [rejectReschedule, { isLoading: isRejecting }] =
    useRejectRescheduleMutation();
  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();
  const [rateBooking, { isLoading: isRating }] = useRateBookingMutation();
  const [reportBooking, { isLoading: isReporting }] =
    useReportBookingMutation();
  const [giveTip, { isLoading: isGivingTip }] = useGiveTipMutation();
  const [zoomCheckIn, { isLoading: isCheckingIn }] = useZoomCheckInMutation();
  const [joinZoomSession, { isLoading: isJoiningZoom }] =
    useJoinZoomSessionMutation();
  const isJoiningSession = isCheckingIn || isJoiningZoom;

  const booking = data?.data;
  const service = booking?.service;
  const consultant = service?.user;

  const onReload = () => {
    refetch();
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';

    const trimmed = String(dateString).trim();

    // MM/DD/YYYY (same as MyBookings BookingCard)
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const monthIndex = parseInt(parts[0], 10) - 1;
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      if (
        !Number.isNaN(monthIndex) &&
        !Number.isNaN(day) &&
        !Number.isNaN(year)
      ) {
        const d = dayjs(new Date(year, monthIndex, day));
        if (d.isValid()) return d.format('MMMM D, YYYY');
      }
    }

    const d = dayjs(trimmed);
    return d.isValid() ? d.format('MMMM D, YYYY') : '';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return '#FF4F25'; // primary/teal
      case 'rescheduled':
        return '#9747FF'; // orange
      case 'pending':
        return '#D59C00'; // yellow
      case 'in-progress':
      case 'inprogress':
        return '#118076'; // blue
      case 'past':
        return '#C85929'; // gray
      case 'completed':
        return '#808080'; // gray
      case 'rejected':
        return '#F20000'; // red
      default:
        return '#808080';
    }
  };

  const onApprove = () => {
    showYesNoModal(
      {
        type: 'warning',
        title: 'Request',
        message: 'Are You Sure You Want To Accept Reschedule Request?',
      },
      async () => {
        try {
          await approveReschedule(id).unwrap();
          showOkModal(
            {
              type: 'success',
              title: 'Successfully',
              message: 'Rescheduled Request Has Been Accepted Successfully.',
            },
            () => refetch(),
          );
        } catch (err: any) {
          showOkModal({
            type: 'error',
            title: 'Error',
            message:
              err?.data?.message || 'Failed to approve reschedule request.',
          });
        }
      },
    );
  };

  const onReject = () => {
    showYesNoModal(
      {
        type: 'warning',
        title: 'Request',
        message: 'Are You Sure You Want To Reject Reschedule Request?',
      },
      () => {
        showInputModal(
          {
            type: 'input',
            title: 'Rejection Reason*:',
            placeholder: 'Write Rejection Reason......',
          },
          async (reason: string) => {
            if (!reason.trim()) {
              showOkModal({
                type: 'error',
                title: 'Error',
                message: 'Please enter a rejection reason.',
              });
              return;
            }
            try {
              await rejectReschedule({ id, rejection_reason: reason }).unwrap();
              showOkModal(
                {
                  type: 'success',
                  title: 'Successfully',
                  message:
                    'Rescheduled Request Has Been Rejected Successfully.',
                },
                () => refetch(),
              );
            } catch (err: any) {
              showOkModal({
                type: 'error',
                title: 'Error',
                message:
                  err?.data?.message || 'Failed to reject reschedule request.',
              });
            }
          },
        );
      },
    );
  };

  const onStartChat = async () => {
    if (!consultant?.id) return;
    try {
      const response = await createChat(consultant.id).unwrap();
      const chatData = response?.data;
      const consultantName =
        [consultant.first_name, consultant.last_name]
          .filter(Boolean)
          .join(' ')
          .trim() ||
        consultant.name?.trim() ||
        'Chat';

      if (chatData?.id) {
        navigate(NAVIGATORS.DRAWER as any, {
          screen: NAVIGATORS.BOTTOM,
          params: {
            screen: NAVIGATORS.CHAT_STACK,
            params: {
              screen: ROUTES.CHAT_DETAILS,
              params: {
                chatId: chatData.id,
                name: consultantName,
                title: consultantName,
                image: consultant.image || consultant.photo || '',
                userRole: consultant.type || 'doctor',
                userId: consultant.id,
                returnToBookingId: id,
              },
            },
          },
        });
      } else {
        navigate(NAVIGATORS.DRAWER as any, {
          screen: NAVIGATORS.BOTTOM,
          params: {
            screen: NAVIGATORS.CHAT_STACK,
            params: { screen: ROUTES.CHAT },
          },
        });
      }
    } catch (err: any) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to start chat.',
      });
    }
  };

  const onJoinSession = async () => {
    const status = booking?.status?.toLowerCase();
    const isInProgress = status === 'in-progress' || status === 'inprogress';

    if (!isInProgress) {
      showOkModal({
        type: 'info',
        title: 'Join Session',
        message:
          'You can join the meeting only when the session is in progress.',
      });
      return;
    }

    const adminJoined = (booking as { is_admin_joined?: boolean })
      ?.is_admin_joined;
    if (adminJoined === false) {
      showOkModal(
        {
          type: 'info',
          title: 'Join Session',
          message: 'Waiting for the doctor to join the session.',
          okText: 'Retry',
        },
        () => {
          void refetch();
        },
      );
      return;
    }

    try {
      await zoomCheckIn(id).unwrap();
      const response = await joinZoomSession(id).unwrap();
      const session = response?.data as
        | {
            session_token?: string;
            session_name?: string;
            role?: number;
            video_session?: {
              status?: string;
              scheduled_start_at?: string;
              scheduled_end_at?: string;
              duration_minutes?: number;
              started_at?: string;
            };
          }
        | undefined;

      const videoSession =
        session?.video_session ??
        (booking as {
          video_session?: {
            status?: string;
            scheduled_start_at?: string;
            scheduled_end_at?: string;
            duration_minutes?: number;
            started_at?: string;
          };
        })?.video_session;

      const sessionToken = session?.session_token?.trim();
      const sessionName = session?.session_name?.trim();
      const role = Number(session?.role ?? 0);

      if (!sessionToken || !sessionName) {
        showOkModal({
          type: 'error',
          title: 'Error',
          message:
            response?.message ||
            'Could not start the video session. Please try again.',
        });
        return;
      }

      const userName =
        [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
        'Participant';

      const consultantName = consultant
        ? [consultant.first_name, consultant.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Doctor';
      const patientName =
        [booking?.first_name, booking?.last_name].filter(Boolean).join(' ') ||
        'Patient';

      await clearZoomSessionActive();

      const appointmentDate = booking?.is_rescheduled
        ? booking?.rescheduled_appointment_date
        : booking?.appointment_date;
      const appointmentEndTime = booking?.is_rescheduled
        ? booking?.rescheduled_appointment_end_time
        : booking?.appointment_end_time;

      (navigation as any).navigate(ROUTES.VIDEO_SESSION, {
        session_token: sessionToken,
        session_name: sessionName,
        user_name: userName,
        role,
        doctor_name: consultantName,
        patient_name: patientName,
        booking_id: id,
        scheduled_start_at: videoSession?.scheduled_start_at,
        scheduled_end_at: videoSession?.scheduled_end_at,
        duration_minutes: videoSession?.duration_minutes,
        started_at: videoSession?.started_at,
        session_status: videoSession?.status,
        appointment_date: appointmentDate,
        appointment_end_time: appointmentEndTime,
      });
    } catch (err: any) {
      const apiMessage = err?.data?.message ?? err?.message;
      const sessionNotStarted = isDoctorSessionNotStartedError(err);
      const message = mapJoinSessionMessage(apiMessage);

      showOkModal(
        {
          type: sessionNotStarted ? 'warning' : 'error',
          title: sessionNotStarted ? 'Join Session' : 'Error',
          message,
          okText: sessionNotStarted ? 'Retry' : 'OK',
        },
        sessionNotStarted
          ? () => {
              void refetch();
            }
          : undefined,
      );
    }
  };

  const onRateBooking = async (rating: number, review: string) => {
    if (!rating) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Please select a rating.',
      });
      return;
    }
    if (!review.trim()) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Please enter a review.',
      });
      return;
    }
    try {
      await rateBooking({ id, rating, review }).unwrap();
      setShowRateModal(false);
      showOkModal(
        {
          type: 'success',
          title: 'Successfully',
          message: 'Review Has Been Submitted Successfully',
        },
        () => refetch(),
      );
    } catch (err: any) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to submit review.',
      });
    }
  };

  const onReportBooking = async (reason: string, files: any[]) => {
    if (!reason.trim()) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Please enter report details.',
      });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('reason', reason);
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      });
      await reportBooking({ id, formData }).unwrap();
      setShowReportModal(false);
      showOkModal(
        {
          type: 'success',
          title: 'Successfully',
          message:
            'Your Report Against This Booking Has Been Submitted To The Admin.',
        },
        () => refetch(),
      );
    } catch (err: any) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to submit report.',
      });
    }
  };

  const onGiveTip = () => {
    setShowTipModal(true);
  };

  const onSubmitTip = async (coins: number) => {
    if (!Number.isFinite(coins) || coins < MIN_TIP_YALLA_POINTS) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: MIN_TIP_YALLA_POINTS_MESSAGE,
      });
      throw new Error('validation');
    }
    try {
      await giveTip({ id, coins }).unwrap();
      refetch();
    } catch (err: any) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || err?.error || 'Failed to send tip.',
      });
      throw err;
    }
  };

  const onDownloadPrescription = async () => {
    if (!booking?.prescription_file) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No prescription file available',
      });
      return;
    }

    try {
      setIsDownloading(true);
      const fileUrl = booking.prescription_file;
      const fileName =
        booking.prescription_file_name || `prescription_${booking.id}.pdf`;

      const downloadDir = await ensureDownloadDirectory();
      const filePath = `${downloadDir}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: filePath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        if (Platform.OS === 'android') {
          try {
            await RNFS.scanFile(filePath);
          } catch {
            // non-fatal
          }
        }
        showDownloadSuccessToast(filePath, fileName);
      } else {
        throw new Error('Download failed');
      }
    } catch (err: any) {
      console.error('Download error:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.message || 'Failed to download file',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    values: {
      booking,
      service,
      consultant,
      isLoading,
      isApproving,
      isRejecting,
      isCreatingChat,
      isRating,
      isReporting,
      isGivingTip,
      isJoiningSession,
      isDownloading,
      showRateModal,
      showReportModal,
      showTipModal,
    },
    functions: {
      onReload,
      formatTime,
      formatDate,
      getStatusColor,
      onApprove,
      onReject,
      onStartChat,
      onJoinSession,
      onRateBooking,
      onReportBooking,
      onGiveTip,
      onSubmitTip,
      onDownloadPrescription,
      setShowRateModal,
      setShowReportModal,
      setShowTipModal,
    },
  };
};

export default useBookingDetailsController;
