import AuthWrapper from "../../../components/AuthWrapper"
import Input from "../../../components/Input"
import Row from "../../../components/Row"
import Text from "../../../components/Text"

const VerifyCode = () => {
    return (
        <AuthWrapper title='Forgot Password' subtitle='An email has been sent to you with a verification code. Please enter it here.'>
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
        </AuthWrapper>
    )
}

export default VerifyCode