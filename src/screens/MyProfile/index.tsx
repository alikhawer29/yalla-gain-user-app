import { View } from "react-native"
import Button from "../../components/Button"
import Icon from "../../components/Icon"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import { useAppSelector } from "../../hooks"
import { selectUser } from "../../redux/Slices/AuthSlice"
import colors from "../../utils/colors"
import { USER } from "../../utils/data"
import { navigate } from "../../utils/navigation"
import styles from "./styles"

const MyProfile = () => {

    const user = useAppSelector(selectUser)

    return (
        <Wrapper>
            <View style={styles.icon_container}>
                <Icon source={USER.image} size={100} />
            </View>
            <Row style={styles.item_container}>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>User's Unique Id</Text>
                    <Text weight="bold">{user?.id}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>First Name</Text>
                    <Text weight="bold">{user?.first_name}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Last Name</Text>
                    <Text weight="bold">{user?.last_name}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Phone Number</Text>
                    <Text weight="bold">({user?.dialing_code}) {user?.phone}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Email Address</Text>
                    <Text weight="bold">{user?.email}</Text>
                </View>
                {
                    user?.dob &&
                    <View style={[styles.item, styles.item_width]}>
                        <Text color={colors.icon_gray}>DOB</Text>
                        <Text weight="bold">{user?.dob}</Text>
                    </View>
                }
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Language</Text>
                    <Text weight="bold" capitalize>{user?.language}</Text>
                </View>
            </Row>
            <Button text="Edit Profile" style={styles.item} />
            <Button text="Change Password" type="outlined" style={styles.item} onPress={() => navigate("ChangePassword")} />
        </Wrapper>
    )
}

export default MyProfile