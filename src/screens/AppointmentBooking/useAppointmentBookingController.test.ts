import { buildAppointmentBookingForm } from './useAppointmentBookingController';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({
    params: { serviceId: 1, type: 'doctor', charges: '0' },
  }),
}));

jest.mock('../../hooks/useSubscriptionAccess', () => ({
  useSubscriptionAccess: () => ({ requireAccess: () => true }),
}));

jest.mock('../../redux/Apis/User', () => ({
  useGetServiceSlotsQuery: () => ({ data: undefined, isFetching: false, refetch: jest.fn() }),
  useBookAppointmentMutation: () => [jest.fn(), { isLoading: false }],
  useGetMyBookingsQuery: () => ({ data: undefined }),
}));

jest.mock('../../contexts/ModalContext', () => ({
  useModal: () => ({ showOkModal: jest.fn(), showYesNoModal: jest.fn() }),
}));

jest.mock('../../utils/navigation', () => ({
  navigate: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  useAppSelector: jest.fn(),
}));

describe('buildAppointmentBookingForm', () => {
  it('prefills phone, dialing code, and country from the logged-in user', () => {
    expect(
      buildAppointmentBookingForm({
        first_name: 'Rehan',
        last_name: 'Khan',
        email: 'rehan@example.com',
        phone: '501234567',
        dialing_code: '971',
        country_code: 'AE',
      }),
    ).toEqual({
      first_name: 'Rehan',
      last_name: 'Khan',
      email: 'rehan@example.com',
      phone: '501234567',
      dialing_code: '+971',
      country_code: 'AE',
    });
  });

  it('keeps a leading plus on dialing code and uses the user country', () => {
    expect(
      buildAppointmentBookingForm({
        first_name: 'Sara',
        last_name: 'Ali',
        email: 'sara@example.com',
        phone: '3001234567',
        dialing_code: '+92',
        country_code: 'PK',
      }),
    ).toEqual({
      first_name: 'Sara',
      last_name: 'Ali',
      email: 'sara@example.com',
      phone: '3001234567',
      dialing_code: '+92',
      country_code: 'PK',
    });
  });

  it('leaves phone empty and falls back to default country when user has no phone', () => {
    expect(
      buildAppointmentBookingForm({
        first_name: 'Rehan',
        last_name: 'Khan',
        email: 'rehan@example.com',
        phone: '  ',
        dialing_code: '',
        country_code: '',
      }),
    ).toEqual({
      first_name: 'Rehan',
      last_name: 'Khan',
      email: 'rehan@example.com',
      phone: '',
      dialing_code: '+971',
      country_code: 'AE',
    });
  });

  it('returns empty form defaults when user is missing', () => {
    expect(buildAppointmentBookingForm(null)).toEqual({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      dialing_code: '+971',
      country_code: 'AE',
    });
  });
});
