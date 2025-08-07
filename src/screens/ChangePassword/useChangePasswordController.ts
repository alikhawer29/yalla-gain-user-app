import { useCallback, useEffect, useRef } from "react";
import { useModal } from "../../contexts/ModalContext";
import { useChangePasswordMutation } from "../../redux/Apis/User";
import { goBack } from "../../utils/navigation";
import { CHANGE_PASSWORD_SCHEMA } from "../../utils/validators";

const initial = {
    old_password: "",
    password: "",
    password_confirmation: "",
}

const useChangePasswordController = () => {

    const formik_ref = useRef(null)

    const { showOkModal } = useModal()

    const [submit, { isSuccess, isLoading }] = useChangePasswordMutation()

    useEffect(() => {
        if (isSuccess) {
            showOkModal({
                type: "success",
                title: "Successfully",
                message: "Password has been updated successfully."
            }, () => goBack())
        }
    }, [isSuccess])

    const onSubmit = useCallback((data: any) => {
        submit(data)
    }, [])

    return {
        refs: {
            formik_ref
        },
        schema: CHANGE_PASSWORD_SCHEMA,
        values: {
            initial,
            isLoading,
        },
        functions: {
            onSubmit,
        }
    }

}

export default useChangePasswordController