import { Formik } from "formik"
import AuthWrapper from "../../../components/AuthWrapper"
import Button from "../../../components/Button"
import Input from "../../../components/Input"
import Text from "../../../components/Text"
import styles from "../styles"
import useSetPasswordController from "./useSetPasswordController"

const SetPassword = () => {

    const {
        schema,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading
        },
        functions: {
            onPressBackToLogin,
            onSubmit
        }
    } = useSetPasswordController()

    return (
        <AuthWrapper title='Forgot Password' subtitle='Enter New Password'>
            <Formik
                innerRef={formik_ref}
                initialValues={initial}
                validationSchema={schema}
                onSubmit={onSubmit}
            >
                {({ values: data, handleSubmit, handleChange, errors, touched }) => (
                    <>
                        <Input
                            label="New Password"
                            placeholder="Enter New Password"
                            type="password"
                            required
                            value={data?.password}
                            onChangeText={handleChange("password")}
                            error={touched?.password ? errors?.password : ""}
                        />
                        <Input
                            label="Confirm Password"
                            placeholder="Set Confirm Password"
                            type="password"
                            required
                            value={data?.password_confirmation}
                            onChangeText={handleChange("password_confirmation")}
                            error={touched?.password_confirmation ? errors?.password_confirmation : ""}
                        />
                        <Button text={"Update"} style={styles.button} onPress={handleSubmit} loading={isLoading} />
                    </>
                )}
            </Formik>
            <Text position="center" underline size={16} weight="semibold" style={styles.helper_text} onPress={onPressBackToLogin}>Back To Login</Text>
        </AuthWrapper>
    )
}

export default SetPassword