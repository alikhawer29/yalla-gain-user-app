import { Formik } from "formik"
import { useMemo } from "react"
import { View } from "react-native"
import Button from "../../components/Button"
import Icon from "../../components/Icon"
import Input from "../../components/Input"
import Wrapper from "../../components/Wrapper"
import styles from "./styles"
import useEditProfileController from "./useEditProfileController"
import colors from "../../utils/colors"
import images from "../../assets/images"
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper"

const EditProfile = () => {
    const maxDobDate = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() - 1)
        return d
    }, [])

    const {
        schema,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading,
            user_image,
            image
        },
        functions: {
            onSubmit,
            onPressUpload
        }
    } = useEditProfileController()

    return (
        <Wrapper>
            <KeyboardAvoidingWrapper>
                <Formik
                    innerRef={formik_ref}
                    initialValues={initial}
                    validationSchema={schema}
                    onSubmit={onSubmit}
                    enableReinitialize
                >
                    {({ values: data, handleChange, handleSubmit, touched, errors, setFieldValue }) => (
                        <>
                            <View style={styles.icon_container}>
                                <View>
                                    <Icon key={image?.previewUri ?? image?.uri ?? user_image ?? "profile"} source={image ? { uri: image?.previewUri ?? image?.uri } : { uri: user_image }} size={100} rounded no_padding border={colors.white} resize="cover" />
                                    <View style={styles.upload_container}>
                                        <Icon color={colors.primary} source={images.camera} rounded size={29} less_padding border={colors.white} onPress={onPressUpload} />
                                    </View>
                                </View>
                            </View>
                            <Input label="First Name" placeholder="Enter First Name" required value={data?.first_name} onChangeText={handleChange("first_name")} error={touched?.first_name ? errors?.first_name : null} />
                            <Input label="Last Name" placeholder="Enter Last Name" required value={data?.last_name} onChangeText={handleChange("last_name")} error={touched?.last_name ? errors?.last_name : null} />
                            <Input
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
                                    const code = `${e?.callingCode?.[0] ?? ""}`
                                    setFieldValue("dialing_code", code ? (code.startsWith("+") ? code : `+${code}`) : "")
                                }}
                            />
                            <Input label="Date of Birth" placeholder="YYYY/MM/DD" type="date" value={data?.dob} onChangeText={handleChange("dob")} error={touched?.dob ? errors?.dob : null} maximumDate={maxDobDate} />
                            <Button text="Update" onPress={handleSubmit} loading={isLoading} style={styles.button} />
                        </>
                    )}
                </Formik>
            </KeyboardAvoidingWrapper>
        </Wrapper>
    )
}

export default EditProfile