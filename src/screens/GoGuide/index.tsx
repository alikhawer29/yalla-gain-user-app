import React, { useRef, useState } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import Video from "react-native-video"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Button from "../../components/Button"
import Row from "../../components/Row"
import Image from "../../components/Image"
import images from "../../assets/images"
import { heightPixel, vw } from "../../utils/helper"
import { navigateToHome } from "../../utils/navigation"
import styles from "./styles"

const GoGuide = () => {
    const videoRef = useRef<any>(null)
    const [paused, setPaused] = useState(true)

    const togglePlay = () => setPaused(!paused)

    const onSkip = () => {
        navigateToHome()
    }

    return (
        <Wrapper no_padding>
            <View style={styles.header}>
                <Text size={24} weight="semibold">Go Guide</Text>
            </View>

            <View style={styles.video_container}>
                <View style={{ width: vw * 90, height: heightPixel(480), overflow: "hidden" }}>
                    <Video
                        source={images.guide_video}
                        ref={videoRef}
                        paused={paused}
                        resizeMode="cover"
                        style={styles.video}
                        onEnd={() => setPaused(true)}
                    />
                    {paused && (
                        <TouchableOpacity
                            style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }]}
                            onPress={togglePlay}
                        >
                            <View style={{ padding: 10 }}>
                                <Image source={images.video_play} style={{ width: 60, height: 60 }} />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.bottom_container}>
                <Text size={22} weight="semibold" style={styles.description}>
                    Watch our quick guide to understand how everything works.
                </Text>

                <Row gap={15} style={{ marginTop: heightPixel(20) }}>
                    {/* <Button 
                        text="Next" 
                        style={styles.button} 
                        onPress={onSkip}
                    /> */}
                    <Button
                        text="Skip"
                        type="outlined"
                        style={styles.outline_button}
                        onPress={onSkip}
                    />
                </Row>
            </View>
        </Wrapper>
    )
}

export default GoGuide
