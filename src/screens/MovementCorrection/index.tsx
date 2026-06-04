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
            dropdown_data,
        },
        functions: {
            onSubmit
        },
    } = useMovementCorrectionController()

    return (
        <Wrapper scrollable>
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
                            Movement Correction focuses on identifying and improving improper body movements, posture, and muscular imbalances that may lead to discomfort, reduced performance, or injury during daily activities and workouts.
                        </Text>

                        <Text style={styles.description}>
                            Through guided exercises, posture awareness, and corrective training techniques, users can improve mobility, stability, flexibility, and overall body alignment to support safer and more effective movement patterns.
                        </Text>

                        <View style={styles.dropdown_wrapper}>
                            <Dropdown
                                required
                                placeholder="Select Category"
                                label="Select exercise which you want to monitor"
                                options={dropdown_data}
                                value={data?.exercise_id}
                                onChangeText={(e: any) =>
                                    setFieldValue("exercise_id", e?.value)
                                }
                                error={
                                    touched?.exercise_id && errors?.exercise_id
                                }
                                direction="TOP"
                                zIndex={5000}
                                zIndexInverse={1000}
                                dropDownContainerStyle={styles.dropdown_list}
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