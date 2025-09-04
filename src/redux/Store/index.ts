import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import errorLogger from '../../middlewares/apierror.middleware';
import successLogger from '../../middlewares/apisuccess.middleware';
import { authApi } from '../Apis/Auth';
import { userApi } from '../Apis/User';
import authReducer from '../Slices/AuthSlice';
import spotifyReducer from '../Slices/SpotifySlice';
import { chatbotApi } from '../Apis/Chatbot';
import { movementCorrectionApi } from '../Apis/MovementCorrection';

const persistConfig = {
    key: 'yallagain',
    storage: AsyncStorage,
    whitelist: ['auth'],
}

const rootReducer = combineReducers({
    auth: authReducer,
    spotify: spotifyReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [chatbotApi.reducerPath]: chatbotApi.reducer,
    [movementCorrectionApi.reducerPath]: movementCorrectionApi.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        })
            .concat(authApi.middleware)
            .concat(userApi.middleware)
            .concat(chatbotApi.middleware)
            .concat(movementCorrectionApi.middleware)
            .concat(errorLogger)
            .concat(successLogger)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
