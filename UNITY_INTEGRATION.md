# Unity Integration Guide for React Native iOS

This guide explains how to integrate Unity as a native view component in a React Native iOS application. This implementation allows Unity games to run embedded within React Native screens while maintaining proper touch event handling and UI interaction.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Project Structure](#project-structure)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [Troubleshooting](#troubleshooting)

## Overview

This integration provides:
- ✅ Unity game running embedded in React Native
- ✅ Two-way communication between React Native and Unity
- ✅ Proper touch event handling (React Native UI works above Unity)
- ✅ Deferred initialization to avoid React Native startup conflicts
- ✅ Automatic Unity Data folder copying during build

## Prerequisites

- React Native project (tested with 0.80.0)
- Xcode (latest version)
- CocoaPods installed
- Unity game exported as iOS framework
- Node.js 18+ installed

## Installation Steps

### 1. Install Dependencies

```bash
npm install @azesmway/react-native-unity
# or
yarn add @azesmway/react-native-unity
```

### 2. Install iOS Dependencies

```bash
cd ios
pod install
```

### 3. Add Native Files

Copy the following files to your iOS project:

#### Required Files:

```
ios/[YourAppName]/
├── RNUnityView.h
├── RNUnityView.swift
├── RNUnityViewManager.m
└── [YourAppName]-Bridging-Header.h (update existing or create)
```

**Note**: Replace `[YourAppName]` with your actual app name (e.g., `YallaGain`).

### 4. Update Bridging Header

Add the following to your `[YourAppName]-Bridging-Header.h`:

```objc
#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import <React/RCTLog.h>
#import <React/RCTComponent.h>

// Define RCTBubblingEventBlock for Swift
typedef void (^RCTBubblingEventBlock)(NSDictionary *body);

// Unity Framework - only include if available
#if __has_include(<UnityFramework/UnityFramework.h>)
#import <UnityFramework/UnityFramework.h>
#elif __has_include("UnityFramework.h")
#import "UnityFramework.h"
#endif

// Import mach-o headers for execute header (if needed)
#if __has_include(<mach-o/ldsyms.h>)
#import <mach-o/ldsyms.h>
#endif
```

### 5. Configure Podfile

Update your `ios/Podfile` to exclude duplicate Unity files from the package:

```ruby
post_install do |installer|
  react_native_post_install(
    installer,
    config[:reactNativePath],
    :mac_catalyst_enabled => false,
  )
  
  # Exclude react-native-unity's RNUnityView and RNUnityViewManager files 
  # since we're using our own implementations
  installer.pods_project.targets.each do |target|
    if target.name == 'react-native-unity'
      files_to_remove = []
      target.source_build_phase.files.each do |file|
        file_ref_path = file.file_ref.path.to_s rescue ''
        file_ref_name = file.file_ref.name.to_s rescue ''
        # Remove all RNUnityView and RNUnityViewManager implementation files
        if file_ref_name.include?('RNUnityView.mm') || 
           file_ref_name.include?('RNUnityViewManager.mm') ||
           file_ref_path.include?('RNUnityView.mm') ||
           file_ref_path.include?('RNUnityViewManager.mm')
          files_to_remove << file
        end
      end
      files_to_remove.each do |file|
        file.remove_from_project
        puts "Removed duplicate Unity file: #{file.file_ref.name rescue 'unknown'}"
      end
    end
  end
  
  # Exclude UnityFramework from simulator builds (it's only built for device/arm64)
  Dir.glob(File.join(installer.sandbox.root, 'Target Support Files', '**', '*.xcconfig')).each do |xcconfig_path|
    xcconfig = File.read(xcconfig_path)
    if xcconfig.include?('-framework "UnityFramework"')
      xcconfig_mod = xcconfig.dup
      other_ldflags_match = xcconfig_mod.match(/^(OTHER_LDFLAGS\s*=\s*)(.+)$/)
      if other_ldflags_match
        flags = other_ldflags_match[2]
        simulator_flags = flags.gsub(/-framework "UnityFramework"/, '')
        xcconfig_mod += "\nOTHER_LDFLAGS[sdk=iphonesimulator*] = #{simulator_flags.strip}\n"
        File.write(xcconfig_path, xcconfig_mod)
      end
    end
  end
end
```

### 6. Add Build Script to Xcode

Add a build script phase to copy Unity Data folder:

1. Open Xcode project
2. Select your app target
3. Go to **Build Phases**
4. Click **+** → **New Run Script Phase**
5. Name it "Copy Unity Data Folder"
6. Add the script (modify path if Unity is in a different location):

```bash
# Copy Unity Data folder from node_modules to app bundle
UNITY_DATA_SOURCE="${SRCROOT}/../node_modules/@azesmway/react-native-unity/ios/UnityFramework.framework/Data"
UNITY_DATA_DEST="${BUILT_PRODUCTS_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/Data"

if [ -d "$UNITY_DATA_SOURCE" ]; then
  echo "Copying Unity Data folder to app bundle..."
  rm -rf "$UNITY_DATA_DEST"
  cp -R "$UNITY_DATA_SOURCE" "$UNITY_DATA_DEST"
  echo "Unity Data folder copied successfully to $UNITY_DATA_DEST"
else
  echo "Warning: UnityFramework Data folder not found at $UNITY_DATA_SOURCE"
fi
```

7. Set **Input Files**:
   ```
   ${SRCROOT}/../node_modules/@azesmway/react-native-unity/ios/UnityFramework.framework/Data
   ```

8. Set **Output Files**:
   ```
   ${BUILT_PRODUCTS_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/Data
   ```

9. Place the script **after** the Resources phase but **before** "Bundle React Native code and images"

### 7. Update Xcode Project Settings

1. Ensure `RNUnityView.swift`, `RNUnityViewManager.m`, and `RNUnityView.h` are added to your target
2. Verify the bridging header path is set in Build Settings

### 8. Add React Native Component

Create `src/components/UnityView/UnityViewNativeIOS.tsx`:

```typescript
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { requireNativeComponent, NativeModules, Platform, ViewStyle, StyleSheet } from 'react-native';

interface RNUnityViewNativeProps {
  style?: ViewStyle;
  onUnityMessage?: (event: { nativeEvent: { message: string } }) => void;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
}

const YallaGainUnityViewNative = requireNativeComponent<RNUnityViewNativeProps>('YallaGainUnityView');
const { YallaGainUnityViewManager } = NativeModules;

interface UnityViewNativeIOSProps {
  style?: ViewStyle;
  onUnityMessage?: (event: { nativeEvent: { message: string } }) => void;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
}

export interface UnityViewNativeIOSRef {
  postMessage: (gameObject: string, methodName: string, message: string) => void;
  pauseUnity: (pause: boolean) => void;
  unloadUnity: () => void;
}

const UnityViewNativeIOS = forwardRef<UnityViewNativeIOSRef, UnityViewNativeIOSProps>(
  ({ style, onUnityMessage, pointerEvents = 'box-none' }, ref) => {
    const viewRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      postMessage: (gameObject: string, methodName: string, message: string) => {
        if (YallaGainUnityViewManager && viewRef.current) {
          YallaGainUnityViewManager.postMessage(
            viewRef.current._nativeTag,
            gameObject,
            methodName,
            message
          );
        }
      },
      pauseUnity: (pause: boolean) => {
        if (YallaGainUnityViewManager && viewRef.current) {
          YallaGainUnityViewManager.pauseUnity(viewRef.current._nativeTag, pause);
        }
      },
      unloadUnity: () => {
        if (YallaGainUnityViewManager && viewRef.current) {
          YallaGainUnityViewManager.unloadUnity(viewRef.current._nativeTag);
        }
      },
    }));

    if (Platform.OS !== 'ios') {
      return null;
    }

    const combinedStyle = StyleSheet.flatten([{ flex: 1 }, style]);

    return (
      <YallaGainUnityViewNative
        ref={viewRef}
        style={combinedStyle}
        onUnityMessage={onUnityMessage}
        pointerEvents={pointerEvents}
      />
    );
  }
);

UnityViewNativeIOS.displayName = 'UnityViewNativeIOS';

export default UnityViewNativeIOS;
```

**Important**: Replace `YallaGainUnityView` and `YallaGainUnityViewManager` with your app name + "UnityView" (e.g., `MyAppUnityView`).

## Project Structure

After integration, your project should have:

```
[ProjectRoot]/
├── ios/
│   ├── [AppName]/
│   │   ├── RNUnityView.h
│   │   ├── RNUnityView.swift
│   │   ├── RNUnityViewManager.m
│   │   └── [AppName]-Bridging-Header.h
│   └── Podfile
├── src/
│   └── components/
│       └── UnityView/
│           └── UnityViewNativeIOS.tsx
└── package.json
```

## Configuration

### View Name Configuration

**Critical**: You must use unique view names to avoid conflicts with the `@azesmway/react-native-unity` package.

1. In `RNUnityView.swift`, change:
   ```swift
   @objc(YallaGainUnityView)
   public class YallaGainUnityView: RCTView {
   ```
   Replace `YallaGainUnityView` with `[YourAppName]UnityView`

2. In `RNUnityViewManager.m`, change:
   ```objc
   RCT_EXPORT_MODULE(YallaGainUnityView)
   ```
   Replace `YallaGainUnityView` with `[YourAppName]UnityView`

3. In `UnityViewNativeIOS.tsx`, update:
   ```typescript
   const YallaGainUnityViewNative = requireNativeComponent<RNUnityViewNativeProps>('[YourAppName]UnityView');
   const { YallaGainUnityViewManager } = NativeModules;
   ```

### Unity Framework Path

If your Unity framework is in a different location, update:

1. **Swift file** (`RNUnityView.swift` line ~40):
   ```swift
   let bundlePath = Bundle.main.bundlePath + "/Frameworks/UnityFramework.framework"
   ```

2. **Build script** (Xcode Build Phase):
   Update `UNITY_DATA_SOURCE` path accordingly

## Usage

### Basic Usage

```typescript
import UnityViewNativeIOS, { UnityViewNativeIOSRef } from '../components/UnityView/UnityViewNativeIOS';
import { useRef } from 'react';

const MyScreen = () => {
  const unityRef = useRef<UnityViewNativeIOSRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 0.8 }}>
        <UnityViewNativeIOS
          ref={unityRef}
          style={{ flex: 1 }}
          pointerEvents="box-none"
          onUnityMessage={(event) => {
            console.log('Message from Unity:', event.nativeEvent.message);
          }}
        />
      </View>
      <View style={{ flex: 0.2, zIndex: 1 }}>
        <Button
          title="Finish"
          onPress={() => {
            // This will work even when Unity is running!
            console.log('Button pressed');
          }}
        />
      </View>
    </View>
  );
};
```

### Send Message to Unity

```typescript
unityRef.current?.postMessage('GameObjectName', 'MethodName', 'message');
```

### Pause/Resume Unity

```typescript
unityRef.current?.pauseUnity(true);  // Pause
unityRef.current?.pauseUnity(false); // Resume
```

### Unload Unity

```typescript
unityRef.current?.unloadUnity();
```

### Receive Messages from Unity

Unity should call `SendMessageToMobileApp` to send messages to React Native:

```csharp
// In Unity C# script
SendMessageToMobileApp("Hello from Unity!");
```

This will trigger the `onUnityMessage` callback in React Native.

## Key Features

### 1. Deferred Initialization

Unity initializes only when the view is added to the window, ensuring React Native starts properly.

### 2. Touch Event Handling

- `pointerEvents="box-none"` allows React Native UI above Unity to receive touches
- Unity only captures touches on its game content
- React Native buttons work even when Unity is running

### 3. Data Folder Management

The build script automatically copies Unity's Data folder (containing `global-metadata.dat` and other required files) to the app bundle where Unity expects it.

## Troubleshooting

### Issue: "YallaGain has not been registered" Error

**Solution**: This happens if Unity initializes too early. The current implementation defers initialization until after React Native is ready (1-second delay after view appears in window).

### Issue: "Cannot find global-metadata.dat"

**Solution**: 
1. Verify the build script is running (check Xcode build logs)
2. Check that `UnityFramework.framework/Data` exists in node_modules
3. Verify the script path matches your setup

### Issue: "Tried to register two views with the same name"

**Solution**: Ensure you've renamed the view to avoid conflicts:
- Use unique names (e.g., `[YourAppName]UnityView`)
- Update all three locations (Swift, Objective-C, TypeScript)
- Clean build folder and rebuild

### Issue: Buttons not clickable above Unity

**Solution**:
1. Ensure `pointerEvents="box-none"` is set on the Unity view
2. Add `zIndex` to React Native UI above Unity
3. Verify the parent container doesn't block touches

### Issue: Unity Framework not found

**Solution**:
1. Verify Unity framework is in node_modules
2. Check the bundle path in `RNUnityView.swift`
3. Ensure framework is included in "Frameworks" build phase

### Issue: Thread Performance Warnings

**Solution**: These are warnings, not errors. Unity creates multiple threads for rendering and physics. They can be ignored in production builds.

## Build Configuration Notes

- **Device Only**: Unity framework typically only builds for device (arm64), not simulator
- **Minimum iOS Version**: Ensure your deployment target supports Unity's requirements
- **Build Settings**: Unity framework should be linked but not embedded (if using CocoaPods)

## Additional Notes

- Unity initialization is deferred by 1 second after React Native starts to ensure bridge is ready
- Touch events use `box-none` by default to allow React Native UI interaction
- Unity's root view is configured with `clipsToBounds = true` to prevent touch overflow
- The integration respects React Native's view hierarchy and z-ordering

## File Checklist

Before building, ensure you have:

- [ ] `RNUnityView.h` in iOS project
- [ ] `RNUnityView.swift` in iOS project
- [ ] `RNUnityViewManager.m` in iOS project
- [ ] Bridging header updated
- [ ] Build script phase added
- [ ] View names updated to avoid conflicts
- [ ] Podfile updated
- [ ] React Native component created
- [ ] All files added to Xcode target

## Support

If you encounter issues:

1. Clean build folder (Cmd+Shift+K in Xcode)
2. Delete DerivedData
3. Run `pod install` again
4. Rebuild from scratch
5. Check Xcode build logs for specific errors

## License

This integration guide is for reference. Ensure you comply with Unity's licensing terms when using Unity in your application.

