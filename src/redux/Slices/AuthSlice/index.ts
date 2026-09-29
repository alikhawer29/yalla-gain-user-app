import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../Apis/Auth';
import { userApi } from '../../Apis/User';
import { RootState } from '../../Store';
import { clearChatbotSession } from '../../../services/chatbot/chatbotSessionCache';
import { clearAllOptimisticHistorySessions } from '../../../services/chatbot/chatbotHistoryStore';
import { writeUserIdToUnityGame } from '../../../utils/unityGameData';
import type { UserSubscription } from '../../../utils/subscription';

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
      clearAllOptimisticHistorySessions();
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
    },
    /** Merge profile fields after payment / cancel so feature gates update immediately. */
    patchAuthUser: (
      state,
      action: PayloadAction<{
        coins?: number | string;
        subscription?: UserSubscription;
      }>,
    ) => {
      if (!state.user) return;
      const { coins, subscription } = action.payload;
      if (coins != null) {
        state.user.coins = String(coins);
      }
      if (subscription) {
        state.user.subscription = subscription;
      }
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
    builder.addMatcher(
      userApi.endpoints.subscribe.matchFulfilled,
      (state, action) => {
        const payload = action.payload as {
          status?: boolean;
          coins?: number;
          subscription?: UserSubscription;
        };
        if (!state.user || payload?.status === false || !payload.subscription) {
          return;
        }
        state.user.subscription = payload.subscription;
        if (payload.coins != null) {
          state.user.coins = String(payload.coins);
        }
      },
    );
    builder.addMatcher(
      userApi.endpoints.cancelSubscription.matchFulfilled,
      (state, action) => {
        const payload = action.payload as {
          status?: boolean;
          subscription?: UserSubscription;
        };
        if (!state.user || payload?.status === false) {
          return;
        }
        if (payload.subscription) {
          state.user.subscription = payload.subscription;
          return;
        }
        if (state.user.subscription) {
          state.user.subscription = {
            ...state.user.subscription,
            is_cancelled: true,
            status: 'cancelled',
            auto_renew: false,
            can_cancel: false,
          };
        }
      },
    );
  },
});

export const { logout, patchAuthUser } = auth.actions;

export const selectUser = (state: RootState): any | null => state.auth.user;
export const selectLoggedIn = (state: RootState): boolean =>
  state.auth.isLoggedIn;

export default auth.reducer;
