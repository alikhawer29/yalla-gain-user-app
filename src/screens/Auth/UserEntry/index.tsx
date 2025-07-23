import { useState } from "react"
import { View } from "react-native"
import images from "../../../assets/images"
import AuthWrapper from "../../../components/AuthWrapper"
import Button from "../../../components/Button"
import Checkbox from "../../../components/Checkbox"
import Icon from "../../../components/Icon"
import Input from "../../../components/Input"
import Row from "../../../components/Row"
import Tabs from "../../../components/Tabs"
import Text from "../../../components/Text"
import Upload from "../../../components/Upload"
import useToggle from "../../../hooks/useToggle"
import colors from "../../../utils/colors"
import { heightPixel } from "../../../utils/helper"
import { navigate } from "../../../utils/navigation"
import { NAVIGATORS, ROUTES } from "../../../utils/routes"

const TABS = [
    {
        label: "Login",
        value: "login"
    },
    {
        label: "Register",
        value: "register"
    },
]


const UserEntry = () => {

    const [selected, setSelected] = useState<string>(TABS[0].value)
    const [toggleRemember, remember] = useToggle()

    const renderForm = () => {

        if (selected === "login") {
            return (
                <>
                    <Input
                        label="Email Address"
                        placeholder="Enter Email Address"
                        type="email"
                        required
                    />
                    <Input
                        label="Password"
                        placeholder="Enter Password"
                        type="password"
                        required
                    />
                    <Row justify="space-between" style={{ marginTop: heightPixel(15) }}>
                        <Row align="center" gap={7}>
                            <Checkbox checked={remember} onPress={toggleRemember} />
                            <Text>Remember Me</Text>
                        </Row>
                        <Text underline onPress={() => navigate(ROUTES.AUTH_TYPE)}>Forgot Password?</Text>
                    </Row>
                </>
            )
        }

        return (
            <>
                <Input
                    label="First Name"
                    placeholder="Enter First Name"
                    required
                />
                <Input
                    label="Last Name"
                    placeholder="Enter Last Name"
                    required
                />
                <Input
                    label="Date of Birth"
                    placeholder="mm/dd/yyyy"
                    type="date"
                    onChangeText={() => { }}
                    required
                />
                <Input
                    label="Mobile Number"
                    placeholder="Enter Your Phone Number"
                    type="phone"
                    required
                />
                <Input
                    label="Email Address"
                    placeholder="Enter Email Address"
                    type="email"
                    required
                />
                <Input
                    label="Password"
                    placeholder="Enter Password"
                    type="password"
                    required
                />
                <Input
                    label="Confirm Password"
                    placeholder="Confirm Password"
                    type="password"
                    required
                />
                <Upload text="Upload Profile Picture" style={{ marginTop: heightPixel(15) }} />
            </>
        )

    }

    return (
        <AuthWrapper>
            <View style={{ marginBottom: heightPixel(20) }}>
                <Tabs tabs={TABS} selected={selected} setSelected={setSelected} type="basic" />
            </View>
            {renderForm()}
            <Button
                text={TABS.find(item => item?.value === selected)?.label ?? ""}
                style={{ marginTop: heightPixel(30) }}
                onPress={() => navigate(NAVIGATORS.DRAWER)}
            />
            {
                selected === "login" &&
                <View style={{ alignItems: "center", gap: heightPixel(30), marginTop: heightPixel(30) }}>
                    <Text weight="semibold">Or</Text>
                    <Row justify="center" gap={15}>
                        <Icon rounded less_padding border={colors.white} size={70} source={images.apple} />
                        <Icon rounded less_padding border={colors.white} size={70} source={images.google} />
                        <Icon rounded less_padding border={colors.white} size={70} source={images.facebook} />
                    </Row>
                </View>
            }
            {
                selected === "login" ?
                    <Text position="center" size={16} weight="semibold" style={{ marginVertical: heightPixel(50) }}>Not a User? <Text underline color={colors.primary} size={16} weight="semibold" onPress={() => setSelected("register")}>Register</Text> Now</Text>
                    :
                    <Text position="center" size={16} weight="semibold" style={{ marginVertical: heightPixel(100) }}>Already a User? <Text underline color={colors.primary} size={16} weight="semibold" onPress={() => setSelected("login")}>Login</Text> Now</Text>
            }
        </AuthWrapper>
    )
}

export default UserEntry