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

      {/* Hours (inner ring label) */}
      <Text style={{ fontSize: 9, fontWeight: '500', color: '#B8D4C9', marginTop: 2 }}>
        {hours}h / {MAX_HOURS_PER_WEEK_INDIVIDUAL}h
      </Text>

      {/* Percentage */}
      <Text className="text-foreground" style={{ fontSize: isYou ? 22 : 18, fontWeight: '500', marginTop: 2 }}>
        {outerPctDisplay}%
      </Text>

      {/* Score */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 1 }}>
        <Text className="text-primary" style={{ fontSize: 10, fontWeight: '500' }}>
          {zzzs}
        </Text>
        <Text className="text-muted" style={{ fontSize: 10 }}>
          {' '}/ {MAX_ZZZS_PER_WEEK_INDIVIDUAL}
        </Text>
      </View>
      <Text className="text-muted" style={{ fontSize: 8, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 1 }}>
        ZZZ Score
      </Text>

      {/* Streak pill — 7 circles, active ones merged into pill with number */}
      <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
        {streakNights > 0 && (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#5EBFB5',
              borderRadius: 7,
              paddingHorizontal: 5,
              paddingVertical: 2,
              alignItems: 'center',
              gap: 2,
            }}
          >
            {Array.from({ length: Math.max(streakNights - 1, 0) }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: '#0A0A0A',
                }}
              />
            ))}
            <Text style={{ fontSize: 9, fontWeight: '700', color: '#0A0A0A' }}>
              {streakNights}
            </Text>
          </View>
        )}
        {Array.from({ length: 7 - streakNights }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: 2.5,
              borderWidth: 1,
              borderColor: '#5EBFB5',
              marginLeft: 3,
            }}
          />
        ))}
      </View>
    </View>
  );
}
