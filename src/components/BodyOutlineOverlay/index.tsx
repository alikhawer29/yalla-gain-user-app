import React from "react"
import { StyleSheet, View } from "react-native"
import Svg, { Path } from "react-native-svg"

type Props = {
    color?: string
    strokeWidth?: number
}

// Full body A-pose outline (head, angled arms, torso, separated legs)
// Copied from full_body_pose_guide.svg
const FULL_BODY_POSE_PATH = `
    M 150,45
    C 172,45 188,62 188,86
    C 188,104 180,118 168,126
    C 190,134 214,148 228,168
    C 246,192 256,222 262,254
    L 272,282
    C 274,288 271,294 265,295
    C 259,296 254,292 253,286
    L 242,258
    C 234,238 222,220 208,206
    C 202,224 198,244 198,264
    C 198,290 204,314 204,338
    C 204,352 200,364 198,376
    L 208,420
    C 214,448 216,478 214,506
    L 210,566
    C 209,574 202,580 194,579
    C 187,578 182,571 182,563
    L 184,508
    C 185,480 180,452 172,426
    L 156,378
    L 156,566
    C 156,575 149,582 141,582
    C 133,582 126,575 126,566
    L 126,378
    L 110,426
    C 102,452 97,480 98,508
    L 100,563
    C 100,571 95,578 88,579
    C 80,580 73,574 72,566
    L 68,506
    C 66,478 68,448 74,420
    L 84,376
    C 82,364 78,352 78,338
    C 78,314 84,290 84,264
    C 84,244 80,224 74,206
    C 60,220 48,238 40,258
    L 29,286
    C 28,292 23,296 17,295
    C 11,294 8,288 10,282
    L 20,254
    C 26,222 36,192 54,168
    C 68,148 92,134 114,126
    C 102,118 94,104 94,86
    C 94,62 110,45 132,45
    Z
`

/**
 * Full-body A-pose guide overlay.
 * Sits as an absolutely-positioned, non-interactive layer on top of the
 * <Camera /> preview to guide the user's standing pose.
 */
const BodyOutlineOverlay = ({
    color = "#FFFFFF",
    strokeWidth = 3,
}: Props) => {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 300 600"
                preserveAspectRatio="xMidYMid meet"
            >
                <Path
                    d={FULL_BODY_POSE_PATH}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                />
            </Svg>
        </View>
    )
}

export default BodyOutlineOverlay