import { useEffect, useState } from 'react';
import { authorize, refresh } from 'react-native-app-auth';
import { useAppDispatch, useAppSelector } from '.';
import {
    logoutSpotify,
    selectSpotifyAccessToken,
    selectSpotifyAuthentication,
    selectSpotifyRefreshToken,
    setSpotifyTokens,
} from '../redux/Slices/SpotifySlice';

const config = {
    clientId: '20f932c0b6df4069a7c06014506f54fc',
    clientSecret: '61f25a0ef9ba45c8a01febc3923e54de',
    redirectUrl: 'myapp://callback',
    scopes: [
        'user-read-private',
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-read-email',
        'streaming',
        'user-read-playback-state',
        'user-modify-playback-state',
    ],
    serviceConfiguration: {
        authorizationEndpoint: 'https://accounts.spotify.com/authorize',
        tokenEndpoint: 'https://accounts.spotify.com/api/token',
    },
};

const useSpotify = (playlist_id?: string) => {

    const dispatch = useAppDispatch();
    const spotify_authenticated = useAppSelector(selectSpotifyAuthentication);
    const access_token = useAppSelector(selectSpotifyAccessToken);
    const refresh_token = useAppSelector(selectSpotifyRefreshToken);

    const [playlists, setPlaylists] = useState<any>(null);
    const [singlePlaylist, setSinglePlaylist] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async () => {
        try {
            const result = await authorize(config);
            dispatch(setSpotifyTokens({
                access_token: result.accessToken,
                refresh_token: result.refreshToken,
            }));
            return result;
        } catch (err) {
            console.error('Spotify Login Error:', err);
            throw err;
        }
    };

    const logout = async () => {
        dispatch(logoutSpotify())
    };


    const refreshToken = async () => {
        try {
            if (!refresh_token) return;

            const result = await refresh(config, { refreshToken: refresh_token });

            if (result?.accessToken && result?.refreshToken) {
                dispatch(setSpotifyTokens({
                    access_token: result.accessToken,
                    refresh_token: result.refreshToken,
                }));
            }
            return result;
        } catch (err) {
            console.error('Spotify Refresh Error:', err);
            dispatch(logoutSpotify());
            throw err;
        }
    };

    const fetchWithAuth = async (url: string) => {
        try {
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            const data = await res.json();

            if (data?.error?.status === 401) {
                await refreshToken();
            } else {
                return data;
            }
        } catch (err) {
            console.error('Spotify API Error:', err);
        }
    };

    useEffect(() => {
        if (!spotify_authenticated || !access_token) return;

        const getPlaylists = async () => {
            setIsLoading(true);
            const data = await fetchWithAuth('https://api.spotify.com/v1/me/playlists');
            if (data) setPlaylists(data);
            setIsLoading(false);
        };

        getPlaylists();
    }, [spotify_authenticated, access_token]);

    // useEffect(() => {
    //     if (!spotify_authenticated || !playlist_id || !access_token) return;

    //     const getPlaylist = async () => {
    //         setIsLoading(true);
    //         const data = await fetchWithAuth(`https://api.spotify.com/v1/playlists/${playlist_id}`);
    //         if (data) setSinglePlaylist(data);
    //         setIsLoading(false);
    //     };

    //     getPlaylist();
    // }, [spotify_authenticated, access_token, playlist_id]);

    useEffect(() => {
        const getPlaylist = async () => {
            if (!spotify_authenticated || !playlist_id || !access_token) return;

            setIsLoading(true);

            const playlistData = await fetchWithAuth(
                `https://api.spotify.com/v1/playlists/${playlist_id}`
            );

            if (playlistData) {
                // Fetch full track info by track ID to get `preview_url`
                const trackItems = playlistData.tracks?.items || [];

                const trackDetailPromises = trackItems.map(async (item: any) => {
                    const trackId = item.track?.id;
                    if (!trackId) return null;

                    const trackDetail = await fetchWithAuth(
                        `https://api.spotify.com/v1/tracks/${trackId}`
                    );
                    return trackDetail;
                });

                const fullTracks = await Promise.all(trackDetailPromises);

                // Filter out nulls and assign enriched tracks to the playlist
                const updatedPlaylist = {
                    ...playlistData,
                    tracks: {
                        ...playlistData.tracks,
                        items: fullTracks.filter(Boolean),
                    },
                };

                setSinglePlaylist(updatedPlaylist);
            }

            setIsLoading(false);
        };

        getPlaylist();

    }, [spotify_authenticated, access_token, playlist_id]);


    return {
        spotify_authenticated,
        login,
        logout,
        playlists,
        singlePlaylist,
        isLoading,
    };
};

export default useSpotify;