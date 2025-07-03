import AuthWrapper from "../../../components/AuthWrapper"
import Input from "../../../components/Input"

const SetPassword = () => {
    return (
        <AuthWrapper title='Forgot Password' subtitle='Enter New Password'>
            <Input
                label="New Password"
                placeholder="Enter New Password"
                type="password"
            />
            <Input
                label="Confirm Password"
                placeholder="Enter Confirm Password"
                type="password"
            />
        </AuthWrapper>
    )
}

export default SetPassword