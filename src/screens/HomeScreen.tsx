import React from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { useAuthorization } from '../utils/useAuthorization';
import { SignInFeature } from '../components/sign-in/sign-in-feature';
import { TeamCard } from '../components/home/TeamCard';
import { TeammateCard } from '../components/home/TeammateCard';
import { ActionZone } from '../components/home/ActionZone';
import { getAvatar } from '../lib/avatars';
import { useMemoTransaction } from '../utils/useMemoTransaction';

const TEAM_AVATAR = require('../../assets/avatars/you.png');
type SleepState = 'awake' | 'sleeping';

const MOCK_TEAM = {
  teamName: 'The Sleep Lions',
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

export function HomeScreen() {
  const { selectedAccount } = useAuthorization();
  const memoMutation = useMemoTransaction();

  const handleSleepAction = async (newState: SleepState) => {
    if (!selectedAccount) return;
    const pubkey = selectedAccount.publicKey.toBase58();
    const ts = new Date().toISOString();

    let memo: string;
    if (newState === 'sleeping') {
      memo = `thrivv:start_night:user=${pubkey}:date=${ts}`;
    } else {
      memo = `thrivv:submit_night:user=${pubkey}:date=${ts}:hours=7.5:zzzs=24.0`;
    }

    const sig = await memoMutation.mutateAsync(memo);
    if (sig) {
      Alert.alert('Transaction confirmed', sig.slice(0, 20) + '...');
    }
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
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0A' }}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 24, gap: 16 }}
    >
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
      <View className="bg-surface rounded-2xl p-4 mx-4">
        <View style={{ flexDirection: 'row', gap: 8 }}>
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

      {/* Section 3: Action Zone */}
      <ActionZone onSleepAction={handleSleepAction} />
    </ScrollView>
  );
}
