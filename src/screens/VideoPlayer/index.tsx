import { RouteProp, useRoute } from "@react-navigation/native"
import { useState } from "react"
import { View } from "react-native"
import LoaderKit from "react-native-loader-kit"
import Video from "react-native-video"
import Wrapper from "../../components/Wrapper"
import useLockedOrientation from "../../hooks/useLockedOrientation"
import colors from "../../utils/colors"
import styles from "./styles"

const VideoPlayer = () => {

    const { params } = useRoute()
    const [buffering, setBuffering] = useState(false)
    useLockedOrientation("landscape")

    return (
        <Wrapper no_padding hide_bottom_bar>
            {buffering && (
                <View style={styles.buffering_overlay}>
                    <View style={styles.loader_container}>
                        <LoaderKit
                            style={styles.loader}
                            name="BallSpinFadeLoader"
                            color={colors.primary}
                        />
                    </View>
                </View>
            )}

            <Video
                source={{ uri: params?.video }}
                onLoadStart={() => setBuffering(true)}
                onLoad={() => setBuffering(false)}
                onBuffer={(res) => setBuffering(res?.isBuffering)}
                controls
                resizeMode="contain"
                repeat
                style={styles.video}
            />
        </Wrapper>
    )
}

export default VideoPlayer