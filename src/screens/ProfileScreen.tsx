import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageSourcePropType, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Camera, ChevronUp, ChevronDown, Moon, Zap, Users, Flame, Trophy, Star, Wallet, LogOut, Copy } from 'lucide-react-native';
import { useAuth } from '../utils/useAuth';
import { useBedtime, saveBedtime } from '../lib/bedtimeStore';
import {
  TARGET_HOURS,
  HOURS_CAP,
  TARGET_BONUS,
  TRIBE_MULTIPLIER,
  STREAK_3_BONUS,
  STREAK_5_BONUS,
  STREAK_7_NIGHT_MULTIPLIER,
} from '../lib/zzzScoring';

const AVATAR_KEY = 'thrivv.profile.avatarChoice';

const AVATAR_OPTIONS: { key: string; source: ImageSourcePropType }[] = [
  { key: 'you', source: require('../../assets/avatars/you.png') },
  { key: 'anatoly', source: require('../../assets/avatars/anatoly.png') },
  { key: 'satoshi', source: require('../../assets/avatars/satoshi.png') },
  { key: 'sleep-seekers', source: require('../../assets/avatars/sleep-seekers.png') },
];

function formatTime(hour: number, min: number): string {
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const amPm = hour >= 12 ? 'PM' : 'AM';
  return `${h}:${String(min).padStart(2, '0')} ${amPm}`;
}

function addMinutes(hour: number, min: number, delta: number): { hour: number; min: number } {
  let total = hour * 60 + min + delta;
  if (total < 0) total += 24 * 60;
  total = total % (24 * 60);
  return { hour: Math.floor(total / 60), min: total % 60 };
}

function ellipsify(str: string, maxLen = 12) {
  if (str.length <= maxLen) return str;
  return str.slice(0, 6) + '...' + str.slice(-4);
}

export function ProfileScreen() {
  const { selectedAccount, user, logout } = useAuth();
  const bedtime = useBedtime();
  const [selectedAvatar, setSelectedAvatar] = useState('you');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(AVATAR_KEY).then(key => {
      if (key) setSelectedAvatar(key);
    });
  }, []);

  const pickAvatar = async (key: string) => {
    setSelectedAvatar(key);
    setShowPicker(false);
    await AsyncStorage.setItem(AVATAR_KEY, key);
  };

  const currentAvatar = AVATAR_OPTIONS.find(a => a.key === selectedAvatar) ?? AVATAR_OPTIONS[0];

  const adjustBedtime = (delta: number) => {
    const next = addMinutes(bedtime.hour, bedtime.min, delta);
    saveBedtime(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>

        {/* Profile Photo */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity onPress={() => setShowPicker(!showPicker)} activeOpacity={0.8}>
            <View style={{ width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#5EBFB5', overflow: 'hidden' }}>
              <Image
                source={currentAvatar.source}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            <View style={{
              position: 'absolute', bottom: 0, right: 0,
              backgroundColor: '#E89B7E', width: 34, height: 34, borderRadius: 17,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 3, borderColor: '#0A0A0A',
            }}>
              <Camera size={16} color="#0A0A0A" />
            </View>
          </TouchableOpacity>
          <Text style={{ color: '#F5F2EA', fontSize: 20, fontWeight: '600', marginTop: 14 }}>
            Your Profile
          </Text>

          {/* Avatar picker */}
          {showPicker && (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              {AVATAR_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.key} onPress={() => pickAvatar(opt.key)} activeOpacity={0.7}>
                  <View style={{
                    width: 56, height: 56, borderRadius: 28, overflow: 'hidden',
                    borderWidth: 2, borderColor: opt.key === selectedAvatar ? '#5EBFB5' : '#2A2A2A',
                  }}>
                    <Image source={opt.source} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Wallet Address */}
        {selectedAccount && (
          <View style={{
            backgroundColor: '#171717', borderRadius: 16, marginHorizontal: 16, padding: 20, marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Wallet size={20} color="#5EBFB5" />
              <Text style={{ color: '#F5F2EA', fontSize: 16, fontWeight: '600', marginLeft: 10 }}>
                Solana Wallet
              </Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                await Clipboard.setStringAsync(selectedAccount.publicKey.toBase58());
                Alert.alert('Copied', 'Wallet address copied to clipboard');
              }}
              activeOpacity={0.7}
              style={{
                backgroundColor: '#0A0A0A', borderRadius: 12, padding: 14,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                borderWidth: 1, borderColor: '#2A2A2A',
              }}
            >
              <Text style={{ color: '#F5F2EA', fontSize: 14, fontFamily: 'monospace' }}>
                {ellipsify(selectedAccount.publicKey.toBase58(), 20)}
              </Text>
              <Copy size={16} color="#6B6760" />
            </TouchableOpacity>
            <Text style={{ color: '#6B6760', fontSize: 12, marginTop: 8 }}>
              Tap to copy full address. Fund with devnet SOL for on-chain attestations.
            </Text>
          </View>
        )}

        {/* Sign Out */}
        <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: logout },
              ]);
            }}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#171717', borderRadius: 12, padding: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
              borderWidth: 1, borderColor: '#2A2A2A',
            }}
          >
            <LogOut size={18} color="#C45A3D" />
            <Text style={{ color: '#C45A3D', fontSize: 16, fontWeight: '500' }}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Bedtime Setting */}
        <View style={{
          backgroundColor: '#171717', borderRadius: 16, marginHorizontal: 16, padding: 20, marginBottom: 20,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Moon size={20} color="#E89B7E" />
            <Text style={{ color: '#F5F2EA', fontSize: 16, fontWeight: '600', marginLeft: 10 }}>
              Target Bedtime
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <TouchableOpacity
              onPress={() => adjustBedtime(-15)}
              style={{ backgroundColor: '#2A2A2A', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronDown size={22} color="#F5F2EA" />
            </TouchableOpacity>

            <View style={{ backgroundColor: '#0A0A0A', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, borderWidth: 1, borderColor: '#5EBFB5' }}>
              <Text style={{ color: '#5EBFB5', fontSize: 28, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
                {formatTime(bedtime.hour, bedtime.min)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => adjustBedtime(15)}
              style={{ backgroundColor: '#2A2A2A', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronUp size={22} color="#F5F2EA" />
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#6B6760', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
            Adjust in 15-minute increments
          </Text>
        </View>

        {/* Scoring Explainer */}
        <View style={{ marginHorizontal: 16 }}>
          <Text style={{ color: '#F5F2EA', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
            How ZZZ Points Work
          </Text>

          {/* Base scoring */}
          <ScoringCard
            icon={<Star size={18} color="#5EBFB5" />}
            title="Base Night Score"
            items={[
              `You earn 1 ZZZ per hour of sleep, capped at ${HOURS_CAP}h`,
              `Hit ${TARGET_HOURS}h+ and you get a +${TARGET_BONUS} ZZZ target bonus`,
              `Max solo night = ${HOURS_CAP + TARGET_BONUS} ZZZs`,
            ]}
            example={`Sleep 7h → ${HOURS_CAP} + ${TARGET_BONUS} bonus = ${HOURS_CAP + TARGET_BONUS} ZZZs`}
          />

          {/* Team multiplier */}
          <ScoringCard
            icon={<Users size={18} color="#5EBFB5" />}
            title="Tribe Multiplier"
            items={[
              `When ALL 3 tribe members hit ${TARGET_HOURS}h+ the same night, everyone's score is multiplied by ${TRIBE_MULTIPLIER}x`,
              `This is the biggest boost — coordination pays off`,
              `If even one member misses, the multiplier doesn't apply`,
            ]}
            example={`All 3 hit 7h → (${HOURS_CAP} + ${TARGET_BONUS}) × ${TRIBE_MULTIPLIER} = ${(HOURS_CAP + TARGET_BONUS) * TRIBE_MULTIPLIER} ZZZs each!`}
          />

          {/* Streak bonuses */}
          <ScoringCard
            icon={<Flame size={18} color="#E89B7E" />}
            title="Streak Bonuses"
            items={[
              `3-night streak: +${STREAK_3_BONUS} ZZZ bonus`,
              `5-night streak: +${STREAK_5_BONUS} ZZZ bonus`,
              `7-night (full week): ${STREAK_7_NIGHT_MULTIPLIER}x multiplier on the 7th night`,
              `Streaks are individual — your ${TARGET_HOURS}h+ nights in a row`,
            ]}
            example="Hit 7h for 5 nights straight → collect both the 3-night and 5-night bonuses"
          />

          {/* Weekly caps */}
          <ScoringCard
            icon={<Trophy size={18} color="#E89B7E" />}
            title="Weekly Maximums"
            items={[
              `Individual: up to 49h tracked, max 225 ZZZs per week`,
              `Team (3 members): up to 147h, max 675 ZZZs per week`,
              `Leaderboard resets every Monday at midnight`,
            ]}
          />

          {/* How it all adds up */}
          <View style={{
            backgroundColor: '#171717', borderRadius: 14, padding: 16, marginBottom: 16,
            borderWidth: 1, borderColor: '#5EBFB5',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Zap size={18} color="#5EBFB5" />
              <Text style={{ color: '#5EBFB5', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                Putting It All Together
              </Text>
            </View>
            <Text style={{ color: '#6B6760', fontSize: 13, lineHeight: 20 }}>
              Each night:{'\n'}
              {'  '}1. Hours capped at {HOURS_CAP}h{'\n'}
              {'  '}2. +{TARGET_BONUS} if you hit {TARGET_HOURS}h target{'\n'}
              {'  '}3. ×{TRIBE_MULTIPLIER} if all tribe members also hit target{'\n'}
              {'  '}4. Streak bonuses added on milestone nights{'\n\n'}
              The best single night you can have is a 7h sleep on a tribe night during a 7-night streak — that's{' '}
              <Text style={{ color: '#5EBFB5', fontWeight: '600' }}>
                {(HOURS_CAP + TARGET_BONUS) * TRIBE_MULTIPLIER * STREAK_7_NIGHT_MULTIPLIER} ZZZs
              </Text>{' '}
              in one night.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ScoringCard({ icon, title, items, example }: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  example?: string;
}) {
  return (
    <View style={{ backgroundColor: '#171717', borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        {icon}
        <Text style={{ color: '#F5F2EA', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
          {title}
        </Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 4, paddingRight: 8 }}>
          <Text style={{ color: '#5EBFB5', fontSize: 13, marginRight: 8 }}>•</Text>
          <Text style={{ color: '#6B6760', fontSize: 13, lineHeight: 19, flex: 1 }}>{item}</Text>
        </View>
      ))}
      {example && (
        <View style={{ backgroundColor: '#0A0A0A', borderRadius: 8, padding: 10, marginTop: 8 }}>
          <Text style={{ color: '#E89B7E', fontSize: 12, fontStyle: 'italic' }}>{example}</Text>
        </View>
      )}
    </View>
  );
}
