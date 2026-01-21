import React from "react"
import { View } from "react-native"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Image from "../../components/Image"
import Button from "../../components/Button"
import Row from "../../components/Row"
import styles from "./styles"
import useAvatarVisualizationController from "./useAvatarVisualizationController"
import colors from "../../utils/colors"
import { font, heightPixel, widthPixel } from "../../utils/helper"
import images from "../../assets/images"

// Type for Measurement Line Prop
type MeasurementProps = {
    label: string
    value: string
    top: number
    left?: number
    right?: number
    lineLength?: number
}

// Helper component for drawing lines and labels
const MeasurementAnnotation = ({ label, value, top, left, right, lineLength = 50 }: MeasurementProps) => {
    const isLeft = left !== undefined
    // Color matching the image (cyan/teal)
    const tickColor = "#00C4B4"

    return (
        <View style={{ position: 'absolute', top: heightPixel(top), left: isLeft ? widthPixel(left!) : undefined, right: !isLeft ? widthPixel(right!) : undefined, alignItems: isLeft ? 'flex-start' : 'flex-end' }}>
            {/* Label */}
            <View style={{ marginBottom: 5 }}>
                <Text size={12} color="rgba(255,255,255,0.7)">{label}: <Text weight="bold" color={colors.white}>{value}</Text></Text>
            </View>

            {/* Line and Dot */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isLeft && (
                    <View style={{ width: widthPixel(10), height: widthPixel(10), borderRadius: 5, backgroundColor: tickColor, marginRight: -5 }} />
                )}
                <View style={{ height: 1, backgroundColor: tickColor, width: widthPixel(lineLength), borderColor: tickColor, borderStyle: 'dashed', borderWidth: 1 }} />
                {!isLeft && (
                    <View style={{ width: widthPixel(10), height: widthPixel(10), borderRadius: 5, backgroundColor: tickColor, marginLeft: -5 }} />
                )}
            </View>

        </View>
    )
}

const AvatarVisualization = () => {
    const {
        values: { type, avatarImage, title },
        functions: { handleShare, handleEdit, handleAddProgress }
    } = useAvatarVisualizationController()

    return (
        <Wrapper scrollable>
            <View style={styles.container}>
                {/* Stats Header (Height / Weight) */}
                {/* <Row justify="space-between" style={{ paddingHorizontal: widthPixel(40), marginTop: heightPixel(20) }}>
                    <Text size={14} color="rgba(255,255,255,0.7)">Height: <Text size={14} color={colors.white}>14 cm</Text></Text>
                    <Text size={14} color="rgba(255,255,255,0.7)">Weight: <Text size={14} color={colors.white}>120 Lbs</Text></Text>
                </Row> */}

                {/* Avatar and Measurements Container */}
                <View style={styles.avatarContainer}>
                    <Image source={avatarImage} style={styles.avatarImage} />

                    {/* Left Side Measurements */}
                    {/* Shoulder */}
                    {/* <MeasurementAnnotation label="Shoulder Width" value="14 cm" top={100} left={30} lineLength={40} /> */}
                    {/* Chest */}
                    {/* <MeasurementAnnotation label="Chest Circumference" value="24 cm" top={160} left={10} lineLength={60} /> */}
                    {/* Hip */}
                    {/* <MeasurementAnnotation label="Hip Circumference" value="44 cm" top={320} left={20} lineLength={50} /> */}

                    {/* Right Side Measurements */}
                    {/* Neck */}
                    {/* <MeasurementAnnotation label="Neck Circumference" value="14 cm" top={80} right={20} lineLength={60} /> */}
                    {/* Arm */}
                    {/* <MeasurementAnnotation label="Arm Circumference" value="22 cm" top={160} right={10} lineLength={60} /> */}
                    {/* Waist */}
                    {/* <MeasurementAnnotation label="Waist Circumference" value="34 cm" top={300} right={10} lineLength={60} /> */}
                    {/* Thigh */}
                    {/* <MeasurementAnnotation label="Thigh Circumference" value="14 cm" top={420} right={10} lineLength={60} /> */}

                </View>

                {/* Bottom Buttons */}
                <View style={styles.bottomContainer}>
                    <Row gap={8} justify="center">
                        {type === 'future' && (
                            <Button
                                onPress={handleAddProgress}
                                text="Add Progress"
                                style={{ flex: 1, backgroundColor: "#008B7D", height: heightPixel(40), paddingHorizontal: 0, minWidth: 0 }}
                                font_size={font(10)}
                            />
                        )}

                        <Button
                            onPress={handleShare}
                            text="Share Avatar"
                            type={type === 'future' ? 'outlined' : 'primary'}
                            style={{ flex: 1, height: heightPixel(40), paddingHorizontal: 0, minWidth: 0 }}
                            font_size={font(10)}
                        />
                        <Button
                            onPress={handleEdit}
                            text="Edit Avatar"
                            type="outlined"
                            style={{ flex: 1, height: heightPixel(40), paddingHorizontal: 0, minWidth: 0 }}
                            font_size={font(10)}
                        />
                    </Row>
                </View>

                {/* Footer Section (Body Fat, Weight Loss) */}
                <View style={{ paddingHorizontal: widthPixel(20), paddingBottom: heightPixel(40) }}>
                    <Text size={18} weight="bold" style={{ marginBottom: heightPixel(15) }}>Body Fat Percentage: 20 %</Text>

                    <View style={styles.dropdownButton}>
                        <Text>Weight Loss</Text>
                        <Image source={images.right_arrow} style={{ transform: [{ rotate: '90deg' }], width: 15, height: 15, tintColor: colors.white }} />
                    </View>

                    {/* Slider / Timeline Placeholder */}
                    <Row justify="space-between" style={{ marginTop: 10 }}>
                        <Text size={12}>01 Month</Text>
                        <Text size={12}>02 Month</Text>
                        <Text size={12}>03 Month</Text>
                        <Text size={12}>04 Month</Text>
                        <Text size={12}>05 Month</Text>
                        <Text size={12} color={colors.white}>06 Month</Text>
                    </Row>
                    {/* Simple Line Representation of slider */}
                    <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.2)", marginTop: 10, borderRadius: 2 }}>
                        <View style={{ width: '50%', height: '100%', backgroundColor: '#00C4B4', borderRadius: 2 }} />
                        <View style={{ position: 'absolute', left: '50%', top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: '#00C4B4', borderWidth: 2, borderColor: colors.white }} />
                    </View>

                </View>

            </View>

        </Wrapper>
    )
}

export default AvatarVisualization
