import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../Apis/Auth';
import { userApi } from '../../Apis/User';
import { RootState } from '../../Store';
import { clearChatbotSession } from '../../../services/chatbot/chatbotSessionCache';
import { writeUserIdToUnityGame } from '../../../utils/unityGameData';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoggedIn: boolean;
}

interface LoginResponse {
  token: string;
  user: any;
}

interface EditProfileResponse {
  data: any;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
};

export const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      clearChatbotSession();
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action: PayloadAction<LoginResponse>) => {
        state.isLoggedIn = true;
        state.token = action?.payload?.token;
        state.user = action?.payload?.user;

        // Write user ID to Unity game accessible file
        if (action?.payload?.user?.id) {
          writeUserIdToUnityGame(action.payload.user.id).catch(err => {
            console.error('Error writing user ID to Unity game:', err);
          });
        }
      },
    );
    builder.addMatcher(
      authApi.endpoints.verifyOtp.matchFulfilled,
      (state, action: PayloadAction<LoginResponse>) => {
        state.isLoggedIn = true;
        state.token = action?.payload?.token;
        state.user = action?.payload?.user;

        if (action?.payload?.user?.id) {
          writeUserIdToUnityGame(action.payload.user.id).catch(err => {
            console.error('Error writing user ID to Unity game:', err);
          });
        }
      },
    );
    builder.addMatcher(
      userApi.endpoints.updateProfile.matchFulfilled,
      (state, action: PayloadAction<EditProfileResponse>) => {
        state.user = action?.payload?.data;

        // Update user ID in Unity game file if user ID changed
        if (action?.payload?.data?.id) {
          writeUserIdToUnityGame(action.payload.data.id).catch(err => {
            console.error('Error updating user ID in Unity game:', err);
          });
        }
      },
    );
  },
});

export const { logout } = auth.actions;

export const selectUser = (state: RootState): any | null => state.auth.user;
export const selectLoggedIn = (state: RootState): boolean =>
  state.auth.isLoggedIn;

export default auth.reducer;
