const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../ios/ZoomPatches/RNZoomVideoSdkAudioHelper.m');
const dest = path.join(
  __dirname,
  '../node_modules/@zoom/react-native-videosdk/ios/RNZoomVideoSdkAudioHelper.m',
);

if (!fs.existsSync(src)) {
  process.exit(0);
}

if (!fs.existsSync(path.dirname(dest))) {
  process.exit(0);
}

fs.copyFileSync(src, dest);
