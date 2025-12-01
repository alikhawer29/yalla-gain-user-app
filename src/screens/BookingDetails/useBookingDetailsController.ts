import { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  useGetBookingDetailsQuery,
  useApproveRescheduleMutation,
  useRejectRescheduleMutation,
  useCreateChatMutation,
  useRateBookingMutation,
  useReportBookingMutation,
} from '../../redux/Apis/User';
import { useModal } from '../../contexts/ModalContext';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';

const useBookingDetailsController = () => {
  const route = useRoute();
  const { id } = route.params as { id: number };

  const { showOkModal, showYesNoModal, showInputModal } = useModal();

  const [showRateModal, setShowRateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetBookingDetailsQuery(id);

  const [approveReschedule, { isLoading: isApproving }] =
    useApproveRescheduleMutation();
  const [rejectReschedule, { isLoading: isRejecting }] =
    useRejectRescheduleMutation();
  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();
  const [rateBooking, { isLoading: isRating }] = useRateBookingMutation();
  const [reportBooking, { isLoading: isReporting }] =
    useReportBookingMutation();

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    // Parse MM/DD/YYYY format
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';

    // Convert to numbers (subtract 1 from month because JS months are 0-indexed)
    const monthIndex = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Create date object
    const date = new Date(year, monthIndex, day);

    // Validate date
    if (isNaN(date.getTime())) return '';

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthName = months[date.getMonth()];

    return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return '#FF4F25'; // primary/teal
      case 'rescheduled':
        return '#9747FF'; // orange
      case 'pending':
        return '#D59C00'; // yellow
      case 'in_progress':
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
      await createChat(consultant.id).unwrap();
      // Navigate to chat screen
      navigate(ROUTES.CHAT);
    } catch (err: any) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to start chat.',
      });
    }
  };

  const onJoinSession = () => {
    // TODO: Implement join session functionality
    showOkModal({
      type: 'info',
      title: 'Join Session',
      message: 'Join session functionality will be implemented soon.',
    });
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
      console.log(id, 'id');
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
    // TODO: Implement give tip functionality
    showOkModal({
      type: 'info',
      title: 'Give Tip',
      message: 'Give tip functionality will be implemented soon.',
    });
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
      showRateModal,
      showReportModal,
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
      setShowRateModal,
      setShowReportModal,
    },
  };
};

export default useBookingDetailsController;
