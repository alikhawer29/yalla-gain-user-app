import { Formik } from "formik"
import { useCallback, useState } from "react"
import { ScrollView, View } from "react-native"
import images from "../../assets/images"
import Button from "../../components/Button"
import Dropdown, { getDropdownListHeight } from "../../components/Dropdown"
import Image from "../../components/Image"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import styles from "./styles"
import useMovementCorrectionController from "./useMovementCorrectionController"

type OpenKey = 'exercise' | 'mode' | 'side' | null

const MovementCorrection = () => {
    const {
        schema,
        values: {
            initial,
            isLoading,
            dropdown_data,
            mode_options,
            side_options,
        },
        functions: {
            onSubmit,
            exerciseNeedsMode,
        },
    } = useMovementCorrectionController()

    const [openKey, setOpenKey] = useState<OpenKey>(null)

    // Stable setters — avoid recreating on every openKey change (was closing lists instantly)
    const setExerciseOpen = useCallback(
        (next: boolean | ((prev: boolean) => boolean)) => {
            setOpenKey(prev => {
                const currentlyOpen = prev === 'exercise'
                const isOpen =
                    typeof next === 'function' ? next(currentlyOpen) : next
                if (isOpen) return 'exercise'
                return prev === 'exercise' ? null : prev
            })
        },
        [],
    )

    const setModeOpen = useCallback(
        (next: boolean | ((prev: boolean) => boolean)) => {
            setOpenKey(prev => {
                const currentlyOpen = prev === 'mode'
                const isOpen =
                    typeof next === 'function' ? next(currentlyOpen) : next
                if (isOpen) return 'mode'
                return prev === 'mode' ? null : prev
            })
        },
        [],
    )

    const setSideOpen = useCallback(
        (next: boolean | ((prev: boolean) => boolean)) => {
            setOpenKey(prev => {
                const currentlyOpen = prev === 'side'
                const isOpen =
                    typeof next === 'function' ? next(currentlyOpen) : next
                if (isOpen) return 'side'
                return prev === 'side' ? null : prev
            })
        },
        [],
    )

    return (
        <Wrapper scrollable={false}>
            <Formik
                initialValues={initial}
                validationSchema={schema}
                validateOnChange
                validateOnBlur
                onSubmit={onSubmit}
            >
                {({
                    values: data,
                    handleSubmit,
                    setFieldValue,
                    setFieldTouched,
                    touched,
                    errors,
                }) => {
                    const showMode = exerciseNeedsMode(data?.exercise_id)
                    const showSide = showMode && data?.mode === 'single'

                    const exerciseListH = getDropdownListHeight(
                        dropdown_data.length,
                        340,
                    )
                    const modeListH = getDropdownListHeight(
                        mode_options.length,
                        180,
                    )
                    const sideListH = getDropdownListHeight(
                        side_options.length,
                        140,
                    )

                    return (
                        <ScrollView
                            style={styles.scroll}
                            contentContainerStyle={styles.scroll_content}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                        >
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

                            {/* One open at a time; open downward; reserve space so page scrolls */}
                            <View
                                style={[
                                    styles.dropdown_wrapper,
                                    styles.dropdown_exercise,
                                    openKey === 'exercise' && styles.dropdown_open,
                                    openKey === 'exercise' && {
                                        marginBottom: exerciseListH,
                                    },
                                ]}
                            >
                                <Dropdown
                                    required
                                    placeholder="Select Category"
                                    label="Select exercise which you want to monitor"
                                    options={dropdown_data}
                                    value={data?.exercise_id}
                                    open={openKey === 'exercise'}
                                    setOpen={setExerciseOpen}
                                    onChangeText={(e: any) => {
                                        const next = e?.value
                                        if (next == null || next === data?.exercise_id) {
                                            return
                                        }
                                        setFieldValue('exercise_id', next, true)
                                        setFieldTouched('exercise_id', true, false)
                                        setFieldValue('mode', null, false)
                                        setFieldValue('selected_side', null, false)
                                        setOpenKey(null)
                                    }}
                                    error={
                                        touched?.exercise_id && errors?.exercise_id
                                            ? String(errors.exercise_id)
                                            : undefined
                                    }
                                    direction="BOTTOM"
                                    zIndex={3000}
                                    zIndexInverse={1000}
                                    listMode="SCROLLVIEW"
                                    maxHeight={exerciseListH}
                                    dropDownContainerStyle={styles.dropdown_list}
                                />
                            </View>

                            {showMode ? (
                                <View
                                    style={[
                                        styles.dropdown_wrapper,
                                        styles.dropdown_mode,
                                        openKey === 'mode' && styles.dropdown_open,
                                        openKey === 'mode' && {
                                            marginBottom: modeListH,
                                        },
                                    ]}
                                >
                                    <Dropdown
                                        required
                                        placeholder="Select Mode"
                                        label="Mode"
                                        options={mode_options}
                                        value={data?.mode}
                                        open={openKey === 'mode'}
                                        setOpen={setModeOpen}
                                        onChangeText={(e: any) => {
                                            const next = e?.value
                                            if (next == null || next === data?.mode) {
                                                return
                                            }
                                            setFieldValue('mode', next, true)
                                            setFieldTouched('mode', true, false)
                                            if (next !== 'single') {
                                                setFieldValue(
                                                    'selected_side',
                                                    null,
                                                    false,
                                                )
                                            }
                                            setOpenKey(null)
                                        }}
                                        error={
                                            touched?.mode && errors?.mode
                                                ? String(errors.mode)
                                                : undefined
                                        }
                                        direction="BOTTOM"
                                        zIndex={2000}
                                        zIndexInverse={2000}
                                        listMode="SCROLLVIEW"
                                        maxHeight={modeListH}
                                        dropDownContainerStyle={styles.dropdown_list}
                                    />
                                </View>
                            ) : null}

                            {showSide ? (
                                <View
                                    style={[
                                        styles.dropdown_wrapper,
                                        styles.dropdown_side,
                                        openKey === 'side' && styles.dropdown_open,
                                        openKey === 'side' && {
                                            marginBottom: sideListH,
                                        },
                                    ]}
                                >
                                    <Dropdown
                                        required
                                        placeholder="Select Side"
                                        label="Selected Side"
                                        options={side_options}
                                        value={data?.selected_side}
                                        open={openKey === 'side'}
                                        setOpen={setSideOpen}
                                        onChangeText={(e: any) => {
                                            const next = e?.value
                                            if (
                                                next == null ||
                                                next === data?.selected_side
                                            ) {
                                                return
                                            }
                                            setFieldValue(
                                                'selected_side',
                                                next,
                                                true,
                                            )
                                            setFieldTouched(
                                                'selected_side',
                                                true,
                                                false,
                                            )
                                            setOpenKey(null)
                                        }}
                                        error={
                                            touched?.selected_side &&
                                            errors?.selected_side
                                                ? String(errors.selected_side)
                                                : undefined
                                        }
                                        direction="BOTTOM"
                                        zIndex={1000}
                                        zIndexInverse={3000}
                                        listMode="SCROLLVIEW"
                                        maxHeight={sideListH}
                                        dropDownContainerStyle={styles.dropdown_list}
                                    />
                                </View>
                            ) : null}

                            <View style={styles.next_wrap}>
                                <Button
                                    text="Next"
                                    onPress={handleSubmit}
                                    loading={isLoading}
                                />
                            </View>
                        </ScrollView>
                    )
                }}
            </Formik>
        </Wrapper>
    )
}

export default MovementCorrection
