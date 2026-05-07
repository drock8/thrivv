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

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {/* Name */}
      <Text
        style={{
          fontSize: 15,
          fontWeight: '500',
          color: isYou ? '#5EBFB5' : '#F5F2EA',
          marginBottom: 8,
        }}
      >
        {name}
      </Text>

      {/* Avatar with double ring */}
      <ProgressRing
        size={110}
        innerProgress={hoursPct}
        outerProgress={zzzsPct}
        innerStroke={3}
        outerStroke={5}
        gap={6}
      >
        <Image
          source={avatar}
          style={{ width: 68, height: 68, borderRadius: 34 }}
        />
      </ProgressRing>

      {/* Percentage */}
      <Text className="text-foreground" style={{ fontSize: 28, fontWeight: '500', marginTop: 8 }}>
        {outerPctDisplay}%
      </Text>

      {/* Score */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
        <Text className="text-primary" style={{ fontSize: 13, fontWeight: '500' }}>
          {zzzs}
        </Text>
        <Text className="text-muted" style={{ fontSize: 13 }}>
          {' '}/ {MAX_ZZZS_PER_WEEK_INDIVIDUAL}
        </Text>
      </View>
      <Text className="text-muted" style={{ fontSize: 10, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2 }}>
        ZZZ Score
      </Text>

      {/* Streak */}
      <Text className="text-foreground" style={{ fontSize: 12, fontWeight: '500', marginTop: 8 }}>
        {streakNights} NIGHT STREAK
      </Text>
      <View style={{ flexDirection: 'row', marginTop: 4, gap: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const active = i < streakNights;
          return (
            <View
              key={i}
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: active ? '#5EBFB5' : 'transparent',
                borderWidth: active ? 0 : 1.5,
                borderColor: active ? undefined : '#5EBFB5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {active && (
                <Text style={{ fontSize: 11, color: '#0A0A0A' }}>✓</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
