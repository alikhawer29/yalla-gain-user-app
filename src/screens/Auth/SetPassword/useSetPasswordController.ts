import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";
import { AuthStackParamList } from "../../../interfaces";
import { useSetPasswordMutation } from "../../../redux/Apis/Auth";
import { navigateAndSimpleReset } from "../../../utils/navigation";
import { ROUTES } from "../../../utils/routes";
import { SET_PASSWORD_SCHEMA } from "../../../utils/validators";
import { useModal } from "../../../contexts/ModalContext";

type SetPasswordRouteProp = RouteProp<AuthStackParamList, 'SetPassword'>

const initial = {
    password: "",
    password_confirmation: "",
}

const useSetPasswordController = () => {

    const formik_ref = useRef(null)
    const { params } = useRoute<SetPasswordRouteProp>()

    const { showOkModal } = useModal()

    const [submit, { isSuccess, isLoading }] = useSetPasswordMutation()

    useEffect(() => {
        if (isSuccess) {
            showOkModal({
                type: "success",
                title: "Successfully",
                message: "Password has been updated successfully."
            }, () => navigateAndSimpleReset(ROUTES.USER_ENTRY))
        }
    }, [isSuccess])

    const onSubmit = useCallback((data: any) => {
        submit({ ...data, ...params })
    }, [])

    const onPressBackToLogin = useCallback(() => {
        navigateAndSimpleReset(ROUTES.USER_ENTRY)
    }, [])

    return {
        refs: {
            formik_ref
        },
        schema: SET_PASSWORD_SCHEMA,
        values: {
            initial,
            isLoading,
        },
        functions: {
            onSubmit,
            onPressBackToLogin
        }
    }

}

export default useSetPasswordController