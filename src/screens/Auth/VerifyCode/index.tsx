import { useCallback } from "react"
import AuthWrapper from "../../../components/AuthWrapper"
import Button from "../../../components/Button"
import Input from "../../../components/Input"
import Row from "../../../components/Row"
import Text from "../../../components/Text"
import { navigate, navigateAndSimpleReset } from "../../../utils/navigation"
import { ROUTES } from "../../../utils/routes"
import styles from "../styles"

const VerifyCode = () => {

    const onPress = useCallback(() => {
        navigateAndSimpleReset(ROUTES.USER_ENTRY)
    }, [])

    return (
        <AuthWrapper
            title='Forgot Password'
            subtitle='An email has been sent to you with a verification code. Please enter it here.'
        >
            <Input
                label="Verification Code"
                placeholder="Enter Verification Code"
                type="number"
                required
            />
            <Row justify="space-between">
                <Text>00:50</Text>
                <Text underline>Resend Code</Text>
            </Row>
            <Button text={"Continue"} style={styles.button} onPress={() => navigate(ROUTES.SET_PASSWORD)} />
            <Text position="center" underline size={16} weight="semibold" style={styles.helper_text} onPress={onPress}>Back To Login</Text>
        </AuthWrapper>
    )
}

export default VerifyCode