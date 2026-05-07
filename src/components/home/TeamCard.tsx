import React from 'react';
import { View, Text, Image } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { ProgressRing } from './ProgressRing';
import { MAX_HOURS_PER_WEEK_TEAM, MAX_ZZZS_PER_WEEK_TEAM } from '../../lib/zzzScoring';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type Props = {
  teamName: string;
  teamAvatar: any;
  teamZzzs: number;
  teamHours: number;
  streakNights: number;
  filledDays: number;
};

export function TeamCard({
  teamName,
  teamAvatar,
  teamZzzs,
  teamHours,
  streakNights,
  filledDays,
}: Props) {
  const hoursPct = teamHours / MAX_HOURS_PER_WEEK_TEAM;
  const zzzsPct = teamZzzs / MAX_ZZZS_PER_WEEK_TEAM;
  const weeklyPct = Math.round(zzzsPct * 100);

  return (
    <View className="bg-surface rounded-2xl p-4 mx-4">
      <View style={{ flexDirection: 'row' }}>
        {/* Left: avatar with double ring */}
        <ProgressRing
          size={140}
          innerProgress={hoursPct}
          outerProgress={zzzsPct}
          innerStroke={4}
          outerStroke={6}
          gap={8}
        >
          <Image
            source={teamAvatar}
            style={{ width: 90, height: 90, borderRadius: 45 }}
          />
        </ProgressRing>

        {/* Right: stats */}
        <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text className="text-foreground" style={{ fontSize: 20, fontWeight: '500' }}>
              {teamName}
            </Text>
            <Pencil size={14} color="#6B6760" style={{ marginLeft: 6 }} />
          </View>

          <Text className="text-muted" style={{ fontSize: 11, fontWeight: '500', letterSpacing: 0.5, marginTop: 8, textTransform: 'uppercase' }}>
            Team Score
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text className="text-foreground" style={{ fontSize: 40, fontWeight: '500' }}>
              {teamZzzs}
            </Text>
            <Text className="text-muted" style={{ fontSize: 18, marginLeft: 4 }}>
              / {MAX_ZZZS_PER_WEEK_TEAM}
            </Text>
          </View>

          <Text className="text-primary" style={{ fontSize: 13, marginTop: 2 }}>
            {weeklyPct}% of weekly target
          </Text>

          {/* Day dots */}
          <View style={{ flexDirection: 'row', marginTop: 10, gap: 6 }}>
            {DAYS.map((day, i) => {
              const filled = i < filledDays;
              return (
                <View
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: filled ? '#5EBFB5' : 'transparent',
                    borderWidth: filled ? 0 : 1.5,
                    borderColor: '#5EBFB5',
                    borderStyle: filled ? 'solid' : 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '500',
                      color: filled ? '#0A0A0A' : '#5EBFB5',
                    }}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Streak */}
          <Text className="text-foreground" style={{ fontSize: 13, fontWeight: '500', marginTop: 10, letterSpacing: 0.5 }}>
            TEAM STREAK: {streakNights} NIGHTS 🔥
          </Text>
        </View>
      </View>
    </View>
  );
}
