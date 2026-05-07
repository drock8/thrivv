import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, View, Text, Image, Animated, TouchableOpacity, Linking, Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthorization } from '../utils/useAuthorization';
import { SignInFeature } from '../components/sign-in/sign-in-feature';
import { TeamCard } from '../components/home/TeamCard';
import { TeammateCard } from '../components/home/TeammateCard';
import { ActionZone } from '../components/home/ActionZone';
import { getAvatar } from '../lib/avatars';
import { useMemoTransaction } from '../utils/useMemoTransaction';

const TEAM_AVATAR = require('../../assets/avatars/sleep-seekers.png');
const THRIVV_LOGO = require('../../assets/thrivv-logo-bone.png');
const ATTESTATION_KEY = 'thrivv.lastAttestation';

type Attestation = {
  sig: string;
  hours: number;
  mins: number;
  zzzs: number;
  date: string;
};

const MOCK_TEAM = {
  teamName: 'Sleep Seekers',
  teamZzzs: 503,
  teamHours: 98,
  streakNights: 5,
  filledDays: 5,
};

const MOCK_TEAMMATES = [
  { name: 'Anatoly', hours: 32, zzzs: 152, streak: 4, isYou: false },
  { name: 'You', hours: 36, zzzs: 184, streak: 5, isYou: true },
  { name: 'Satoshi', hours: 30, zzzs: 167, streak: 3, isYou: false },
];

function explorerUrl(sig: string) {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}

export function HomeScreen() {
  const { selectedAccount } = useAuthorization();
  const memoMutation = useMemoTransaction();

  const [lastAttestation, setLastAttestation] = useState<Attestation | null>(null);
  const [toast, setToast] = useState<{ hours: number; mins: number; zzzs: number; sig: string } | null>(null);
  const toastAnim = useRef(new Animated.Value(-100)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAttestation = useCallback(() => {
    AsyncStorage.getItem(ATTESTATION_KEY).then(val => {
      if (val) setLastAttestation(JSON.parse(val));
    });
  }, []);

  useEffect(() => {
    loadAttestation();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadAttestation();
    });
    return () => sub.remove();
  }, [loadAttestation]);

  const showToast = (data: { hours: number; mins: number; zzzs: number; sig: string }) => {
    setToast(data);
    Animated.parallel([
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(dismissToast, 8000);
  };

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(toastAnim, { toValue: -100, duration: 250, useNativeDriver: true }),
      Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setToast(null));
    if (toastTimer.current) { clearTimeout(toastTimer.current); toastTimer.current = null; }
  };

  const handleWakeConfirm = async (durationMs: number): Promise<string | null> => {
    if (!selectedAccount) return null;
    const pubkey = selectedAccount.publicKey.toBase58();
    const ts = new Date().toISOString();
    const hrs = Math.floor(durationMs / 3600000);
    const mins = Math.floor((durationMs % 3600000) / 60000);
    const zzzs = 24.0;
    const memo = `thrivv:submit_night:user=${pubkey}:date=${ts}:hours=${hrs + mins / 60}:zzzs=${zzzs}`;

    try {
      const sig = await memoMutation.mutateAsync(memo);
      if (sig) {
        const attestation: Attestation = {
          sig,
          hours: hrs,
          mins,
          zzzs,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
        await AsyncStorage.setItem(ATTESTATION_KEY, JSON.stringify(attestation));
        setLastAttestation(attestation);
        showToast({ hours: hrs, mins, zzzs, sig });
        return sig;
      }
    } catch (e: any) {
      Alert.alert('Attestation error', e?.message ?? String(e));
    }
    return null;
  };

  if (!selectedAccount) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#F5F2EA', fontSize: 28, fontWeight: '500', marginBottom: 8 }}>
          THRIVV
        </Text>
        <Text style={{ color: '#6B6760', fontSize: 15, marginBottom: 32, textAlign: 'center' }}>
          Activate your tribe. Thrivv.
        </Text>
        <SignInFeature />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Success toast */}
      {toast && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 8,
            left: 16,
            right: 16,
            zIndex: 10,
            transform: [{ translateY: toastAnim }],
            opacity: toastOpacity,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={dismissToast}
            style={{
              backgroundColor: '#171717',
              borderWidth: 1,
              borderColor: '#5EBFB5',
              borderRadius: 14,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#5EBFB5', fontSize: 14, fontWeight: '600' }}>
              Night logged on chain
            </Text>
            <Text style={{ color: '#F5F2EA', fontSize: 12, marginTop: 4 }}>
              {toast.hours}h {toast.mins}m · {toast.zzzs} ZZZs earned
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(explorerUrl(toast.sig))}
              style={{ marginTop: 6 }}
            >
              <Text style={{ color: '#5EBFB5', fontSize: 12, fontWeight: '500' }}>
                View on Solana Explorer →
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 16, gap: 10 }}
      >
        {/* Logo */}
        <View style={{ paddingHorizontal: 16, marginBottom: 0, alignItems: 'center' }}>
          <Image
            source={THRIVV_LOGO}
            style={{ width: 190, height: 59 }}
            resizeMode="contain"
          />
        </View>

        {/* Section 1: Team Card */}
        <TeamCard
          teamName={MOCK_TEAM.teamName}
          teamAvatar={TEAM_AVATAR}
          teamZzzs={MOCK_TEAM.teamZzzs}
          teamHours={MOCK_TEAM.teamHours}
          streakNights={MOCK_TEAM.streakNights}
          filledDays={MOCK_TEAM.filledDays}
        />

        {/* Section 2: Teammate Cards */}
        <View className="bg-surface rounded-2xl mx-4" style={{ padding: 10 }}>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-end' }}>
            {MOCK_TEAMMATES.map(m => (
              <TeammateCard
                key={m.name}
                name={m.name}
                avatar={getAvatar(m.name)!}
                hours={m.hours}
                zzzs={m.zzzs}
                streakNights={m.streak}
                isYou={m.isYou}
              />
            ))}
          </View>
        </View>

        {/* Persistent on-chain proof line */}
        {lastAttestation && (
          <TouchableOpacity
            onPress={() => Linking.openURL(explorerUrl(lastAttestation.sig))}
            activeOpacity={0.7}
            style={{
              marginHorizontal: 16,
              backgroundColor: 'rgba(232, 155, 126, 0.15)',
              borderRadius: 12,
              paddingVertical: 8,
              paddingHorizontal: 14,
            }}
          >
            <Text style={{ color: '#E89B7E', fontSize: 12, fontWeight: '500', textAlign: 'center' }}>
              Last on-chain proof: {lastAttestation.hours}h {lastAttestation.mins}m on {lastAttestation.date} →
            </Text>
          </TouchableOpacity>
        )}

        {/* Section 3: Action Zone */}
        <ActionZone onWakeConfirm={handleWakeConfirm} />
      </ScrollView>
    </View>
  );
}
