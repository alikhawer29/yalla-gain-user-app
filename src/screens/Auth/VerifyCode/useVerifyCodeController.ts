import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthStackParamList } from "../../../interfaces";
import { useForgotPasswordMutation, useVerifyMutation } from "../../../redux/Apis/Auth";
import { navigate, navigateAndSimpleReset } from "../../../utils/navigation";
import { ROUTES } from "../../../utils/routes";
import { VERIFY_CODE_SCHEMA } from "../../../utils/validators";

type VerifyCodeRouteProp = RouteProp<AuthStackParamList, 'VerifyCode'>;

const TIMER = 59

const useVerifyCodeController = () => {

    const formik_ref = useRef(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { params } = useRoute<VerifyCodeRouteProp>()
    const [seconds, setSeconds] = useState<number>(TIMER);

    const [submit, { data, isSuccess, isLoading }] = useVerifyMutation()
    const [forgotPassword, { isSuccess: isForgotPasswordSuccess, isLoading: isForgotPasswordLoading }] = useForgotPasswordMutation()

    const initial = {
        token: "",
    }

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current as NodeJS.Timeout);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isSuccess) {
            navigate(ROUTES.SET_PASSWORD, { ...data?.data })
        }
    }, [isSuccess])

    useEffect(() => {
        if (isForgotPasswordSuccess) {
            setSeconds(TIMER)
        }
    }, [isForgotPasswordSuccess])

    const onSubmit = useCallback((data: any) => {
        submit({ ...data, ...params })
    }, [])

    const onResend = useCallback(() => {
        if (seconds <= 0) {
            forgotPassword(params)
        }
    }, [seconds])

    const onPressBackToLogin = useCallback(() => {
        navigateAndSimpleReset(ROUTES.USER_ENTRY)
    }, [])

    return {
        refs: {
            formik_ref
        },
        schema: VERIFY_CODE_SCHEMA,
        values: {
            initial,
            isLoading,
            timer: seconds,
            isForgotPasswordLoading
        },
        functions: {
            onSubmit,
            onPressBackToLogin,
            onResend
        }
    }

}

export default useVerifyCodeController