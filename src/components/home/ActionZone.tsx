import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { Moon, Sun, Flame, Activity, Clock, TrendingUp } from 'lucide-react-native';
import { useNow } from '../../lib/demoClock';

const SLEEP_STATE_KEY = 'thrivv.sleep.state';
const TARGET_BEDTIME_HOUR = 22;
const TARGET_BEDTIME_MIN = 45;
const WIND_DOWN_HOURS = 3;

type SleepState = 'awake' | 'sleeping';

type Props = {
  onSleepAction?: (state: SleepState) => Promise<void>;
};

export function ActionZone({ onSleepAction }: Props) {
  const now = useNow();
  const [sleepState, setSleepState] = useState<SleepState>('awake');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SLEEP_STATE_KEY).then(val => {
      if (val === 'sleeping') setSleepState('sleeping');
      setLoaded(true);
    });
  }, []);

  const handlePress = async () => {
    setLoading(true);
    const newState: SleepState = sleepState === 'awake' ? 'sleeping' : 'awake';
    try {
      if (onSleepAction) await onSleepAction(newState);
      await AsyncStorage.setItem(SLEEP_STATE_KEY, newState);
      setSleepState(newState);
    } catch {}
    setLoading(false);
  };

  // Countdown calc using demo clock
  const bedtime = new Date(now);
  bedtime.setHours(TARGET_BEDTIME_HOUR, TARGET_BEDTIME_MIN, 0, 0);
  if (bedtime.getTime() < now.getTime() - 12 * 60 * 60 * 1000) {
    bedtime.setDate(bedtime.getDate() + 1);
  }

  const diffMs = bedtime.getTime() - now.getTime();
  const totalSecondsLeft = Math.max(0, Math.floor(diffMs / 1000));
  const countdownHrs = Math.floor(totalSecondsLeft / 3600);
  const countdownMins = Math.floor((totalSecondsLeft % 3600) / 60);

  const windDownTotalSec = WIND_DOWN_HOURS * 3600;
  const elapsedInWindDown = windDownTotalSec - totalSecondsLeft;
  const ringProgress = Math.min(Math.max(elapsedInWindDown / windDownTotalSec, 0), 1);

  // Ring color based on phase
  let ringColor = '#B8D4C9'; // Eucalyptus
  if (totalSecondsLeft <= 3600) ringColor = '#E89B7E'; // Coral
  if (totalSecondsLeft <= 0) ringColor = '#C45A3D'; // Brick

  const ringSize = 180;
  const strokeWidth = 10;
  const center = ringSize / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const dashLen = circumference * ringProgress;

  const bedtimeStr = `${TARGET_BEDTIME_HOUR > 12 ? TARGET_BEDTIME_HOUR - 12 : TARGET_BEDTIME_HOUR}:${String(TARGET_BEDTIME_MIN).padStart(2, '0')} PM`;

  if (!loaded) return null;

  return (
    <View className="bg-surface rounded-2xl p-4 mx-4">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Left stat: Last Night */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Clock size={24} color="#E89B7E" />
          <Text className="text-muted" style={{ fontSize: 10, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 4 }}>
            Last Night
          </Text>
          <Text className="text-foreground" style={{ fontSize: 18, fontWeight: '500' }}>
            7h 42m
          </Text>
          <Text className="text-primary" style={{ fontSize: 11 }}>
            Good Sleep
          </Text>
        </View>

        {/* Center: countdown ring */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#E89B7E', fontSize: 13, fontWeight: '500', marginBottom: 4 }}>
            Bed by {bedtimeStr}
          </Text>
          <Text className="text-muted" style={{ fontSize: 10, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
            Time to Bed
          </Text>

          <View style={{ width: ringSize, height: ringSize }}>
            <Svg width={ringSize} height={ringSize}>
              {/* Track */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#2A2A2A"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={ringColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                strokeDashoffset={circumference * 0.25}
                strokeLinecap="round"
                rotation={-90}
                origin={`${center}, ${center}`}
              />
            </Svg>
            {/* Clock face overlay */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Text className="text-foreground" style={{ fontSize: 48, fontWeight: '500', fontVariant: ['tabular-nums'] }}>
                {String(countdownHrs).padStart(2, '0')}:{String(countdownMins).padStart(2, '0')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 24 }}>
                <Text className="text-muted" style={{ fontSize: 10, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Hrs
                </Text>
                <Text className="text-muted" style={{ fontSize: 10, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Mins
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right stat: Average Sleep */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <TrendingUp size={24} color="#E89B7E" />
          <Text className="text-muted" style={{ fontSize: 10, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 4 }}>
            Average Sleep
          </Text>
          <Text className="text-foreground" style={{ fontSize: 18, fontWeight: '500' }}>
            7h 12m
          </Text>
          <Text className="text-primary" style={{ fontSize: 11 }}>
            Good
          </Text>
        </View>
      </View>

      {/* Bottom row: Streak + Action Button + Consistency */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
        {/* Left: Streak */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Flame size={24} color="#E89B7E" />
          <Text className="text-muted" style={{ fontSize: 10, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 4 }}>
            Streak
          </Text>
          <Text className="text-foreground" style={{ fontSize: 16, fontWeight: '500' }}>
            5 Nights
          </Text>
          <Text className="text-primary" style={{ fontSize: 11 }}>
            Keep it up!
          </Text>
        </View>

        {/* Center: Action Button */}
        <TouchableOpacity
          onPress={handlePress}
          disabled={loading}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#E89B7E',
            borderRadius: 999,
            paddingVertical: 16,
            paddingHorizontal: 28,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0A" />
          ) : sleepState === 'awake' ? (
            <>
              <Moon size={20} color="#0A0A0A" />
              <Text style={{ color: '#0A0A0A', fontSize: 14, fontWeight: '500' }}>
                I'M GOING{'\n'}TO SLEEP
              </Text>
            </>
          ) : (
            <>
              <Sun size={20} color="#0A0A0A" />
              <Text style={{ color: '#0A0A0A', fontSize: 14, fontWeight: '500' }}>
                I'M WAKING{'\n'}UP
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Right: Consistency */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Activity size={24} color="#5EBFB5" />
          <Text className="text-muted" style={{ fontSize: 10, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 4 }}>
            Consistency
          </Text>
          <Text className="text-foreground" style={{ fontSize: 16, fontWeight: '500' }}>
            87%
          </Text>
          <Text className="text-primary" style={{ fontSize: 11 }}>
            On Track
          </Text>
        </View>
      </View>
    </View>
  );
}
