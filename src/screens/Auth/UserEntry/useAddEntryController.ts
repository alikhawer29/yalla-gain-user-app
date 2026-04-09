import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import usePicker from "../../../hooks/usePicker";
import useToggle from "../../../hooks/useToggle";
import { useLoginMutation, useSignupMutation } from "../../../redux/Apis/Auth";
import { TABS } from "../../../utils/data";
import { formHandler, withDialingCodePlus } from "../../../utils/helper";
import { navigate } from "../../../utils/navigation";
import { ROUTES } from "../../../utils/routes";
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
    const { image: profileImage, openGallery } = usePicker()

    const [login, { isLoading: isLoginLoading }] = useLoginMutation()
    const [signup, {
        isSuccess: isSignupSuccess,
        isLoading: isSignupLoading,
        data: signupData,
        reset: resetSignup,
    }] = useSignupMutation()

    const [selected, setSelected] = useState<string>(TABS[0].value);
    const [toggleRemember, remember] = useToggle();

    useEffect(() => {
        if (profileImage && formik_ref.current) {
            (formik_ref.current as any).setFieldValue("photo", profileImage);
        }
    }, [profileImage]);

    useEffect(() => {
        if (isSignupSuccess && signupData) {
            const res = signupData as {
                message?: string;
                data?: { user?: { email?: string } };
            };
            const userEmail = res?.data?.user?.email;
            const msg =
                res?.message ??
                "Registration successful. Please verify the OTP sent to your email.";
            Toast.show({ text1: "Success!", text2: msg, type: "success" });
            if (userEmail) {
                navigate(ROUTES.VERIFY_EMAIL_OTP, { email: userEmail });
            }
            (formik_ref.current as any)?.resetForm();
            setSelected(TABS[0].value);
            resetSignup();
        }
    }, [isSignupSuccess, signupData, resetSignup])

    const onSubmit = useCallback((data: any) => {

        if (selected === "login") {
            login(data)
                .unwrap()
                .catch((err: any) => {
                    const body = err?.data;
                    if (body?.can_resend_otp && body?.email) {
                        navigate(ROUTES.VERIFY_EMAIL_OTP, {
                            email: body.email,
                        });
                    }
                });
        } else {
            const payload = formHandler({
                ...data,
                dialing_code: withDialingCodePlus(data?.dialing_code),
            });
            signup(payload)
        }

    }, [selected, login, signup])

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
