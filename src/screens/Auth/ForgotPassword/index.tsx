import AuthWrapper from "../../../components/AuthWrapper"
import Input from "../../../components/Input"

const ForgotPassword = () => {
    return (
        <AuthWrapper title='Forgot Password' subtitle='Enter an email address to receive a verification code.'>
            <Input
                label="Email Address"
                placeholder="Enter Email Address"
                type="email"
            />
        </AuthWrapper>
    )
}

export default ForgotPassword