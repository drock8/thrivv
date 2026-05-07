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
    <View className="bg-surface rounded-2xl mx-4" style={{ padding: 12 }}>
      <View style={{ flexDirection: 'row' }}>
        {/* Left: avatar with double ring */}
        <ProgressRing
          size={100}
          innerProgress={hoursPct}
          outerProgress={zzzsPct}
          innerStroke={3}
          outerStroke={5}
          gap={5}
        >
          <Image
            source={teamAvatar}
            style={{ width: 62, height: 62, borderRadius: 31 }}
          />
        </ProgressRing>

        {/* Right: stats */}
        <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text className="text-foreground" style={{ fontSize: 17, fontWeight: '500' }}>
              {teamName}
            </Text>
            <Pencil size={12} color="#6B6760" style={{ marginLeft: 6 }} />
          </View>

          <Text className="text-muted" style={{ fontSize: 10, fontWeight: '500', letterSpacing: 0.5, marginTop: 4, textTransform: 'uppercase' }}>
            Team Score
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text className="text-foreground" style={{ fontSize: 32, fontWeight: '500' }}>
              {teamZzzs}
            </Text>
            <Text className="text-muted" style={{ fontSize: 14, marginLeft: 4 }}>
              / {MAX_ZZZS_PER_WEEK_TEAM}
            </Text>
          </View>

          <Text className="text-primary" style={{ fontSize: 12, marginTop: 1 }}>
            {weeklyPct}% of weekly target
          </Text>

          {/* Streak pill */}
          <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#5EBFB5',
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 4,
                alignItems: 'center',
                gap: 6,
              }}
            >
              {DAYS.slice(0, filledDays).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#0A0A0A',
                  }}
                />
              ))}
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#0A0A0A', marginLeft: 2 }}>
                STREAK {streakNights} DAYS
              </Text>
            </View>
            {DAYS.slice(filledDays).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: '#5EBFB5',
                  marginLeft: 4,
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
