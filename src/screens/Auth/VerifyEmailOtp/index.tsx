import { Formik } from 'formik';
import { StyleSheet } from 'react-native';
import AuthWrapper from '../../../components/AuthWrapper';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Row from '../../../components/Row';
import Text from '../../../components/Text';
import colors from '../../../utils/colors';
import { formatTimer } from '../../../utils/helper';
import styles from '../styles';
import useVerifyEmailOtpController from './useVerifyEmailOtpController';

const VerifyEmailOtp = () => {
  const {
    schema,
    refs: { formik_ref },
    values: { initial, email, timer, isVerifyLoading, isResendLoading },
    functions: { onPressBackToLogin, onSubmit, onResend },
  } = useVerifyEmailOtpController();

  return (
    <AuthWrapper
      title="Verify your email"
      subtitle="Enter the verification code we sent to your email address.">
      {!!email && (
        <Text size={14} style={localStyles.email_hint} position="center">
          {email}
        </Text>
      )}
      <Formik
        innerRef={formik_ref}
        initialValues={initial}
        validationSchema={schema}
        onSubmit={onSubmit}>
        {({ values: data, handleSubmit, handleChange, errors, touched }) => (
          <>
            <Input
              type="number"
              label="Verification code"
              placeholder="Enter OTP"
              required
              value={data?.otp}
              onChangeText={handleChange('otp')}
              error={touched?.otp ? errors?.otp : ''}
              maxLength={8}
            />
            <Row justify="space-between">
              <Text>{formatTimer(timer)}</Text>
              <Text
                underline
                onPress={onResend}
                color={timer > 0 ? colors.icon_gray : colors.white}>
                {isResendLoading ? 'Sending…' : 'Resend OTP'}
              </Text>
            </Row>
            <Button
              text="Verify"
              style={styles.button}
              onPress={handleSubmit}
              loading={isVerifyLoading}
            />
          </>
        )}
      </Formik>
      <Text
        position="center"
        underline
        size={16}
        weight="semibold"
        style={styles.helper_text}
        onPress={onPressBackToLogin}>
        Back to login
      </Text>
    </AuthWrapper>
  );
};

const localStyles = StyleSheet.create({
  email_hint: { marginBottom: 16, opacity: 0.9 },
});

export default VerifyEmailOtp;
