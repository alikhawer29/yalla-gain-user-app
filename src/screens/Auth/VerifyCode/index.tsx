import { Formik } from "formik"
import AuthWrapper from "../../../components/AuthWrapper"
import Button from "../../../components/Button"
import Input from "../../../components/Input"
import Row from "../../../components/Row"
import Text from "../../../components/Text"
import colors from "../../../utils/colors"
import { formatTimer } from "../../../utils/helper"
import styles from "../styles"
import useVerifyCodeController from "./useVerifyCodeController"

const VerifyCode = () => {

    const {
        schema,
        refs: {
            formik_ref
        },
        values: {
            initial,
            timer,
            isLoading,
            isForgotPasswordLoading
        },
        functions: {
            onPressBackToLogin,
            onSubmit,
            onResend
        }
    } = useVerifyCodeController()

    return (
        <AuthWrapper
            title='Forgot Password'
            subtitle='An email has been sent to you with a verification code. Please enter it here.'
        >
            <Formik
                innerRef={formik_ref}
                initialValues={initial}
                validationSchema={schema}
                onSubmit={onSubmit}
            >
                {({ values: data, handleSubmit, handleChange, errors }) => (
                    <>
                        <Input
                            type="number"
                            label="Verification Code"
                            placeholder="Enter Verification Code"
                            required
                            value={data?.token}
                            onChangeText={handleChange("token")}
                            error={errors?.token}
                            maxLength={4}
                        />
                        <Row justify="space-between">
                            <Text>{formatTimer(timer)}</Text>
                            <Text underline onPress={onResend} color={timer > 0 ? colors.icon_gray : colors.white}>{isForgotPasswordLoading ? "Resending Code ..." : "Resend Code"}</Text>
                        </Row>
                        <Button text={"Continue"} style={styles.button} onPress={handleSubmit} loading={isLoading} />
                    </>
                )}
            </Formik>
            <Text position="center" underline size={16} weight="semibold" style={styles.helper_text} onPress={onPressBackToLogin}>Back To Login</Text>
        </AuthWrapper>
    )
}

export default VerifyCode