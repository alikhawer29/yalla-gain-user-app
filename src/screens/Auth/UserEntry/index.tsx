import { StyleSheet, View } from "react-native";
import images from "../../../assets/images";
import AuthWrapper from "../../../components/AuthWrapper";
import Button from "../../../components/Button";
import Checkbox from "../../../components/Checkbox";
import Icon from "../../../components/Icon";
import Input from "../../../components/Input";
import Row from "../../../components/Row";
import Tabs from "../../../components/Tabs";
import Text from "../../../components/Text";
import Upload from "../../../components/Upload";
import colors from "../../../utils/colors";
import { TABS } from "../../../utils/data";
import { heightPixel } from "../../../utils/helper";
import { navigate } from "../../../utils/navigation";
import { NAVIGATORS, ROUTES } from "../../../utils/routes";
import useAddEntryController from "./useAddEntryController";
import { Formik } from "formik";

const UserEntry = () => {

    const { schema, values: { selected, remember, initial }, functions: { toggleRemember, setSelected, onSubmit } } = useAddEntryController()

    const renderForm = () => {
        if (selected === "login") {
            return (
                <Formik
                    initialValues={initial}
                    validationSchema={schema}
                    onSubmit={onSubmit}
                >
                    {({ handleSubmit, handleChange, handleBlur, values: data, errors }) => (
                        <>
                            <Input label="Email Address" placeholder="Enter Email Address" type="email" required value={data?.email} onChangeText={handleChange("email")} error={errors?.email} />
                            <Input label="Password" placeholder="Enter Password" type="password" required value={data?.email} onChangeText={handleChange("password")} error={errors?.password} />
                            <Row justify="space-between" style={styles.row_space_between}>
                                <Row align="center" gap={7}>
                                    <Checkbox checked={remember} onPress={toggleRemember} />
                                    <Text>Remember Me</Text>
                                </Row>
                                <Text underline onPress={() => navigate(ROUTES.AUTH_TYPE)}>
                                    Forgot Password?
                                </Text>
                            </Row>
                            <Button
                                text={TABS.find((item) => item.value === selected)?.label ?? ""}
                                style={styles.submit_button}
                                onPress={() => navigate(NAVIGATORS.DRAWER)}
                            />
                        </>
                    )}
                </Formik>
            );
        }

        return (
            <>
                <Input label="First Name" placeholder="Enter First Name" required />
                <Input label="Last Name" placeholder="Enter Last Name" required />
                <Input label="Date of Birth" placeholder="mm/dd/yyyy" type="date" required />
                <Input label="Mobile Number" placeholder="Enter Your Phone Number" type="phone" required />
                <Input label="Email Address" placeholder="Enter Email Address" type="email" required />
                <Input label="Password" placeholder="Enter Password" type="password" required />
                <Input label="Confirm Password" placeholder="Confirm Password" type="password" required />
                <Upload text="Upload Profile Picture" style={styles.upload_margin} />
            </>
        );
    };

    return (
        <AuthWrapper>
            <View style={styles.tab_wrapper}>
                <Tabs tabs={TABS} selected={selected} setSelected={setSelected} type="basic" />
            </View>

            {renderForm()}

            {selected === "login" && (
                <View style={styles.social_container}>
                    <Text weight="semibold">Or</Text>
                    <Row justify="center" gap={15}>
                        <Icon rounded less_padding border={colors.white} size={70} source={images.apple} />
                        <Icon rounded less_padding border={colors.white} size={70} source={images.google} />
                        <Icon rounded less_padding border={colors.white} size={70} source={images.facebook} />
                    </Row>
                </View>
            )}

            {selected === "login" ? (
                <Text position="center" size={16} weight="semibold" style={styles.bottom_text}>
                    Not a User?{" "}
                    <Text underline color={colors.primary} size={16} weight="semibold" onPress={() => setSelected("register")}>
                        Register
                    </Text>{" "}
                    Now
                </Text>
            ) : (
                <Text position="center" size={16} weight="semibold" style={styles.bottom_text_alt}>
                    Already a User?{" "}
                    <Text underline color={colors.primary} size={16} weight="semibold" onPress={() => setSelected("login")}>
                        Login
                    </Text>{" "}
                    Now
                </Text>
            )}
        </AuthWrapper>
    );
};

const styles = StyleSheet.create({
    tab_wrapper: {
        marginBottom: heightPixel(20),
    },
    row_space_between: {
        marginTop: heightPixel(15),
    },
    upload_margin: {
        marginTop: heightPixel(15),
    },
    submit_button: {
        marginTop: heightPixel(30),
    },
    social_container: {
        alignItems: "center",
        gap: heightPixel(30),
        marginTop: heightPixel(30),
    },
    bottom_text: {
        marginVertical: heightPixel(50),
    },
    bottom_text_alt: {
        marginVertical: heightPixel(100),
    },
});

export default UserEntry;
