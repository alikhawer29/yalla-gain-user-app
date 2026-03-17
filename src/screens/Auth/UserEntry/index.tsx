import { Formik } from "formik";
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
import { ROUTES } from "../../../utils/routes";
import useAddEntryController from "./useAddEntryController";

const UserEntry = () => {

    const { schema, refs: { formik_ref }, values: { selected, remember, initial, isLoading }, functions: { toggleRemember, setSelected, onSubmit, onPressUploadProfile } } = useAddEntryController()

    const renderForm = ({ handleChange, values: data, errors, touched, setFieldValue }) => {
        if (selected === "login") {
            return (
                <>
                    <Input key={`${selected}-1`} label="Email Address" placeholder="Enter Email Address" type="email" required value={data?.email} onChangeText={handleChange("email")} error={touched?.email ? errors?.email : ""} />
                    <Input key={`${selected}-2`} label="Password" placeholder="Enter Password" type="password" required value={data?.password} onChangeText={handleChange("password")} error={touched?.password ? errors?.password : ""} />
                    <Row justify="space-between" style={styles.row_space_between}>
                        <Row align="center" gap={7}>
                            <Checkbox checked={remember} onPress={toggleRemember} />
                            <Text>Remember Me</Text>
                        </Row>
                        <Text underline onPress={() => navigate(ROUTES.AUTH_TYPE)}>
                            Forgot Password?
                        </Text>
                    </Row>
                </>
            );
        }

        return (
            <>
                <Input key={`${selected}-1`} label="First Name" placeholder="Enter First Name" required value={data?.first_name} onChangeText={handleChange("first_name")} error={touched?.first_name ? errors?.first_name : ""} />
                <Input key={`${selected}-2`} label="Last Name" placeholder="Enter Last Name" required value={data?.last_name} onChangeText={handleChange("last_name")} error={touched?.last_name ? errors?.last_name : ""} />
                <Input key={`${selected}-3`} label="Date of Birth" placeholder="mm/dd/yyyy" type="date" required value={data?.dob} onChangeText={handleChange("dob")} error={touched?.dob ? errors?.dob : ""} />
                <Input
                    key={`${selected}-4`}
                    label="Mobile Number"
                    placeholder="Enter Your Phone Number"
                    type="phone"
                    required
                    value={data?.phone}
                    onChangeText={handleChange("phone")}
                    error={touched?.phone ? errors?.phone : ""}
                    country={data?.country_code}
                    onChangeCountry={e => {
                        setFieldValue("country_code", e?.cca2)
                        setFieldValue("dialing_code", e?.callingCode?.[0])
                    }}
                />
                <Input key={`${selected}-5`} label="Email Address" placeholder="Enter Email Address" type="email" required value={data?.email} onChangeText={handleChange("email")} error={touched?.email ? errors?.email : ""} />
                <Input key={`${selected}-6`} label="Password" placeholder="Enter Password" type="password" required value={data?.password} onChangeText={handleChange("password")} error={touched?.password ? errors?.password : ""} />
                <Input key={`${selected}-7`} label="Confirm Password" placeholder="Confirm Password" type="password" required value={data?.password_confirmation} onChangeText={handleChange("password_confirmation")} error={touched?.password_confirmation ? errors?.password_confirmation : ""} />
                <Upload text="Upload Profile Image" style={styles.upload_margin} onPress={onPressUploadProfile} image={data?.photo} />
            </>
        );
    };

    return (
        <AuthWrapper>
            <View style={styles.tab_wrapper}>
                <Tabs tabs={TABS} selected={selected} setSelected={setSelected} type="basic" />
            </View>
            <Formik
                innerRef={formik_ref}
                initialValues={initial}
                validationSchema={schema}
                onSubmit={onSubmit}
                enableReinitialize
            >
                {(form) => (
                    <>
                        {
                            renderForm(form)
                        }
                        <Button
                            text={TABS.find((item) => item.value === selected)?.label ?? ""}
                            style={styles.submit_button}
                            loading={isLoading}
                            onPress={form.handleSubmit}
                        />
                    </>
                )}
            </Formik>
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
