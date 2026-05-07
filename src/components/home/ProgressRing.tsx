import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  size: number;
  innerProgress: number; // 0–1
  outerProgress: number; // 0–1
  innerColor?: string;
  outerColor?: string;
  innerStroke?: number;
  outerStroke?: number;
  gap?: number;
  children?: React.ReactNode;
};

export function ProgressRing({
  size,
  innerProgress,
  outerProgress,
  innerColor = '#B8D4C9',
  outerColor = '#5EBFB5',
  innerStroke = 4,
  outerStroke = 6,
  gap = 8,
  children,
}: Props) {
  const center = size / 2;
  const outerRadius = center - outerStroke / 2;
  const innerRadius = outerRadius - outerStroke / 2 - gap - innerStroke / 2;

  const outerCircum = 2 * Math.PI * outerRadius;
  const innerCircum = 2 * Math.PI * innerRadius;

  const outerDash = outerCircum * Math.min(Math.max(outerProgress, 0), 1);
  const innerDash = innerCircum * Math.min(Math.max(innerProgress, 0), 1);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Outer track */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke="#2A2A2A"
          strokeWidth={outerStroke}
          fill="none"
        />
        {/* Outer progress — starts at 12 o'clock */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke={outerColor}
          strokeWidth={outerStroke}
          fill="none"
          strokeDasharray={`${outerDash} ${outerCircum - outerDash}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
        {/* Inner track */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          stroke="#2A2A2A"
          strokeWidth={innerStroke}
          fill="none"
        />
        {/* Inner progress — starts at 12 o'clock */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          stroke={innerColor}
          strokeWidth={innerStroke}
          fill="none"
          strokeDasharray={`${innerDash} ${innerCircum - innerDash}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      {children && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}
