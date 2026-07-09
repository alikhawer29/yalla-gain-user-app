import React from "react"
import { StyleSheet, View, Dimensions } from "react-native"
import Svg, { Path, Ellipse, G } from "react-native-svg"

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window")

type Props = {
    step: "front" | "right"
    color?: string
    footGuideColor?: string
    strokeWidth?: number
}

/**
 * Bodygram-style scan guide overlay.
 * - Draws a head/shoulders/arms outline near the top (matches how Bodygram's
 *   own scan screen guides the front/side pose).
 * - Draws an oval foot-placement guide with footprints near the bottom.
 *
 * Sits as an absolutely-positioned, non-interactive layer on top of the
 * <Camera /> preview. Coordinates are defined in a 300x600 viewBox and
 * scaled to the actual screen size via preserveAspectRatio, so it adapts
 * to any device.
 */
const Bodyoutlineoverlay = ({
    step,
    color = "#FFFFFF",
    footGuideColor = "#F5A623",
    strokeWidth = 3,
}: Props) => {

    // Upper body outline (head -> shoulders -> arms hanging down).
    // Front pose: arms slightly away from body (like the reference screenshot).
    // Side pose: narrower silhouette, one arm mostly hidden behind torso.
    const frontOutlinePath = `
        M150,60
        C 130,60 118,78 118,100
        C 118,122 128,138 140,150
        C 108,168 78,190 62,225
        C 46,262 40,300 38,340
        C 37,360 42,378 55,392
        C 60,397 66,400 70,396
        C 78,388 74,372 78,356
        C 86,322 100,286 122,258
        C 128,250 134,244 140,240
        L 150,600
        L 160,240
        C 166,244 172,250 178,258
        C 200,286 214,322 222,356
        C 226,372 222,388 230,396
        C 234,400 240,397 245,392
        C 258,378 263,360 262,340
        C 260,300 254,262 238,225
        C 222,190 192,168 160,150
        C 172,138 182,122 182,100
        C 182,78 170,60 150,60
        Z
    `

    const sideOutlinePath = `
        M160,60
        C 142,60 130,78 130,100
        C 130,122 138,138 148,150
        C 122,166 100,186 88,215
        C 78,240 74,268 90,290
        C 100,304 112,314 118,326
        L 128,600
        L 150,240
        C 168,246 186,258 198,278
        C 210,298 214,322 214,350
        C 214,368 210,384 216,394
        C 220,399 227,398 231,392
        C 242,376 246,356 244,336
        C 240,296 226,258 200,230
        C 188,216 174,204 160,196
        C 172,184 180,168 180,150
        C 180,138 188,122 188,100
        C 188,78 178,60 160,60
        Z
    `

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 300 600"
                preserveAspectRatio="xMidYMid slice"
            >
                {/* Upper body / posture guide */}
                <Path
                    d={step === "front" ? frontOutlinePath : sideOutlinePath}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Foot placement guide */}
                <G>
                    <Ellipse
                        cx={150}
                        cy={520}
                        rx={110}
                        ry={38}
                        stroke={footGuideColor}
                        strokeWidth={8}
                        fill="none"
                    />
                    {/* Left footprint */}
                    <Path
                        d="M115,500 C108,505 106,514 109,523 C111,530 118,536 118,543 C118,550 111,553 111,558 C111,563 116,565 121,563 C127,561 130,552 129,543 C128,533 132,524 130,514 C128,505 122,498 115,500 Z"
                        fill="#FFFFFF"
                    />
                    {/* Right footprint */}
                    <Path
                        d="M185,500 C192,505 194,514 191,523 C189,530 182,536 182,543 C182,550 189,553 189,558 C189,563 184,565 179,563 C173,561 170,552 171,543 C172,533 168,524 170,514 C172,505 178,498 185,500 Z"
                        fill="#FFFFFF"
                    />
                </G>
            </Svg>
        </View>
    )
}

export default Bodyoutlineoverlay