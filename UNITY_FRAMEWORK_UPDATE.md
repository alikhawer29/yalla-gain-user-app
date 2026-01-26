# Manual Steps to Update UnityFramework.framework

## Option 1: Using the Automated Script (Recommended)

Run the script I just created:

```bash
cd /Users/mac/Developer/khawer/YallaGain
./scripts/update-unity-framework.sh /Users/mac/Downloads/YallaGain_Exp
```

If the script fails due to code signing, use Option 2 below.

---

## Option 2: Manual Build in Xcode

### Step 1: Open the Unity Xcode Project

1. Open Xcode
2. File → Open → Navigate to `/Users/mac/Downloads/YallaGain_Exp/Unity-iPhone.xcodeproj`
3. Click "Open"

### Step 2: Build UnityFramework

1. In Xcode, select the **UnityFramework** scheme (top-left, next to the play button)
2. Select **"Any iOS Device"** or **"Generic iOS Device"** as the build target (NOT a simulator)
3. Press **Cmd+B** to build
4. Wait for the build to complete

### Step 3: Locate the Built Framework

After building, the framework will be in one of these locations:

- **DerivedData path**: `~/Library/Developer/Xcode/DerivedData/Unity-iPhone-*/Build/Products/Release-iphoneos/UnityFramework.framework`
- **Or check**: Right-click on `UnityFramework.framework` in Xcode's Products folder → "Show in Finder"

### Step 4: Copy Data Folder into Framework

```bash
# Replace [PATH_TO_BUILT_FRAMEWORK] with the actual path from Step 3
FRAMEWORK_PATH="[PATH_TO_BUILT_FRAMEWORK]"
DATA_SOURCE="/Users/mac/Downloads/YallaGain_Exp/Data"

# Remove old Data folder if it exists
rm -rf "${FRAMEWORK_PATH}/Data"

# Copy new Data folder
cp -R "${DATA_SOURCE}" "${FRAMEWORK_PATH}/Data"
```

### Step 5: Replace Old Framework

```bash
# Backup old framework
mv /Users/mac/Developer/khawer/YallaGain/unity/builds/ios/UnityFramework.framework \
   /Users/mac/Developer/khawer/YallaGain/unity/builds/ios/UnityFramework.framework.backup

# Copy new framework
cp -R "${FRAMEWORK_PATH}" \
   /Users/mac/Developer/khawer/YallaGain/unity/builds/ios/UnityFramework.framework
```

### Step 6: Verify

```bash
# Check that binary exists
test -f /Users/mac/Developer/khawer/YallaGain/unity/builds/ios/UnityFramework.framework/UnityFramework && echo "✅ Binary exists"

# Check that Data folder exists
test -d /Users/mac/Developer/khawer/YallaGain/unity/builds/ios/UnityFramework.framework/Data && echo "✅ Data folder exists"

# Check that metadata exists
test -f /Users/mac/Developer/khawer/YallaGain/unity/builds/ios/UnityFramework.framework/Data/Managed/Metadata/global-metadata.dat && echo "✅ Metadata exists"
```

---

## After Updating

1. **Clean Xcode build**: In Xcode, press **Cmd+Shift+K** (Product → Clean Build Folder)
2. **Rebuild your React Native app**: Run `npx react-native run-ios` or build in Xcode
3. **Test**: The metadata version mismatch error should be resolved!

---

## Important Notes

- ⚠️ **CRITICAL**: The `UnityFramework` binary and `Data/Managed/Metadata/global-metadata.dat` **MUST** come from the **same** Unity build. This is why we copy the Data folder from the same export.
- The framework binary is built from the Unity export's Xcode project
- The Data folder comes from the Unity export's root `Data` folder
- Both are from the same Unity export, so they're guaranteed to match!
