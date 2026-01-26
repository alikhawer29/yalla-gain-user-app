#!/bin/bash

# Script to update UnityFramework.framework from a fresh Unity export
# Usage: ./scripts/update-unity-framework.sh [path-to-unity-export]

set -e

UNITY_EXPORT="${1:-/Users/mac/Downloads/YallaGain_Exp}"
TARGET_DIR="$(cd "$(dirname "$0")/.." && pwd)/unity/builds/ios"
XCODE_PROJECT="${UNITY_EXPORT}/Unity-iPhone.xcodeproj"

echo "🔍 Unity Export: ${UNITY_EXPORT}"
echo "📦 Target Directory: ${TARGET_DIR}"
echo ""

# Check if export exists
if [ ! -d "${UNITY_EXPORT}" ]; then
    echo "❌ ERROR: Unity export not found at: ${UNITY_EXPORT}"
    echo "   Please provide the path to your Unity export folder"
    exit 1
fi

# Check if Xcode project exists
if [ ! -d "${XCODE_PROJECT}" ]; then
    echo "❌ ERROR: Xcode project not found at: ${XCODE_PROJECT}"
    exit 1
fi

# Check if Data folder exists
if [ ! -d "${UNITY_EXPORT}/Data" ]; then
    echo "❌ ERROR: Data folder not found in export"
    exit 1
fi

echo "✅ Unity export structure verified"
echo ""

# Create target directory if it doesn't exist
mkdir -p "${TARGET_DIR}"

# Step 1: Build UnityFramework.framework
echo "🔨 Step 1: Building UnityFramework.framework..."
echo "   This may take a few minutes..."

# Try to build for iOS device (arm64)
# If this fails due to signing, we'll try simulator build
BUILD_DIR="${UNITY_EXPORT}/build"
mkdir -p "${BUILD_DIR}"

if xcodebuild -project "${XCODE_PROJECT}" \
    -scheme "UnityFramework" \
    -configuration "Release" \
    -sdk iphoneos \
    -arch arm64 \
    -derivedDataPath "${BUILD_DIR}" \
    build 2>&1 | tee "${BUILD_DIR}/build.log"; then
    echo "✅ Built for iOS device (arm64)"
    FRAMEWORK_PATH="${BUILD_DIR}/Build/Products/Release-iphoneos/UnityFramework.framework"
elif xcodebuild -project "${XCODE_PROJECT}" \
    -scheme "UnityFramework" \
    -configuration "Release" \
    -sdk iphonesimulator \
    -arch x86_64 \
    -derivedDataPath "${BUILD_DIR}" \
    build 2>&1 | tee "${BUILD_DIR}/build.log"; then
    echo "✅ Built for iOS simulator (x86_64)"
    FRAMEWORK_PATH="${BUILD_DIR}/Build/Products/Release-iphonesimulator/UnityFramework.framework"
else
    echo "⚠️  Automatic build failed. Please build manually:"
    echo "   1. Open ${XCODE_PROJECT} in Xcode"
    echo "   2. Select 'UnityFramework' scheme"
    echo "   3. Select 'Any iOS Device' or a simulator"
    echo "   4. Build (Cmd+B)"
    echo "   5. Find UnityFramework.framework in Products folder"
    echo ""
    echo "   Then run this script again with the path to the built framework:"
    echo "   ./scripts/update-unity-framework.sh ${UNITY_EXPORT} [path-to-built-framework]"
    exit 1
fi

# Check if framework was built
if [ ! -d "${FRAMEWORK_PATH}" ]; then
    echo "❌ ERROR: Built framework not found at: ${FRAMEWORK_PATH}"
    echo "   Check build log: ${BUILD_DIR}/build.log"
    exit 1
fi

echo "✅ Framework built successfully at: ${FRAMEWORK_PATH}"
echo ""

# Step 2: Copy Data folder into framework
echo "📁 Step 2: Copying Data folder into framework..."
if [ -d "${FRAMEWORK_PATH}/Data" ]; then
    echo "   Removing old Data folder from framework..."
    rm -rf "${FRAMEWORK_PATH}/Data"
fi

cp -R "${UNITY_EXPORT}/Data" "${FRAMEWORK_PATH}/Data"
echo "✅ Data folder copied into framework"
echo ""

# Step 3: Backup old framework
if [ -d "${TARGET_DIR}/UnityFramework.framework" ]; then
    echo "💾 Step 3: Backing up old framework..."
    BACKUP_DIR="${TARGET_DIR}/UnityFramework.framework.backup.$(date +%Y%m%d_%H%M%S)"
    mv "${TARGET_DIR}/UnityFramework.framework" "${BACKUP_DIR}"
    echo "✅ Old framework backed up to: ${BACKUP_DIR}"
    echo ""
fi

# Step 4: Copy new framework to target directory
echo "📦 Step 4: Copying new framework to ${TARGET_DIR}..."
rm -rf "${TARGET_DIR}/UnityFramework.framework"
cp -R "${FRAMEWORK_PATH}" "${TARGET_DIR}/UnityFramework.framework"
echo "✅ Framework copied successfully"
echo ""

# Step 5: Verify
echo "🔍 Step 5: Verifying framework..."
if [ ! -f "${TARGET_DIR}/UnityFramework.framework/UnityFramework" ]; then
    echo "❌ ERROR: Framework binary not found!"
    exit 1
fi

if [ ! -d "${TARGET_DIR}/UnityFramework.framework/Data" ]; then
    echo "❌ ERROR: Data folder not found in framework!"
    exit 1
fi

if [ ! -f "${TARGET_DIR}/UnityFramework.framework/Data/Managed/Metadata/global-metadata.dat" ]; then
    echo "⚠️  WARNING: global-metadata.dat not found. This might cause issues."
else
    echo "✅ global-metadata.dat found"
fi

echo ""
echo "✅ SUCCESS! UnityFramework.framework has been updated."
echo ""
echo "📋 Next steps:"
echo "   1. Clean your Xcode build folder (Cmd+Shift+K)"
echo "   2. Rebuild your React Native iOS app"
echo "   3. The metadata version mismatch should be resolved!"
echo ""
