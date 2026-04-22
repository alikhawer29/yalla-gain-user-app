import React from 'react';
import { View, StyleSheet, ColorValue } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { font } from '../../utils/helper';
import Text from '../Text';
import colors from '../../utils/colors';

interface ICircularProgress {
    size: number;
    strokeWidth: number;
    progress: number;
    color?: string;
    backgroundColor?: string;
    children?: React.ReactNode;
}

const CircularProgress: React.FC<ICircularProgress> = ({
    size,
    strokeWidth,
    progress,
    color = colors.primary,
    backgroundColor = colors.gray + '33', // 20% opacity
    children
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    stroke={backgroundColor}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                {/* Progress Circle */}
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
