import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import ConsultantsList from '../../screens/ConsultantsList';
import ConsultantProfile from '../../screens/ConsultantProfile';
import ServiceDetails from '../../screens/ServiceDetails';
import AppointmentBooking from '../../screens/AppointmentBooking';
import MyBookings from '../../screens/MyBookings';
import BookingDetails from '../../screens/BookingDetails';
import Reviews from '../../screens/Reviews';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const ConsultationStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.CONSULTANTS_LIST} component={ConsultantsList} />
            <Stack.Screen name={ROUTES.CONSULTANT_PROFILE} component={ConsultantProfile} />
            <Stack.Screen name={ROUTES.SERVICE_DETAILS} component={ServiceDetails} />
            <Stack.Screen name={ROUTES.APPOINTMENT_BOOKING} component={AppointmentBooking} />
            <Stack.Screen name={ROUTES.MY_BOOKINGS} component={MyBookings} />
            <Stack.Screen name={ROUTES.BOOKING_DETAILS} component={BookingDetails} />
            <Stack.Screen name={ROUTES.REVIEWS} component={Reviews} />
        </Stack.Navigator>
    );
}

export default ConsultationStackNavigator;

