import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../Store';

interface SpotifyState {
    access_token: string | null;
    refresh_token: string | null;
    is_authenticated: boolean;
}

const initialState: SpotifyState = {
    access_token: null,
    refresh_token: null,
    is_authenticated: false,
};

interface SetTokensPayload {
    access_token: string;
    refresh_token: string;
}

const spotifySlice = createSlice({
    name: 'spotify',
    initialState,
    reducers: {
        setSpotifyTokens: (state, action: PayloadAction<SetTokensPayload>) => {
            state.access_token = action.payload.access_token;
            state.refresh_token = action.payload.refresh_token;
            state.is_authenticated = true;
        },
        logoutSpotify: (state) => {
            state.access_token = null;
            state.refresh_token = null;
            state.is_authenticated = false;
        },
    },
});

export const selectSpotifyAccessToken = (state: RootState) => state.spotify.access_token;
export const selectSpotifyRefreshToken = (state: RootState) => state.spotify.refresh_token;
export const selectSpotifyAuthentication = (state: RootState) => state.spotify.is_authenticated;

export const { setSpotifyTokens, logoutSpotify } = spotifySlice.actions;
export default spotifySlice.reducer;
