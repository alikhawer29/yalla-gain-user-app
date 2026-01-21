import { useCallback, useState } from "react"
import { FlatList, View } from "react-native"
import AuthWrapper from "../../../components/AuthWrapper"
import Button from "../../../components/Button"
import AuthSelectionCard from "../../../components/Cards/AuthSelectionCard"
import Text from "../../../components/Text"
import { InputType } from "../../../interfaces"
import { AUTH_TYPES } from "../../../utils/data"
import { heightPixel } from "../../../utils/helper"
import { navigate, navigateAndSimpleReset } from "../../../utils/navigation"
import { ROUTES } from "../../../utils/routes"
import styles from "../styles"

const AuthType = () => {

    const [selected, setSelected] = useState<InputType>(AUTH_TYPES[0].value as InputType)

    const onPress = useCallback(() => {
        navigateAndSimpleReset(ROUTES.USER_ENTRY)
    }, [])

    return (
        <AuthWrapper
            title='Forgot Password'
            subtitle='Select a Method to Receive Verification Code'
        >
            <FlatList
                data={AUTH_TYPES}
                renderItem={({ item }) => <AuthSelectionCard {...item} selected={selected === item.value} onPress={() => setSelected(item.value as InputType)} />}
                ItemSeparatorComponent={() => <View style={{ height: heightPixel(10) }} />}
            />
            <Button text={"Continue"} style={styles.button} onPress={() => navigate(ROUTES.FORGOT_PASSWORD, { type: selected })} />
            <Text position="center" underline size={16} weight="semibold" style={styles.helper_text} onPress={onPress}>Back To Login</Text>
        </AuthWrapper>
    )
}

export default AuthType