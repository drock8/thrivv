import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { Moon, Sun, Flame, Activity, Clock, TrendingUp } from 'lucide-react-native';
import { useNow } from '../../lib/demoClock';

const SLEEP_STATE_KEY = 'thrivv.sleep.state';
const SLEEP_START_KEY = 'thrivv.sleep.startTime';
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
  const [sleepStartMs, setSleepStartMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showWakeModal, setShowWakeModal] = useState(false);
  const [sleepDurationMs, setSleepDurationMs] = useState(0);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SLEEP_STATE_KEY),
      AsyncStorage.getItem(SLEEP_START_KEY),
    ]).then(([state, startStr]) => {
      if (state === 'sleeping') setSleepState('sleeping');
      if (startStr) setSleepStartMs(Number(startStr));
      setLoaded(true);
    });
  }, []);

  const handleGoToSleep = async () => {
    const startMs = now.getTime();
    await AsyncStorage.setItem(SLEEP_STATE_KEY, 'sleeping');
    await AsyncStorage.setItem(SLEEP_START_KEY, String(startMs));
    setSleepStartMs(startMs);
    setSleepState('sleeping');
  };

  const handleWakeUp = () => {
    const duration = sleepStartMs ? now.getTime() - sleepStartMs : 0;
    setSleepDurationMs(duration);
    setShowWakeModal(true);
  };

  const handleConfirmWake = async () => {
    setLoading(true);
    setShowWakeModal(false);
    try {
      if (onSleepAction) await onSleepAction('awake');
      await AsyncStorage.setItem(SLEEP_STATE_KEY, 'awake');
      await AsyncStorage.removeItem(SLEEP_START_KEY);
      setSleepState('awake');
      setSleepStartMs(null);
    } catch {}
    setLoading(false);
  };

  const handlePress = () => {
    if (sleepState === 'awake') {
      handleGoToSleep();
    } else {
      handleWakeUp();
    }
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
  const inWindDown = totalSecondsLeft <= windDownTotalSec && totalSecondsLeft > 0;

  const elapsedInWindDown = windDownTotalSec - totalSecondsLeft;
  const ringProgress = inWindDown ? Math.min(elapsedInWindDown / windDownTotalSec, 1) : 0;

  let ringColor = '#B8D4C9';
  if (inWindDown && totalSecondsLeft <= 3600) ringColor = '#E89B7E';
  if (totalSecondsLeft <= 0) ringColor = '#C45A3D';

  // Sleep elapsed timer
  const sleepElapsedSec = sleepStartMs ? Math.max(0, Math.floor((now.getTime() - sleepStartMs) / 1000)) : 0;
  const sleepHrs = Math.floor(sleepElapsedSec / 3600);
  const sleepMins = Math.floor((sleepElapsedSec % 3600) / 60);

  // Wake modal duration
  const wakeHrs = Math.floor(sleepDurationMs / 3600000);
  const wakeMins = Math.floor((sleepDurationMs % 3600000) / 60000);

  const ringSize = 140;
  const strokeWidth = 8;
  const center = ringSize / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const dashLen = circumference * ringProgress;

  const bedtimeStr = `${TARGET_BEDTIME_HOUR > 12 ? TARGET_BEDTIME_HOUR - 12 : TARGET_BEDTIME_HOUR}:${String(TARGET_BEDTIME_MIN).padStart(2, '0')} PM`;

  if (!loaded) return null;

  return (
    <View className="bg-surface rounded-2xl mx-4" style={{ padding: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Left stat: Last Night */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Clock size={20} color="#E89B7E" />
          <Text className="text-muted" style={{ fontSize: 9, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 3 }}>
            Last Night
          </Text>
          <Text className="text-foreground" style={{ fontSize: 15, fontWeight: '500' }}>
            7h 42m
          </Text>
          <Text className="text-primary" style={{ fontSize: 10 }}>
            Good Sleep
          </Text>
        </View>

        {/* Center: countdown ring or sleep timer */}
        <View style={{ alignItems: 'center' }}>
          {sleepState === 'sleeping' ? (
            <View style={{ width: ringSize, height: ringSize }}>
              <Svg width={ringSize} height={ringSize}>
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="#2A2A2A"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="#5EBFB5"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${circumference * 0.15} ${circumference * 0.05}`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  rotation={-90 + (sleepElapsedSec % 60) * 6}
                  origin={`${center}, ${center}`}
                />
              </Svg>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#5EBFB5', fontSize: 10, fontWeight: '500', marginBottom: 2 }}>
                  Sleeping...
                </Text>
                <Text className="text-foreground" style={{ fontSize: 32, fontWeight: '500', fontVariant: ['tabular-nums'] }}>
                  {String(sleepHrs).padStart(2, '0')}:{String(sleepMins).padStart(2, '0')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 18 }}>
                  <Text className="text-muted" style={{ fontSize: 8, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Hrs
                  </Text>
                  <Text className="text-muted" style={{ fontSize: 8, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Mins
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ width: ringSize, height: ringSize }}>
              <Svg width={ringSize} height={ringSize}>
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="#2A2A2A"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {inWindDown && (
                  <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    rotation={-90}
                    origin={`${center}, ${center}`}
                  />
                )}
              </Svg>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text className="text-foreground" style={{ fontSize: 32, fontWeight: '500', fontVariant: ['tabular-nums'] }}>
                  {String(countdownHrs).padStart(2, '0')}:{String(countdownMins).padStart(2, '0')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 18 }}>
                  <Text className="text-muted" style={{ fontSize: 8, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Hrs
                  </Text>
                  <Text className="text-muted" style={{ fontSize: 8, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Mins
                  </Text>
                </View>
                <Text style={{ color: '#E89B7E', fontSize: 10, fontWeight: '500', marginTop: 2 }}>
                  Bed by {bedtimeStr}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Right stat: Average Sleep */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <TrendingUp size={20} color="#E89B7E" />
          <Text className="text-muted" style={{ fontSize: 9, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 3 }}>
            Average
          </Text>
          <Text className="text-foreground" style={{ fontSize: 15, fontWeight: '500' }}>
            7h 12m
          </Text>
          <Text className="text-primary" style={{ fontSize: 10 }}>
            Good
          </Text>
        </View>
      </View>

      {/* Bottom row: Streak + Action Button + Consistency */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        {/* Left: Streak */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Flame size={20} color="#E89B7E" />
          <Text className="text-muted" style={{ fontSize: 9, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 3 }}>
            Streak
          </Text>
          <Text className="text-foreground" style={{ fontSize: 14, fontWeight: '500' }}>
            5 Nights
          </Text>
        </View>

        {/* Center: Action Button */}
        <TouchableOpacity
          onPress={handlePress}
          disabled={loading}
          activeOpacity={0.8}
          style={{
            backgroundColor: sleepState === 'awake' ? '#E89B7E' : '#5EBFB5',
            borderRadius: 999,
            paddingVertical: 12,
            paddingHorizontal: 22,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0A" />
          ) : sleepState === 'awake' ? (
            <>
              <Moon size={18} color="#0A0A0A" />
              <Text style={{ color: '#0A0A0A', fontSize: 12, fontWeight: '600' }}>
                I'M GOING{'\n'}TO SLEEP
              </Text>
            </>
          ) : (
            <>
              <Sun size={18} color="#0A0A0A" />
              <Text style={{ color: '#0A0A0A', fontSize: 12, fontWeight: '600' }}>
                I'M WAKING{'\n'}UP
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Right: Consistency */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Activity size={20} color="#5EBFB5" />
          <Text className="text-muted" style={{ fontSize: 9, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 3 }}>
            Consistency
          </Text>
          <Text className="text-foreground" style={{ fontSize: 14, fontWeight: '500' }}>
            87%
          </Text>
        </View>
      </View>

      {/* Wake-up confirmation modal */}
      <Modal
        visible={showWakeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWakeModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#171717', borderRadius: 20, padding: 28, alignItems: 'center', marginHorizontal: 32 }}>
            <Sun size={36} color="#E89B7E" />
            <Text style={{ color: '#F5F2EA', fontSize: 22, fontWeight: '500', marginTop: 12 }}>
              Good Morning!
            </Text>
            <Text style={{ color: '#6B6760', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              You slept for
            </Text>
            <Text style={{ color: '#5EBFB5', fontSize: 40, fontWeight: '500', marginTop: 4, fontVariant: ['tabular-nums'] }}>
              {wakeHrs}h {wakeMins}m
            </Text>
            <TouchableOpacity
              onPress={handleConfirmWake}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#E89B7E',
                borderRadius: 999,
                paddingVertical: 14,
                paddingHorizontal: 32,
                marginTop: 20,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#0A0A0A" />
              ) : (
                <Text style={{ color: '#0A0A0A', fontSize: 14, fontWeight: '600' }}>
                  CONFIRM & LOG SLEEP
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowWakeModal(false)}
              style={{ marginTop: 12 }}
            >
              <Text style={{ color: '#6B6760', fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
