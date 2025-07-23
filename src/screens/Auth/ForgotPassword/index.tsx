import { RouteProp, useRoute } from "@react-navigation/native"
import { useCallback } from "react"
import AuthWrapper from "../../../components/AuthWrapper"
import Button from "../../../components/Button"
import Input from "../../../components/Input"
import Text from "../../../components/Text"
import { AuthStackParamList } from "../../../interfaces"
import { navigate, navigateAndSimpleReset } from "../../../utils/navigation"
import { ROUTES } from "../../../utils/routes"
import styles from "../styles"

type ForgotPasswordRouteProp = RouteProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPassword = () => {

    const { params } = useRoute<ForgotPasswordRouteProp>()

    const onPress = useCallback(() => {
        navigateAndSimpleReset(ROUTES.USER_ENTRY)
    }, [])

    return (
        <AuthWrapper
            title='Forgot Password'
            subtitle='Enter an email address to receive a verification code.'
        >
            <Input
                label={params?.type === "email" ? "Email Address" : "Mobile Number"}
                placeholder={params?.type === "email" ? "Enter Email Address" : "Enter Phone Number"}
                type={params?.type}
                required
            />
            <Button text={"Continue"} style={styles.button} onPress={() => navigate(ROUTES.VERIFY_CODE)} />
            <Text position="center" underline size={16} weight="semibold" style={styles.helper_text} onPress={onPress}>Back To Login</Text>
        </AuthWrapper>
    )
}

export default ForgotPassword