import React from "react"
import { FlatList, View } from "react-native"
import images from "../../../assets/images"
import Button from "../../../components/Button"
import PlaylistCard from "../../../components/Cards/PlaylistCard"
import CardWrapper from "../../../components/CardWrapper"
import Icon from "../../../components/Icon"
import Seperator from "../../../components/Seperator"
import Text from "../../../components/Text"
import Wrapper from "../../../components/Wrapper"
import useSpotify from "../../../hooks/useSpotify"
import { navigate } from "../../../utils/navigation"
import { ROUTES } from "../../../utils/routes"
import styles from "./styles"
import Loader from "../../../components/Loader"

const MusicAuth = () => {

    const { login, logout, spotify_authenticated, playlists, isLoading } = useSpotify()

    const renderPlaylist = ({ item }: any) => (
        <PlaylistCard
            title={item?.name}
            icon={{ uri: item?.images?.[0]?.url }}
            onPress={() => navigate(ROUTES.PLAYLIST_DETAILS, { id: item.id })}
        />
    )

    const renderFooter = () => <Button text="Logout Spotify" onPress={logout} />

    return (
        <Wrapper>
            {spotify_authenticated ? (
                <>
                    <Text weight="semibold" size={20} style={styles.playlist_title}>
                        Playlists
                    </Text>
                    {
                        isLoading ? <Loader /> :
                            <FlatList
                                data={playlists?.items}
                                renderItem={renderPlaylist}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                ItemSeparatorComponent={() => <Seperator size={15} />}
                                initialNumToRender={10}
                                contentContainerStyle={styles.list_content}
                                ListFooterComponent={renderFooter}
                                ListFooterComponentStyle={styles.list_footer}
                            />
                    }
                </>
            ) : (
                <CardWrapper height="90%" padding={30}>
                    <View style={styles.auth_container}>
                        <Text size={20} weight="semibold">
                            Welcome to the Platform
                        </Text>
                        <Icon source={images.spotify_logo} size={220} />
                        <Button
                            text="Login With Spotify"
                            style={styles.full_width_button}
                            onPress={login}
                            loading={isLoading}
                        />
                    </View>
                </CardWrapper>
            )}
        </Wrapper>
    )
}

export default MusicAuth
