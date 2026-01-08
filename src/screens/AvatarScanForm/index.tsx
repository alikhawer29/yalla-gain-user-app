import { Formik } from "formik"
import { View, Image } from "react-native"
import Button from "../../components/Button"
import Input from "../../components/Input"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Row from "../../components/Row"
import Touchable from "../../components/Touchable"
import useAvatarScanFormController from "./useAvatarScanFormController"
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"
import styles from "./styles"
import Seperator from "../../components/Seperator"

const AvatarScanForm = () => {

    const {
        schema,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading,
            frontPhoto
        },
        functions: {
            onSubmit
        }
    } = useAvatarScanFormController()

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
                            {frontPhoto && (
                                <Image
                                    source={{ uri: frontPhoto.path?.startsWith('file://') ? frontPhoto.path : `file://${frontPhoto.path}` }}
                                    style={styles.avatarImage}
                                    resizeMode="contain"
                                />
                            )}

                            <Text size={20} weight="semibold" style={styles.basic_information_label}>
                                Basic Information:
                            </Text>
                            <Input
                                label="Age"
                                placeholder="Enter Age"
                                type="number"
                                required
                                value={data?.age?.toString()}
                                onChangeText={handleChange("age")}
                                error={touched?.age ? errors?.age : ""}
                            />



                            <View style={styles.field_container}>
                                <Text size={14} weight="semibold" style={styles.label}>
                                    Gender <Text color={colors.danger}>*</Text>
                                </Text>
                                <Row style={styles.radio_container}>
                                    <Touchable
                                        style={styles.radio_option}
                                        onPress={() => setFieldValue("gender", "male")}
                                    >
                                        <View style={[
                                            styles.radio_circle,
                                            data?.gender === "male" && styles.radio_circle_selected
                                        ]}>
                                            {data?.gender === "male" && <View style={styles.radio_inner} />}
                                        </View>
                                        <Text size={16} style={styles.radio_label}>Male</Text>
                                    </Touchable>
                                    <Touchable
                                        style={styles.radio_option}
                                        onPress={() => setFieldValue("gender", "female")}
                                    >
                                        <View style={[
                                            styles.radio_circle,
                                            data?.gender === "female" && styles.radio_circle_selected
                                        ]}>
                                            {data?.gender === "female" && <View style={styles.radio_inner} />}
                                        </View>
                                        <Text size={16} style={styles.radio_label}>Female</Text>
                                    </Touchable>
                                </Row>
                                {touched?.gender && errors?.gender && (
                                    <Text color={colors.danger} size={12} style={styles.error_text}>
                                        {errors.gender}
                                    </Text>
                                )}
                            </View>

                            <Input
                                label="Weight (grams)"
                                placeholder="Enter Weight in grams"
                                type="number"
                                required
                                value={data?.weight?.toString()}
                                onChangeText={handleChange("weight")}
                                error={touched?.weight ? errors?.weight : ""}
                            />

                            <Input
                                label="Height (cm)"
                                placeholder="Enter Height in cm"
                                type="number"
                                required
                                value={data?.height?.toString()}
                                onChangeText={handleChange("height")}
                                error={touched?.height ? errors?.height : ""}
                            />

                            <Button text="Next" onPress={handleSubmit} loading={isLoading} style={styles.button} />
                        </>
                    )}
                </Formik>
            </KeyboardAvoidingWrapper>
        </Wrapper>
    )
}

export default AvatarScanForm

