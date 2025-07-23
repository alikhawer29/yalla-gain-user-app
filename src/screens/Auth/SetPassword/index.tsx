import { useCallback } from "react"
import AuthWrapper from "../../../components/AuthWrapper"
import Button from "../../../components/Button"
import Input from "../../../components/Input"
import Text from "../../../components/Text"
import { navigateAndSimpleReset } from "../../../utils/navigation"
import { ROUTES } from "../../../utils/routes"
import styles from "../styles"

const SetPassword = () => {

    const onPress = useCallback(() => {
        navigateAndSimpleReset(ROUTES.USER_ENTRY)
    }, [])

    return (
        <AuthWrapper title='Forgot Password' subtitle='Enter New Password'>
            <Input
                label="New Password"
                placeholder="Enter New Password"
                type="password"
            />
            <Input
                label="Confirm Password"
                placeholder="Set Confirm Password"
                type="password"
            />
            <Button text={"Update"} style={styles.button} onPress={onPress} />
            <Text position="center" underline size={16} weight="semibold" style={styles.helper_text} onPress={onPress}>Back To Login</Text>
        </AuthWrapper>
    )
}

export default SetPassword