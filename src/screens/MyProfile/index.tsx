import { View } from "react-native"
import Button from "../../components/Button"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { USER } from "../../utils/data"
import styles from "./styles"

const MyProfile = () => {
    return (
        <Wrapper>
            <Row style={styles.item_container}>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>User Unique Code</Text>
                    <Text weight="bold">{USER.unique_code}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>First Name</Text>
                    <Text weight="bold">{USER.first_name}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Last Name</Text>
                    <Text weight="bold">{USER.last_name}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Phone Number</Text>
                    <Text weight="bold">{USER.phone}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Email Address</Text>
                    <Text weight="bold">{USER.email}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>DOB</Text>
                    <Text weight="bold">{USER.dob}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Language</Text>
                    <Text weight="bold">{USER.language}</Text>
                </View>
            </Row>
            <Button text="Edit Profile" style={[styles.item, styles.button]} />
            <Button text="Change Password" type="outlined" style={styles.item} />
        </Wrapper>
    )
}

export default MyProfile