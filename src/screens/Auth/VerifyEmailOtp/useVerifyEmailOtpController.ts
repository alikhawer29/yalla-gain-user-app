import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { AuthStackParamList } from '../../../interfaces';
import { useResendOtpMutation, useVerifyOtpMutation } from '../../../redux/Apis/Auth';
import { navigateAndSimpleReset } from '../../../utils/navigation';
import { ROUTES } from '../../../utils/routes';
import { VERIFY_EMAIL_OTP_SCHEMA } from '../../../utils/validators';

type VerifyEmailOtpRouteProp = RouteProp<AuthStackParamList, 'VerifyEmailOtp'>;

const RESEND_TIMER_SEC = 59;

const useVerifyEmailOtpController = () => {
  const formik_ref = useRef(null);
  const { params } = useRoute<VerifyEmailOtpRouteProp>();
  const email = params?.email ?? '';

  const [seconds, setSeconds] = useState(RESEND_TIMER_SEC);

  const [verifyOtp, { isLoading: isVerifyLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendLoading }] = useResendOtpMutation();

  const initial = {
    otp: '',
  };

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(prev => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const onSubmit = useCallback(
    (values: { otp: string }) => {
      verifyOtp({
        email,
        otp: values.otp.trim(),
        device_type: Platform.OS === 'ios' ? 'ios' : 'android',
        device_token: '',
      });
    },
    [email, verifyOtp],
  );

  const onResend = useCallback(() => {
    if (seconds <= 0 && email) {
      resendOtp({ email })
        .unwrap()
        .then(() => {
          setSeconds(RESEND_TIMER_SEC);
        })
        .catch(() => {});
    }
  }, [seconds, email, resendOtp]);

  const onPressBackToLogin = useCallback(() => {
    navigateAndSimpleReset(ROUTES.USER_ENTRY);
  }, []);

  return {
    refs: {
      formik_ref,
    },
    schema: VERIFY_EMAIL_OTP_SCHEMA,
    values: {
      initial,
      email,
      timer: seconds,
      isVerifyLoading,
      isResendLoading,
    },
    functions: {
      onSubmit,
      onPressBackToLogin,
      onResend,
    },
  };
};

export default useVerifyEmailOtpController;
