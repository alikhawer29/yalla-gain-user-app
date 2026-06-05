import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import colors from '../../utils/colors';

type IconProps = {
  size?: number;
  color?: string;
};

const DEFAULT_SIZE = 26;

export const MicIcon = ({
  size = DEFAULT_SIZE,
  color = colors.white,
  muted = false,
}: IconProps & { muted?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={9} y={2} width={6} height={11} rx={3} stroke={color} strokeWidth={1.8} />
    <Path
      d="M5 11a7 7 0 0 0 14 0"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Line x1={12} y1={18} x2={12} y2={21} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1={8} y1={21} x2={16} y2={21} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    {muted ? (
      <Line x1={4} y1={4} x2={20} y2={20} stroke={color} strokeWidth={2} strokeLinecap="round" />
    ) : null}
  </Svg>
);

export const CameraIcon = ({
  size = DEFAULT_SIZE,
  color = colors.white,
  off = false,
}: IconProps & { off?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8h3l2-3h6l2 3h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={14} r={3.5} stroke={color} strokeWidth={1.8} />
    {off ? (
      <Line x1={3} y1={3} x2={21} y2={21} stroke={color} strokeWidth={2} strokeLinecap="round" />
    ) : null}
  </Svg>
);

export const SpeakerIcon = ({
  size = DEFAULT_SIZE,
  color = colors.white,
  on = true,
}: IconProps & { on?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 10v4h4l5 4V6L8 10H4z" fill={color} />
    {on ? (
      <>
        <Path
          d="M16 9a4 4 0 0 1 0 6"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Path
          d="M18 7a7 7 0 0 1 0 10"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </>
    ) : (
      <Line x1={18} y1={8} x2={22} y2={16} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    )}
  </Svg>
);

export const FlipCameraIcon = ({
  size = 20,
  color = colors.white,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 7h10l-2-2M17 17H7l2 2"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 7v4a5 5 0 0 0 5 5M17 17v-4a5 5 0 0 0-5-5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const DragHandleIcon = ({
  size = 14,
  color = colors.icon_gray,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={8} cy={6} r={1.5} fill={color} />
    <Circle cx={16} cy={6} r={1.5} fill={color} />
    <Circle cx={8} cy={12} r={1.5} fill={color} />
    <Circle cx={16} cy={12} r={1.5} fill={color} />
    <Circle cx={8} cy={18} r={1.5} fill={color} />
    <Circle cx={16} cy={18} r={1.5} fill={color} />
  </Svg>
);
