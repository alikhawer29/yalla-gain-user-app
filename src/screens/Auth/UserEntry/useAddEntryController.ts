import { useCallback, useEffect, useRef, useState } from "react";
import { useModal } from "../../../contexts/ModalContext";
import usePicker from "../../../hooks/usePicker";
import useToggle from "../../../hooks/useToggle";
import { useLoginMutation, useSignupMutation } from "../../../redux/Apis/Auth";
import { TABS } from "../../../utils/data";
import { formHandler } from "../../../utils/helper";
import { LOGIN_SCHEMA, SIGNUP_SCHEMA } from "../../../utils/validators";

const initial = {
    login: {
        email: "",
        password: ""
    },
    register: {
        first_name: "",
        last_name: "",
        dob: "",
        email: "",
        password: "",
        password_confirmation: "",
        dialing_code: "+971",
        country_code: "AE",
        phone: "",
        photo: null as any,
    }
}

const useAddEntryController = () => {

    const formik_ref = useRef(null)
    const { showOkModal } = useModal()
    const { image: profileImage, openGallery } = usePicker()

    const [login, { isLoading: isLoginLoading }] = useLoginMutation()
    const [signup, { isSuccess: isSignupSuccess, isLoading: isSignupLoading }] = useSignupMutation()

    const [selected, setSelected] = useState<string>(TABS[0].value);
    const [toggleRemember, remember] = useToggle();

    useEffect(() => {
        if (profileImage && formik_ref.current) {
            (formik_ref.current as any).setFieldValue("photo", profileImage);
        }
    }, [profileImage]);

    useEffect(() => {
        if (isSignupSuccess) {
            showOkModal({
                type: "success",
                title: "Success",
                message: "Account created successfully. Let’s get started!"
            }, () => {
                formik_ref.current?.resetForm();
                setSelected(TABS[0].value)
            }, () => {
                formik_ref.current?.resetForm();
                setSelected(TABS[0].value)
            })

        }
    }, [isSignupSuccess])

    const onSubmit = useCallback((data: any) => {

        const payload = formHandler(data)

        if (selected === "login") {
            login(data)
        } else {
            signup(payload)
        }

    }, [selected])

    return {
        refs: {
            formik_ref
        },
        schema: selected === "login" ? LOGIN_SCHEMA : SIGNUP_SCHEMA,
        values: {
            initial: selected === "login" ? initial.login : initial.register,
            selected,
            remember,
            isLoading: isSignupLoading || isLoginLoading
        },
        functions: {
            toggleRemember,
            setSelected,
            onSubmit,
            onPressUploadProfile: openGallery
        }
    }

}

export default useAddEntryController