import { useRoute } from "@react-navigation/native";
import { useSubscriptionAccess } from "../../hooks/useSubscriptionAccess";
import { useGetServiceDetailsQuery } from "../../redux/Apis/User";
import { navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";

const useServiceDetailsController = () => {
    const route = useRoute();
    const { id, type } = route.params as { id: number; type: "doctor" | "trainer" };
    const { guardAccess } = useSubscriptionAccess();

    const { data, isFetching: isLoading, refetch } = useGetServiceDetailsQuery(id);

    const service = data?.data;
    const consultant = service?.user;
    const category = service?.service_category;

    const onReload = () => {
        refetch();
    };

    const onBookAppointment = () => {
        const feature = type === 'doctor' ? 'doctor_appointments' : 'trainer_appointments';
        guardAccess(feature, () => {
            navigate(ROUTES.APPOINTMENT_BOOKING, {
                serviceId: id,
                type,
                charges: service?.charges,
            });
        });
    };

    return {
        values: {
            service,
            consultant,
            category,
            isLoading,
            type,
        },
        functions: {
            onReload,
            onBookAppointment,
        },
    };
};

export default useServiceDetailsController;

