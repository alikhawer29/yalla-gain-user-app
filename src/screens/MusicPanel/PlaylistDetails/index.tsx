import { RouteProp, useRoute } from "@react-navigation/native"
import { Fragment, useEffect } from "react"
import { FlatList, ImageBackground, View } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import images from "../../../assets/images"
import SongCard from "../../../components/Cards/SongCard"
import Icon from "../../../components/Icon"
import Loader from "../../../components/Loader"
import Row from "../../../components/Row"
import Seperator from "../../../components/Seperator"
import Text from "../../../components/Text"
import Wrapper from "../../../components/Wrapper"
import useSpotify from "../../../hooks/useSpotify"
import { RootStackParamList } from "../../../interfaces"
import colors from "../../../utils/colors"
import { heightPixel, widthPixel } from "../../../utils/helper"
import styles from "./styles"
import usePlayer from "../../../hooks/usePlayer"

const PlaylistDetails = () => {

    const { params } = useRoute<RouteProp<RootStackParamList, 'PlaylistDetails'>>()
    const { singlePlaylist, isLoading } = useSpotify(params?.id)
    const { isReady, loadPlaylist, isPlaying, togglePlayback, currentTrack } = usePlayer()

    useEffect(() => {
        if (singlePlaylist && singlePlaylist?.tracks?.items) {
            let final_playlist = singlePlaylist?.tracks?.items?.map(item => ({ id: item.id, url: item?.preview_url, title: item.name, artist: item?.artists?.map((item: any) => item?.name).join(', '), artwork: item?.album?.images?.[0]?.url }))
            loadPlaylist(final_playlist)
        }
    }, [singlePlaylist])

    const renderItem = ({ item }: any) => (
        <SongCard
            title={item?.name}
            icon={{ uri: item?.album?.images?.[0]?.url }}
            artist={item?.artists?.map((item: any) => item?.name).join(', ')}
            onPress={() => { }}
            active={currentTrack?.id === item.id}
        />
    )

    return (
        <Wrapper no_padding>
            {
                isLoading ?
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Loader name="Orbit" />
                    </View> :
                    <Fragment>
                        <ImageBackground
                            source={{ uri: singlePlaylist?.images?.[0]?.url }}
                            style={styles.header_image}
                            imageStyle={styles.header_image_inner}
                        >
                            <LinearGradient colors={[colors.transparent, colors.light_green]} style={styles.gradient}>
                                <Text>Playlist</Text>
                                <Text size={28} weight="bold" line_height={40}>{singlePlaylist?.name}</Text>
                                <Text>{singlePlaylist?.owner?.display_name} | {singlePlaylist?.tracks?.total} Tracks</Text>
                            </LinearGradient>
                            <View style={{ position: "absolute", right: widthPixel(20), bottom: -(heightPixel(40)), height: heightPixel(80), width: heightPixel(80), borderRadius: heightPixel(40), backgroundColor: "rgba(50, 205, 50, 0.3)", alignItems: "center", justifyContent: "center", elevation: 5 }}>
                                <Icon source={isPlaying ? images.pause : images.play} tint_color={colors.white} color={colors.light_green} rounded size={65} onPress={togglePlayback} />
                            </View>
                        </ImageBackground>
                        <View style={styles.content}>
                            <Row style={styles.title_container}>
                                <Text weight="semibold" size={20}>Tracks</Text>
                            </Row>
                            <FlatList
                                data={singlePlaylist?.tracks?.items}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => item?.track?.id ?? index.toString()}
                                ItemSeparatorComponent={() => <Seperator size={15} />}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    </Fragment>
            }
        </Wrapper>
    )
}

export default PlaylistDetails
