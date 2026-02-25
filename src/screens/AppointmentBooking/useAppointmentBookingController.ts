import { useRoute } from '@react-navigation/native';
import { useState, useMemo } from 'react';
import {
  useGetServiceSlotsQuery,
  useBookAppointmentMutation,
} from '../../redux/Apis/User';
import { useModal } from '../../contexts/ModalContext';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import { useAppSelector } from '../../hooks';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dialing_code: string;
  country_code: string;
}

const useAppointmentBookingController = () => {
  const route = useRoute();
  const { serviceId, type, charges } = route.params as {
    serviceId: number;
    type: 'doctor' | 'trainer';
    charges: string;
  };

  const { showOkModal, showYesNoModal } = useModal();
  const user = useAppSelector(state => state.auth.user);

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dialing_code: '+971',
    country_code: 'AE',
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // Format date for API query (YYYY-MM-DD)
  const formattedDate = selectedDate
    ? selectedDate.toISOString().split('T')[0]
    : undefined;

  const { data: slotsData, isFetching: isLoadingSlots } =
    useGetServiceSlotsQuery(
      { serviceId, date: formattedDate },
      { skip: !selectedDate },
    );
  const [bookAppointment, { isLoading: isBooking }] =
    useBookAppointmentMutation();

  const slots = slotsData?.data || [];

  // Generate next 7 days for date selection
  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      result.push(date);
    }
    return result;
  }, []);

  // Return slots directly since API already filters by date
  const availableSlots = slots;

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const onCountryChange = (country: any) => {
    setFormData(prev => ({
      ...prev,
      dialing_code: `+${country.callingCode[0]}`,
      country_code: country.cca2,
    }));
  };

  const onDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const onSlotSelect = (slot: { start: string; end: string }) => {
    setSelectedSlot(slot);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const confirmBooking = async () => {
    const appointmentDate = selectedDate!.toISOString().split('T')[0];

    try {
      const response = await bookAppointment({
        service_id: serviceId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        dialing_code: formData.dialing_code,
        country_code: formData.country_code,
        appointment_date: appointmentDate,
        appointment_start_time: selectedSlot!.start,
        appointment_end_time: selectedSlot!.end,
        amount_paid: charges,
      }).unwrap();

      // Calculate remaining coins
      const chargesAmount = parseInt(charges) || 0;
      const currentCoins = parseInt(user?.coins) || 0;
      const remainingCoins = currentCoins - chargesAmount;
      const bookingId =
        response?.data?.id || response?.data?.booking_id || '123456789';

      // Show success modal with combined message
      showOkModal(
        {
          type: 'success',
          title: 'Successful',
          message: `Appointment Has Been Booked Successfully!\n\nYour Booking ID Is #${bookingId}.\n\n${chargesAmount} Yalla Coins Have Been Deducted. You Now Have ${remainingCoins} Yalla Coins Left.`,
        },
        () => {
          // Navigate to My Bookings
          navigate(ROUTES.MY_BOOKINGS);
        },
      );
    } catch (err: any) {
      showOkModal({
        type: 'error',
        title: 'Unsuccessful',
        message:
          err?.data?.message ||
          "You Don't Have Enough Coins To Purchase The Service. Please Add Funds To Your Wallet To Avail The Service",
      });
    }
  };

  const onBook = () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone
    ) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Please fill all required fields.',
      });
      return;
    }
    if (formData.phone.length < 6 || formData.phone.length > 15) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Phone number must be 6–15 digits.',
      });
      return;
    }
    if (!selectedDate || !selectedSlot) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Please select date and time slot.',
      });
      return;
    }

    // Show confirmation modal
    showYesNoModal(
      {
        type: 'warning',
        title: 'Book Appointment',
        message: 'Are You Sure You Want To Book The Appointment',
      },
      confirmBooking,
    );
  };

  return {
    values: {
      formData,
      dates,
      availableSlots,
      selectedDate,
      selectedSlot,
      isLoadingSlots,
      isBooking,
      type,
    },
    functions: {
      updateFormData,
      onCountryChange,
      onDateSelect,
      onSlotSelect,
      onBook,
      formatTime,
    },
  };
};

export default useAppointmentBookingController;
