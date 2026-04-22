import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import colors from '../../utils/colors';

interface ICircularProgress {
    size: number;
    strokeWidth: number;
    progress: number;
    color?: string;
    /** Full ring track (always visible at 0% so the bar shows empty, then fills). */
    backgroundColor?: string;
    children?: React.ReactNode;
}

const DEFAULT_TRACK = 'rgba(153, 153, 153, 0.45)';

const CircularProgress: React.FC<ICircularProgress> = ({
    size,
    strokeWidth,
    progress,
    color = colors.primary,
    backgroundColor = DEFAULT_TRACK,
    children
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const clamped = Math.min(100, Math.max(0, Number.isFinite(progress) ? progress : 0));
    const strokeDashoffset = circumference - (clamped / 100) * circumference;
    const showFill = clamped > 0;

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size}>
                {/* Track: always visible so 0% = empty ring, not missing ring */}
                <Circle
                    stroke={backgroundColor}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                {/* Fill arc only when progress &gt; 0 (avoids round-cap dot at 0%) */}
                {showFill ? (
                    <Circle
                        stroke={color}
                        fill="none"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                ) : null}
            </Svg>
            {children && (
                <View style={StyleSheet.absoluteFillObject}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        {children}
                    </View>
                </View>
            )}
        </View>
    );
};

export default CircularProgress;
