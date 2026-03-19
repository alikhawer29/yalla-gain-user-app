import { View } from "react-native"
import images from "../../assets/images"
import Button from "../../components/Button"
import CardWrapper from "../../components/CardWrapper"
import Image from "../../components/Image"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"
import useProgressTrackingController from "./useProgressTrackingController"

const ProgressTracking = () => {
    const {
        values: {
            isLoadingInitialView,
            isLoadingInitialEdit,
            isLoadingFutureView,
            isLoadingFutureEdit,
        },
        functions: {
            handleInitialAvatarView,
            handleInitialAvatarEdit,
            handleFutureAvatarView,
            handleFutureAvatarEdit,
        },
    } = useProgressTrackingController()

    return (
        <Wrapper scrollable bottom_bar floating>
            <Row gap={5}>
                <View style={{ flex: 1 }}>
                    <CardWrapper height={352} padding={10} color={colors.blackish_gray} >
                        <View style={{ flex: 0.9, padding: heightPixel(0) }}>
                            <Image source={images.avatar.fat} />
                        </View>
                        <Row style={{ flex: 0.1 }} justify="space-between" align="center">
                            <Button
                                font_size={10}
                                style={{ height: heightPixel(25), width: "47%", minWidth: 0, paddingHorizontal: 0 }}
                                text="View"
                                // onPress={handleInitialAvatarView}
                                // loading={isLoadingInitialView}

                                // Sending future visualization API call opens initial visualization ??? Why?
                                onPress={handleInitialAvatarView}
                                loading={isLoadingInitialView}
                            />
                            <Button
                                font_size={10}
                                type="outlined"
                                style={{ height: heightPixel(25), width: "47%", minWidth: 0, paddingHorizontal: 0 }}
                                text="Edit"
                                // onPress={handleInitialAvatarEdit}
                                // loading={isLoadingInitialEdit}

                                // Sending future visualization API call opens initial visualization ??? Why?
                                onPress={handleInitialAvatarEdit}
                                loading={isLoadingInitialEdit}
                            />
                        </Row>
                    </CardWrapper>
                </View>
                <View style={{ flex: 1 }}>
                    <CardWrapper height={352} padding={10} color={colors.blackish_gray} >
                        <View style={{ flex: 0.9, padding: heightPixel(10) }}>
                            <Image source={images.avatar.slim} />
                        </View>
                        <Row style={{ flex: 0.1 }} justify="space-between" align="center">
                            <Button
                                font_size={10}
                                style={{ height: heightPixel(25), width: "47%", minWidth: 0, paddingHorizontal: 0 }}
                                text="View"
                                // onPress={handleFutureAvatarView}
                                // loading={isLoadingFutureView}

                                // Sending initial visualization API call opens future visualization ??? Why?
                                onPress={handleFutureAvatarView}
                                loading={isLoadingFutureView}
                            />
                            <Button
                                font_size={10}
                                type="outlined"
                                style={{ height: heightPixel(25), width: "47%", minWidth: 0, paddingHorizontal: 0 }}
                                text="Edit"
                                // onPress={handleFutureAvatarEdit}
                                // loading={isLoadingFutureEdit}

                                // Sending initial visualization API call opens future visualization ??? Why?
                                onPress={handleFutureAvatarEdit}
                                loading={isLoadingFutureEdit}
                            />
                        </Row>
                    </CardWrapper>
                </View>
            </Row>
            <View style={{ marginTop: heightPixel(30), gap: heightPixel(15) }}>
                <Text weight="semibold" size={20}>20% Progress</Text>
                <Image source={images.graph} style={{ width: "100%", height: heightPixel(276) }} />
            </View>
        </Wrapper>
    )
}

export default ProgressTracking