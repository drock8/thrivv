import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, View, Text, Image, Animated, TouchableOpacity, Linking, Alert, AppState, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Users, Copy, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../utils/useAuth';
import { SignInFeature } from '../components/sign-in/sign-in-feature';
import { TeamCard } from '../components/home/TeamCard';
import { TeammateCard } from '../components/home/TeammateCard';
import { ActionZone } from '../components/home/ActionZone';
import { useMemoTransaction } from '../utils/useMemoTransaction';
import { useBiometricTier } from '../lib/biometricStore';
import {
  useHomeScreenData,
  useMyWeeklySleep,
  useLogSleep,
  useCreateTeam,
  useJoinTeam,
  useEnsureProfile,
} from '../hooks/useSleepData';
import { calculateStreak } from '../lib/streaks';
import { getTodayDate } from '../lib/weekUtils';

const THRIVV_LOGO = require('../../assets/thrivv-logo-bone.png');
const ATTESTATION_KEY = 'thrivv.lastAttestation';

type Attestation = {
  sig: string;
  hours: number;
  mins: number;
  zzzs: number;
  date: string;
};

function explorerUrl(sig: string) {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}

export function HomeScreen() {
  const { selectedAccount, isReady } = useAuth();
  const memoMutation = useMemoTransaction();
  const biometricTier = useBiometricTier();
  const pubkey = selectedAccount?.publicKey.toBase58();

  const { team, teammates, noTeam, isLoading, teamPda } = useHomeScreenData(pubkey);
  const sleepQuery = useMyWeeklySleep(pubkey);
  const myRecords = sleepQuery.data ?? [];
  const logSleep = useLogSleep();

  const sleepStats = (() => {
    const today = getTodayDate();
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const lastNight = myRecords.find(r => r.sleep_date === today)
      ?? myRecords.find(r => r.sleep_date === yesterdayStr);

    const totalHours = myRecords.reduce((s, r) => s + Number(r.hours), 0);
    const avgHours = myRecords.length > 0 ? totalHours / myRecords.length : null;

    return {
      lastNightHours: lastNight ? Number(lastNight.hours) : null,
      averageHours: avgHours,
      streakNights: calculateStreak(myRecords),
      consistencyPct: myRecords.length > 0 ? Math.round((myRecords.length / 7) * 100) : 0,
    };
  })();
  const createTeamMutation = useCreateTeam();
  const joinTeamMutation = useJoinTeam();
  const ensureProfileMutation = useEnsureProfile();
  const ensureProfileRef = useRef(ensureProfileMutation.mutate);
  ensureProfileRef.current = ensureProfileMutation.mutate;

  const [lastAttestation, setLastAttestation] = useState<Attestation | null>(null);
  const [toast, setToast] = useState<{ hours: number; mins: number; zzzs: number; sig: string } | null>(null);
  const toastAnim = useRef(new Animated.Value(-100)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Team creation/join state
  const [teamMode, setTeamMode] = useState<'idle' | 'create' | 'join'>('idle');
  const [teamNameInput, setTeamNameInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [createdJoinCode, setCreatedJoinCode] = useState<string | null>(null);

  useEffect(() => {
    if (pubkey) ensureProfileRef.current(pubkey);
  }, [pubkey]);

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
    const pk = selectedAccount.publicKey.toBase58();
    const ts = new Date().toISOString();
    const hrs = Math.floor(durationMs / 3600000);
    const mins = Math.floor((durationMs % 3600000) / 60000);
    const zzzs = 24.0;
    const memo = `thrivv:submit_night:user=${pk}:date=${ts}:hours=${hrs + mins / 60}:zzzs=${zzzs}`;

    // Write to Supabase first (fast, reliable)
    try {
      await logSleep.mutateAsync({
        pubkey: pk,
        durationMs,
        txSig: null,
        teamPda: teamPda ?? null,
      });
      showToast({ hours: hrs, mins, zzzs: 24.0, sig: 'supabase' });
    } catch (e: any) {
      console.log('[THRIVV] Supabase write failed:', e?.message);
      Alert.alert('Error', 'Failed to log sleep: ' + (e?.message ?? String(e)));
      return null;
    }

    // Attempt on-chain attestation in background (may fail behind firewalls)
    (async () => {
      try {
        console.log('[THRIVV] Starting memo transaction...');
        const sig = await memoMutation.mutateAsync(memo);
        console.log('[THRIVV] Memo result:', sig);
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

          logSleep.mutate({
            pubkey: pk,
            durationMs,
            txSig: sig,
            teamPda: teamPda ?? null,
          });
        }
      } catch (e: any) {
        console.log('[THRIVV] On-chain attestation skipped (network unavailable)');
      }
    })();

    return null;
  };

  const handleCreateTeam = async () => {
    if (!pubkey || !teamNameInput.trim()) return;
    try {
      const result = await createTeamMutation.mutateAsync({
        creatorPubkey: pubkey,
        teamName: teamNameInput.trim(),
      });
      setCreatedJoinCode(result.joinCode);
      setTeamNameInput('');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to create team');
    }
  };

  const handleJoinTeam = async () => {
    if (!pubkey || !joinCodeInput.trim()) return;
    try {
      await joinTeamMutation.mutateAsync({
        pubkey,
        joinCode: joinCodeInput.trim(),
      });
      setJoinCodeInput('');
      setTeamMode('idle');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to join team');
    }
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#6B6760', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

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
              {toast.sig === 'supabase' ? 'Sleep logged!' : 'Night logged on chain'}
            </Text>
            <Text style={{ color: '#F5F2EA', fontSize: 12, marginTop: 4 }}>
              {toast.hours}h {toast.mins}m · {toast.zzzs} ZZZs earned
            </Text>
            {toast.sig !== 'supabase' && (
              <TouchableOpacity
                onPress={() => Linking.openURL(explorerUrl(toast.sig))}
                style={{ marginTop: 6 }}
              >
                <Text style={{ color: '#5EBFB5', fontSize: 12, fontWeight: '500' }}>
                  View on Solana Explorer →
                </Text>
              </TouchableOpacity>
            )}
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

        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#6B6760', fontSize: 14 }}>Loading team data...</Text>
          </View>
        ) : noTeam ? (
          /* No team — create or join */
          <View style={{ marginHorizontal: 16 }}>
            <View style={{
              backgroundColor: '#171717', borderRadius: 16, padding: 20,
              borderWidth: 1, borderColor: '#2A2A2A',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Users size={20} color="#5EBFB5" />
                <Text style={{ color: '#F5F2EA', fontSize: 16, fontWeight: '600', marginLeft: 10 }}>
                  Join a Tribe
                </Text>
              </View>
              <Text style={{ color: '#6B6760', fontSize: 13, lineHeight: 19, marginBottom: 16 }}>
                Form a tribe of 3 to unlock the {'×'}3 team multiplier. Create a new tribe or join with a code.
              </Text>

              {teamMode === 'idle' && !createdJoinCode && (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setTeamMode('create')}
                    activeOpacity={0.8}
                    style={{
                      flex: 1, backgroundColor: '#5EBFB5', borderRadius: 12,
                      padding: 14, alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#0A0A0A', fontSize: 14, fontWeight: '600' }}>Create Tribe</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setTeamMode('join')}
                    activeOpacity={0.8}
                    style={{
                      flex: 1, backgroundColor: '#2A2A2A', borderRadius: 12,
                      padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#5EBFB5',
                    }}
                  >
                    <Text style={{ color: '#5EBFB5', fontSize: 14, fontWeight: '600' }}>Join Tribe</Text>
                  </TouchableOpacity>
                </View>
              )}

              {teamMode === 'create' && !createdJoinCode && (
                <View>
                  <TextInput
                    value={teamNameInput}
                    onChangeText={setTeamNameInput}
                    placeholder="Tribe name..."
                    placeholderTextColor="#6B6760"
                    maxLength={24}
                    style={{
                      backgroundColor: '#0A0A0A', borderRadius: 12, padding: 14,
                      color: '#F5F2EA', fontSize: 15, borderWidth: 1, borderColor: '#2A2A2A',
                      marginBottom: 10,
                    }}
                  />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setTeamMode('idle')}
                      style={{ flex: 1, padding: 14, alignItems: 'center' }}
                    >
                      <Text style={{ color: '#6B6760', fontSize: 14 }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCreateTeam}
                      disabled={!teamNameInput.trim() || createTeamMutation.isPending}
                      activeOpacity={0.8}
                      style={{
                        flex: 1, backgroundColor: '#5EBFB5', borderRadius: 12,
                        padding: 14, alignItems: 'center',
                        opacity: !teamNameInput.trim() ? 0.5 : 1,
                      }}
                    >
                      <Text style={{ color: '#0A0A0A', fontSize: 14, fontWeight: '600' }}>
                        {createTeamMutation.isPending ? 'Creating...' : 'Create'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {createdJoinCode && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#5EBFB5', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                    Tribe created! Share this code:
                  </Text>
                  <TouchableOpacity
                    onPress={async () => {
                      await Clipboard.setStringAsync(createdJoinCode);
                      Alert.alert('Copied', 'Join code copied to clipboard');
                    }}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: '#0A0A0A', borderRadius: 12, padding: 16,
                      flexDirection: 'row', alignItems: 'center', gap: 10,
                      borderWidth: 1, borderColor: '#5EBFB5',
                    }}
                  >
                    <Text style={{ color: '#F5F2EA', fontSize: 24, fontWeight: '700', fontFamily: 'monospace', letterSpacing: 4 }}>
                      {createdJoinCode}
                    </Text>
                    <Copy size={18} color="#6B6760" />
                  </TouchableOpacity>
                  <Text style={{ color: '#6B6760', fontSize: 12, marginTop: 8 }}>
                    Tap to copy · Share with 2 teammates to activate your tribe
                  </Text>
                </View>
              )}

              {teamMode === 'join' && (
                <View>
                  <TextInput
                    value={joinCodeInput}
                    onChangeText={(t) => setJoinCodeInput(t.toUpperCase())}
                    placeholder="Enter 6-character code..."
                    placeholderTextColor="#6B6760"
                    maxLength={6}
                    autoCapitalize="characters"
                    style={{
                      backgroundColor: '#0A0A0A', borderRadius: 12, padding: 14,
                      color: '#F5F2EA', fontSize: 18, fontWeight: '600', fontFamily: 'monospace',
                      letterSpacing: 4, textAlign: 'center',
                      borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 10,
                    }}
                  />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => { setTeamMode('idle'); setJoinCodeInput(''); }}
                      style={{ flex: 1, padding: 14, alignItems: 'center' }}
                    >
                      <Text style={{ color: '#6B6760', fontSize: 14 }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleJoinTeam}
                      disabled={joinCodeInput.length < 6 || joinTeamMutation.isPending}
                      activeOpacity={0.8}
                      style={{
                        flex: 1, backgroundColor: '#5EBFB5', borderRadius: 12,
                        padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
                        opacity: joinCodeInput.length < 6 ? 0.5 : 1,
                      }}
                    >
                      <Text style={{ color: '#0A0A0A', fontSize: 14, fontWeight: '600' }}>
                        {joinTeamMutation.isPending ? 'Joining...' : 'Join'}
                      </Text>
                      <ArrowRight size={16} color="#0A0A0A" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : (
          <>
            {/* Section 1: Team Card */}
            {team && (
              <TeamCard
                teamName={team.teamName}
                teamAvatar={team.teamAvatar}
                teamZzzs={team.teamZzzs}
                teamHours={team.teamHours}
                streakNights={team.streakNights}
                filledDays={team.filledDays}
              />
            )}

            {/* Section 2: Teammate Cards */}
            {teammates.length > 0 && (
              <View className="bg-surface rounded-2xl mx-4" style={{ padding: 10 }}>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-end' }}>
                  {teammates.map(m => (
                    <TeammateCard
                      key={m.name}
                      name={m.name}
                      avatar={m.avatar}
                      hours={m.hours}
                      zzzs={m.zzzs}
                      streakNights={m.streak}
                      isYou={m.isYou}
                      verified={m.isYou ? biometricTier : m.verified}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}

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
        <ActionZone onWakeConfirm={handleWakeConfirm} stats={sleepStats} />
      </ScrollView>
    </View>
  );
}
