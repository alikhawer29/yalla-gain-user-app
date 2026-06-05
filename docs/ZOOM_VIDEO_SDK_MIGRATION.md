# Zoom Meeting SDK → Video SDK migration

Official React Native package: **`@zoom/react-native-videosdk`** (there is no `@zoom/videosdk-react-native` on npm).

## 1. Package install

```bash
yarn remove @zoom/meetingsdk-react-native
yarn add @zoom/react-native-videosdk@^2.5.0
cd ios && pod install && cd ..
```

## 2. Android (`android/app/build.gradle`)

- `minSdkVersion` is **29** in `android/build.gradle` (≥ 21 required).
- Removed Meeting SDK Jetpack Compose / Coil overrides (no longer needed).

## 3. AndroidManifest.xml

Already includes:

- `CAMERA`, `RECORD_AUDIO`, `INTERNET`, `MODIFY_AUDIO_SETTINGS`

## 4. iOS Info.plist

Updated:

- `NSCameraUsageDescription` → Camera for video sessions
- `NSMicrophoneUsageDescription` → Microphone for audio in sessions

## 5. Service

`src/services/ZoomVideoService.js` — attach from `VideoSessionScreen` via `useZoom()`.

## 6. Screen

- `src/screens/VideoSessionScreen/index.tsx` — full custom UI
- `src/screens/VideoSessionScreen.js` — re-export alias

## 7. Booking join

`useBookingDetailsController.ts` navigates to `ROUTES.VIDEO_SESSION` with:

- `session_token`, `session_name`, `user_name`, `role`, `doctor_name`, `patient_name`, `booking_id`

Fallback: if API still sends legacy fields, uses `signature` as token and `meeting_number` as session name.

## 8. Navigation

`ConsultationStackNavigator` — `VideoSession` screen, `headerShown: false`.

## 9. Removed

- `src/screens/ZoomMeeting/`
- `patches/@zoom+meetingsdk-react-native+*.patch`

After `yarn install`, run a clean native build:

```bash
cd android && ./gradlew clean && cd ..
yarn android
```
