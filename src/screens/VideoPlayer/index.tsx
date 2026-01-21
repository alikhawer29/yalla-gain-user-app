import { RouteProp, useRoute } from "@react-navigation/native"
import { useState } from "react"
import { View } from "react-native"
import LoaderKit from "react-native-loader-kit"
import Video from "react-native-video"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import styles from "./styles"

const VideoPlayer = () => {

    const { params } = useRoute()
    const [buffering, setBuffering] = useState(false)

    return (
        <Wrapper>
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