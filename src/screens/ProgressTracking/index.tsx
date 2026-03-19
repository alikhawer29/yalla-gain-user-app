import { View } from "react-native"
import { LineChart } from "react-native-chart-kit"
import images from "../../assets/images"
import Button from "../../components/Button"
import CardWrapper from "../../components/CardWrapper"
import Image from "../../components/Image"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { heightPixel, vw } from "../../utils/helper"
import useProgressTrackingController from "./useProgressTrackingController"

const ProgressTracking = () => {
    const {
        values: {
            isLoadingInitialView,
            isLoadingInitialEdit,
            isLoadingFutureView,
            isLoadingFutureEdit,
            progressChartData,
            currentProgress,
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
                        <View style={{ flex: 0.9, padding: heightPixel(0), position: "relative" }}>
                            <Text
                                weight="semibold"
                                size={12}
                                style={{
                                    position: "absolute",
                                    top: heightPixel(8),
                                    // left: heightPixel(8),
                                    zIndex: 1,
                                    backgroundColor: "rgba(0,0,0,0.55)",
                                    paddingHorizontal: heightPixel(8),
                                    paddingVertical: heightPixel(4),
                                    borderRadius: 6,
                                }}
                            >
                                Initial
                            </Text>
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
                        <View style={{ flex: 0.9, padding: heightPixel(10), position: "relative" }}>
                            <Text
                                weight="semibold"
                                size={12}
                                style={{
                                    position: "absolute",
                                    top: heightPixel(8),
                                    // left: heightPixel(7),
                                    zIndex: 1,
                                    backgroundColor: "rgba(0,0,0,0.55)",
                                    paddingHorizontal: heightPixel(8),
                                    paddingVertical: heightPixel(4),
                                    borderRadius: 6,
                                }}
                            >
                                Target
                            </Text>
                            <Image source={images.avatar.slim} />
                        </View>
                        <Row style={{ flex: 0.1 }} justify="center" align="center">
                            <Button
                                font_size={10}
                                style={{ height: heightPixel(25), width: "47%", minWidth: 0, paddingHorizontal: 0,paddingVertical: heightPixel(0) }}
                                text="View"
                                // onPress={handleFutureAvatarView}
                                // loading={isLoadingFutureView}

                                // Sending initial visualization API call opens future visualization ??? Why?
                                onPress={handleFutureAvatarView}
                                loading={isLoadingFutureView}
                            />
                            {/* <Button
                                font_size={10}
                                type="outlined"
                                style={{ height: heightPixel(25), width: "47%", minWidth: 0, paddingHorizontal: 0 }}
                                text="Edit"
                                // onPress={handleFutureAvatarEdit}
                                // loading={isLoadingFutureEdit}

                                // Sending initial visualization API call opens future visualization ??? Why?
                                onPress={handleFutureAvatarEdit}
                                  loading={isLoadingFutureEdit}
                            /> */}
                        </Row>
                    </CardWrapper>
                </View>
            </Row>
            <View style={{ marginTop: heightPixel(30), gap: heightPixel(15) }}>
                <Text weight="semibold" size={20}>{currentProgress}% Progress</Text>
                <View style={{ marginLeft: -heightPixel(12) }}>
                    <LineChart
                        data={progressChartData}
                        width={vw * 90}
                        height={heightPixel(276)}
                        withInnerLines
                        withOuterLines={false}
                        withVerticalLines={false}
                        withHorizontalLabels={false}
                        withShadow={false}
                        fromZero
                        chartConfig={{
                            color: () => colors.primary,
                            labelColor: () => colors.white,
                            decimalPlaces: 0,
                            propsForDots: {
                                r: "4",
                                strokeWidth: "3",
                                stroke: colors.primary,
                                fill: colors.white,
                            },
                            propsForBackgroundLines: {
                                strokeDasharray: "8,8",
                                stroke: colors.gray,
                                strokeWidth: 1,
                            },
                        }}
                        bezier
                        style={{
                            borderRadius: 16,
                        }}
                    />
                </View>
            </View>
        </Wrapper>
    )
}

export default ProgressTracking