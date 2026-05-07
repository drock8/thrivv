import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { ProgressRing } from './ProgressRing';
import { MAX_HOURS_PER_WEEK_INDIVIDUAL, MAX_ZZZS_PER_WEEK_INDIVIDUAL } from '../../lib/zzzScoring';

type Props = {
  name: string;
  avatar: ImageSourcePropType;
  hours: number;
  zzzs: number;
  streakNights: number;
  isYou?: boolean;
};

export function TeammateCard({ name, avatar, hours, zzzs, streakNights, isYou }: Props) {
  const hoursPct = hours / MAX_HOURS_PER_WEEK_INDIVIDUAL;
  const zzzsPct = zzzs / MAX_ZZZS_PER_WEEK_INDIVIDUAL;
  const outerPctDisplay = Math.round(zzzsPct * 100);

  const ringSize = isYou ? 99 : 81;
  const avatarSize = isYou ? 60 : 50;
  const outerStroke = isYou ? 4.5 : 3.5;
  const innerStroke = isYou ? 3 : 2.5;
  const ringGap = isYou ? 5 : 4;

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {/* Name */}
      <Text
        style={{
          fontSize: isYou ? 14 : 12,
          fontWeight: '500',
          color: isYou ? '#5EBFB5' : '#F5F2EA',
          marginBottom: 4,
        }}
      >
        {name}
      </Text>

      {/* Avatar with double ring */}
      <ProgressRing
        size={ringSize}
        innerProgress={hoursPct}
        outerProgress={zzzsPct}
        innerStroke={innerStroke}
        outerStroke={outerStroke}
        gap={ringGap}
      >
        <Image
          source={avatar}
          style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
        />
      </ProgressRing>

      {/* Percentage */}
      <Text className="text-foreground" style={{ fontSize: isYou ? 24 : 20, fontWeight: '500', marginTop: 4 }}>
        {outerPctDisplay}%
      </Text>

      {/* Score */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 1 }}>
        <Text className="text-primary" style={{ fontSize: 11, fontWeight: '500' }}>
          {zzzs}
        </Text>
        <Text className="text-muted" style={{ fontSize: 11 }}>
          {' '}/ {MAX_ZZZS_PER_WEEK_INDIVIDUAL}
        </Text>
      </View>
      <Text className="text-muted" style={{ fontSize: 9, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 1 }}>
        ZZZ Score
      </Text>

      {/* Streak dots — no text label */}
      <View style={{ flexDirection: 'row', marginTop: 6, gap: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const active = i < streakNights;
          return (
            <View
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: active ? '#5EBFB5' : 'transparent',
                borderWidth: active ? 0 : 1,
                borderColor: active ? undefined : '#5EBFB5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {active && (
                <Text style={{ fontSize: 7, color: '#0A0A0A' }}>✓</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
