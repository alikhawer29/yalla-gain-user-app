import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { useSubscriptionAccess } from '../../hooks/useSubscriptionAccess';
import {
  useGetServiceSlotsQuery,
  useBookAppointmentMutation,
  useGetMyBookingsQuery,
} from '../../redux/Apis/User';
import { useModal } from '../../contexts/ModalContext';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import { useAppSelector } from '../../hooks';
import { validatePhoneByCountry } from '../../utils/helper';
import {
  findOverlappingBooking,
  isAppointmentOverlapApiError,
  isSlotConflictingWithBookings,
} from '../../utils/appointmentOverlap';

const SCHEDULING_CONFLICT_MESSAGE =
  'You already have a session booked during this time. Please choose a different slot.';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dialing_code: string;
  country_code: string;
}

interface FieldErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

const validateFirstName = (value: string): string | undefined => {
  if (!value?.trim()) return 'First name is required.';
  if (value.trim().length < 2) return 'First name must be at least 2 characters.';
  if (value.trim().length > 50) return 'First name must be 50 characters or less.';
  if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
    return 'First name can only contain letters.';
  }
  return undefined;
};

const validateLastName = (value: string): string | undefined => {
  if (!value?.trim()) return 'Last name is required.';
  if (value.trim().length < 2) return 'Last name must be at least 2 characters.';
  if (value.trim().length > 50) return 'Last name must be 50 characters or less.';
  if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
    return 'Last name can only contain letters.';
  }
  return undefined;
};

const validatePhone = (data: FormData): string | undefined => {
  const phone = data.phone?.trim() ?? '';

  if (!phone) return 'Mobile Number is required';

  if (!/^[0-9]+$/.test(phone)) {
    return 'Phone number can only contain digits';
  }

  const digits = phone.replace(/\D/g, '');
  if (/^(.)\1+$/.test(digits)) {
    return 'Phone number cannot consist of the same digit repeated';
  }

  if (!data.country_code) {
    return 'Please select a valid country.';
  }

  const countryError = validatePhoneByCountry(phone, data.country_code);
  if (countryError) {
    return countryError;
  }

  return undefined;
};

const getApiFieldErrors = (err: any): FieldErrors => {
  const errors: FieldErrors = {};
  const apiErrors = err?.data?.errors;

  if (apiErrors && typeof apiErrors === 'object') {
    (['first_name', 'last_name', 'phone'] as const).forEach(key => {
      const value = apiErrors[key];
      if (Array.isArray(value) && value[0]) {
        errors[key] = value[0];
      } else if (typeof value === 'string') {
        errors[key] = value;
      }
    });
  }

  const message = err?.data?.message;
  if (message && typeof message === 'string') {
    const lower = message.toLowerCase();
    if (!errors.first_name && lower.includes('first name')) {
      errors.first_name = message;
    } else if (!errors.last_name && lower.includes('last name')) {
      errors.last_name = message;
    } else if (
      !errors.phone &&
      (lower.includes('phone') || lower.includes('mobile'))
    ) {
      errors.phone = message;
    }
  }

  return errors;
};

const useAppointmentBookingController = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { serviceId, type, charges } = route.params as {
    serviceId: number;
    type: 'doctor' | 'trainer';
    charges: string;
  };
  const { requireAccess } = useSubscriptionAccess();
  const appointmentFeature =
    type === 'doctor' ? 'doctor_appointments' : 'trainer_appointments';

  useFocusEffect(
    useCallback(() => {
      if (!requireAccess(appointmentFeature)) {
        navigation.goBack();
      }
    }, [appointmentFeature, navigation, requireAccess]),
  );

  const { showOkModal, showYesNoModal } = useModal();
  const user = useAppSelector(state => state.auth.user);
  const prefillFromUserOnce = useRef(false);

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dialing_code: '+971',
    country_code: 'AE',
  });

  useEffect(() => {
    if (!user || prefillFromUserOnce.current) return;
    prefillFromUserOnce.current = true;
    setFormData(prev => ({
      ...prev,
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      email: user.email ?? '',
    }));
  }, [user]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Format date for API query (YYYY-MM-DD)
  const formattedDate = selectedDate
    ? selectedDate.toISOString().split('T')[0]
    : undefined;

  const { data: slotsData, isFetching: isLoadingSlots, refetch } =
    useGetServiceSlotsQuery(
      { serviceId, date: formattedDate },
      { skip: !selectedDate },
    );
  // Fetch broadly (no backend date filter) and match the date client-side to
  // avoid missing bookings when the backend date-filter format differs.
  const { data: doctorBookingsData } = useGetMyBookingsQuery({
    type: 'doctor',
    per_page: 100,
    page: 1,
  });
  const { data: trainerBookingsData } = useGetMyBookingsQuery({
    type: 'trainer',
    per_page: 100,
    page: 1,
  });
  const [bookAppointment, { isLoading: isBooking }] =
    useBookAppointmentMutation();

  const slots = slotsData?.data || [];
  const existingBookingsForDate = useMemo(
    () => [
      ...(doctorBookingsData?.data ?? []).map((b: any) => ({
        ...b,
        __providerType: 'doctor',
      })),
      ...(trainerBookingsData?.data ?? []).map((b: any) => ({
        ...b,
        __providerType: 'trainer',
      })),
    ],
    [doctorBookingsData?.data, trainerBookingsData?.data],
  );

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
    if (key === 'first_name' || key === 'last_name' || key === 'phone') {
      setFieldErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const onCountryChange = (country: any) => {
    const callingCode = country?.callingCode?.[0];
    if (!callingCode) {
      console.error('Invalid country selected: missing calling code', country);
      return;
    }
    setFormData(prev => ({
      ...prev,
      dialing_code: `+${callingCode}`,
      country_code: country.cca2,
      phone: '',
    }));
    setFieldErrors(prev => ({ ...prev, phone: undefined }));
  };

  const onDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const onSlotSelect = (slot: { start: string; end: string }) => {
    setSelectedSlot(slot);
  };

  const onRefresh = useCallback(async () => {
    if (!selectedDate) {
      return;
    }

    setIsRefreshing(true);
    try {
      await refetch();
      setSelectedSlot(null);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedDate, refetch]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isSlotPassed = (startTime: string, date: Date | null) => {
    if (!date || !startTime) return false;

    const [hours, minutes, seconds = '0'] = startTime.split(':');
    const slotStart = new Date(date);
    slotStart.setHours(
      parseInt(hours, 10),
      parseInt(minutes, 10),
      parseInt(seconds, 10),
      0,
    );

    return slotStart.getTime() <= Date.now();
  };

  const isSlotConflictingWithUserBooking = (
    startTime: string,
    endTime: string,
  ) => {
    if (!formattedDate) {
      return false;
    }

    return isSlotConflictingWithBookings(
      existingBookingsForDate,
      formattedDate,
      startTime,
      endTime,
    );
  };

  const getUserConflictForSlot = (startTime: string, endTime: string) => {
    if (!formattedDate) {
      return undefined;
    }

    return findOverlappingBooking(
      existingBookingsForDate,
      formattedDate,
      startTime,
      endTime,
    );
  };

  const describeBookingProvider = (booking: any) => {
    const providerType =
      booking?.__providerType === 'trainer' ? 'trainer' : 'doctor';
    const name = [
      booking?.service?.user?.first_name,
      booking?.service?.user?.last_name,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return name
      ? `a different ${providerType} (${name})`
      : `a different ${providerType}`;
  };

  const onSlotPress = (
    slot: { start: string; end: string },
    options?: { isBooked?: boolean; isPassed?: boolean },
  ) => {
    const conflict = getUserConflictForSlot(slot.start, slot.end);
    console.log('[AppointmentBooking] onSlotPress', {
      slot,
      isBooked: options?.isBooked,
      isPassed: options?.isPassed,
      formattedDate,
      totalBookings: existingBookingsForDate.length,
      conflictId: conflict?.id,
    });

    if (conflict) {
      showOkModal({
        type: 'error',
        title: 'Already Booked',
        message: `You already have a booking at this time with ${describeBookingProvider(
          conflict,
        )}. Please choose a different slot.`,
      });
      return;
    }

    if (options?.isBooked) {
      showOkModal({
        type: 'error',
        title: 'Already Booked',
        message:
          'This time slot is already booked. Please choose another slot.',
      });
      return;
    }

    if (options?.isPassed) {
      showOkModal({
        type: 'error',
        title: 'Slot Unavailable',
        message:
          'This time slot has already passed. Please select another slot.',
      });
      return;
    }

    onSlotSelect(slot);
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
      const isSubscriptionIncluded =
        response?.data?.payment_type === 'subscription_included';

      let successMessage = `Appointment Has Been Booked Successfully!\n\nYour Booking ID Is #${bookingId}.`;
      if (!isSubscriptionIncluded) {
        successMessage += `\n\n${chargesAmount} Yalla Coins Have Been Deducted.`;
      }

      showOkModal(
        {
          type: 'success',
          title: 'Successful',
          message: successMessage,
        },
        () => {
          // Navigate to My Bookings
          navigate(ROUTES.MY_BOOKINGS);
        },
      );
    } catch (err: any) {
      const apiFieldErrors = getApiFieldErrors(err);
      if (
        apiFieldErrors.first_name ||
        apiFieldErrors.last_name ||
        apiFieldErrors.phone
      ) {
        setFieldErrors(apiFieldErrors);
        return;
      }

      const apiMessage = err?.data?.message;
      if (isAppointmentOverlapApiError(apiMessage)) {
        showOkModal({
          type: 'error',
          title: 'Scheduling Conflict',
          message: SCHEDULING_CONFLICT_MESSAGE,
        });
        return;
      }

      showOkModal({
        type: 'error',
        title: 'Unsuccessful',
        message:
          apiMessage ||
          "You Don't Have Enough Coins To Purchase The Service. Please Add Funds To Your Wallet To Avail The Service",
      });
    }
  };

  const onBook = () => {
    const firstNameError = validateFirstName(formData.first_name);
    const lastNameError = validateLastName(formData.last_name);
    const phoneError = validatePhone(formData);

    setFieldErrors({
      first_name: firstNameError,
      last_name: lastNameError,
      phone: phoneError,
    });

    if (firstNameError || lastNameError || phoneError) {
      return;
    }

    // Email validation
    if (!formData.email?.trim()) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Email address is required.',
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    // Date and slot validation
    if (!selectedDate || !selectedSlot) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Please select date and time slot.',
      });
      return;
    }

    if (isSlotPassed(selectedSlot.start, selectedDate)) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'This time slot has already passed. Please select another slot.',
      });
      return;
    }

    const appointmentDate = selectedDate.toISOString().split('T')[0];
    const conflictingBooking = findOverlappingBooking(
      existingBookingsForDate,
      appointmentDate,
      selectedSlot.start,
      selectedSlot.end,
    );
    if (conflictingBooking) {
      showOkModal({
        type: 'error',
        title: 'Scheduling Conflict',
        message: SCHEDULING_CONFLICT_MESSAGE,
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
      user,
      dates,
      availableSlots,
      selectedDate,
      selectedSlot,
      isLoadingSlots,
      isRefreshing,
      isBooking,
      type,
      fieldErrors,
    },
    functions: {
      updateFormData,
      onCountryChange,
      onDateSelect,
      onSlotSelect,
      onSlotPress,
      onBook,
      onRefresh,
      formatTime,
      isSlotPassed,
      isSlotConflictingWithUserBooking,
    },
  };
};

export default useAppointmentBookingController;
