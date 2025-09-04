import { Formik } from "formik"
import { View } from "react-native"
import images from "../../assets/images"
import Button from "../../components/Button"
import Dropdown from "../../components/Dropdown"
import Image from "../../components/Image"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import { LOREM } from "../../utils/data"
import styles from "./styles"
import useMovementCorrectionController from "./useMovementCorrectionController"

const MovementCorrection = () => {
    const {
        schema,
        values: {
            initial,
            isLoading,
            dropdown_data
        },
        functions: {
            onSubmit
        },
    } = useMovementCorrectionController()

    return (
        <Wrapper>
            <Formik
                initialValues={initial}
                validationSchema={schema}
                onSubmit={onSubmit}
            >
                {({ values: data, handleSubmit, setFieldValue, touched, errors }) => (
                    <>
                        <View style={styles.cover_container}>
                            <Image
                                resize="cover"
                                source={images.movement_correction_cover}
                                style={styles.cover_image}
                            />
                        </View>

                        <Text style={styles.description}>
                            {LOREM} {LOREM}
                        </Text>

                        <View style={styles.dropdown_wrapper}>
                            <Dropdown
                                required
                                placeholder="Select Category"
                                label="Select exercise which you want to monitor"
                                options={dropdown_data}
                                value={data?.exercise}
                                onChangeText={(e: any) =>
                                    setFieldValue("exercise", e?.value)
                                }
                                error={touched?.exercise && errors?.exercise}
                            />
                        </View>

                        <Button
                            text="Next"
                            onPress={handleSubmit}
                            loading={isLoading}
                        />
                    </>
                )}
            </Formik>
        </Wrapper>
    )
}

export default MovementCorrection