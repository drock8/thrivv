import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { getAvatar } from '../lib/avatars';
import { VerifiedBadgeInline } from '../components/VerifiedBadge';
import { useBiometricTier } from '../lib/biometricStore';
import type { BiometricTier } from '../lib/biometricStore';
import { useAuth } from '../utils/useAuth';
import {
  useLeaderboardData,
  type LeaderboardTeamZzzsRow,
  type LeaderboardTeamHoursRow,
  type LeaderboardIndividualRow,
} from '../hooks/useSleepData';

const THRIVV_LOGO = require('../../assets/thrivv-logo-bone.png');

function InitialAvatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: '#B8D4C9', alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: '#0A0A0A', fontSize: size * 0.42, fontWeight: '700' }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

function SmartAvatar({ name, size = 32, avatarUrl }: { name: string; size?: number; avatarUrl?: string | null }) {
  const bundled = getAvatar(name.toLowerCase());
  if (bundled) return <Image source={bundled} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  if (avatarUrl) return <Image source={{ uri: avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return <InitialAvatar name={name} size={size} />;
}

function SeedBadge() {
  return (
    <View style={{
      backgroundColor: 'rgba(232, 155, 126, 0.2)',
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 1,
      marginLeft: 4,
    }}>
      <Text style={{ color: '#E89B7E', fontSize: 8, fontWeight: '700', letterSpacing: 0.5 }}>DEMO</Text>
    </View>
  );
}

type Tab = 'teamZzzs' | 'teamHours' | 'individualZzzs' | 'individualHours';

const TABS: { key: Tab; label: string }[] = [
  { key: 'teamZzzs', label: 'TEAM ZZZs' },
  { key: 'teamHours', label: 'TEAM HOURS' },
  { key: 'individualZzzs', label: 'INDIVIDUAL ZZZs' },
  { key: 'individualHours', label: 'INDIVIDUAL HOURS' },
];

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
  const color = colors[rank] || '#6B6760';
  return (
    <View style={{ width: 28, alignItems: 'center' }}>
      <Text style={{ color, fontSize: 14, fontWeight: '700' }}>#{rank}</Text>
    </View>
  );
}

function BarFill({ value, max, color = '#5EBFB5' }: { value: number; max: number; color?: string }) {
  const pct = Math.min(value / max, 1) * 100;
  return (
    <View style={{ flex: 1, height: 6, backgroundColor: '#2A2A2A', borderRadius: 3, marginLeft: 8 }}>
      <View style={{ width: `${pct}%`, height: 6, backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

export function LeaderboardScreen() {
  const [tab, setTab] = useState<Tab>('teamZzzs');
  const myBiometricTier = useBiometricTier();
  const { selectedAccount } = useAuth();
  const pubkey = selectedAccount?.publicKey.toBase58();

  const {
    teamZzzs,
    teamHours,
    individualZzzsTop,
    individualZzzsYou,
    individualHoursTop,
    individualHoursYou,
    totalMembers,
    isLoading,
  } = useLeaderboardData(pubkey);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0A' }}
      contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
    >
      {/* Logo */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Image
          source={THRIVV_LOGO}
          style={{ width: 190, height: 59 }}
          resizeMode="contain"
        />
      </View>

      {/* Tab grid — 2x2 */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
          {TABS.slice(0, 2).map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: tab === t.key ? '#5EBFB5' : '#171717',
                borderRadius: 10,
                paddingVertical: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: tab === t.key ? '#0A0A0A' : '#6B6760',
                fontSize: 11,
                fontWeight: '600',
              }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {TABS.slice(2).map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: tab === t.key ? '#5EBFB5' : '#171717',
                borderRadius: 10,
                paddingVertical: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: tab === t.key ? '#0A0A0A' : '#6B6760',
                fontSize: 11,
                fontWeight: '600',
              }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: '#6B6760', fontSize: 14 }}>Loading leaderboard...</Text>
        </View>
      ) : (
        <>
          {tab === 'teamZzzs' && <TeamZzzsView data={teamZzzs} />}
          {tab === 'teamHours' && <TeamHoursView data={teamHours} />}
          {tab === 'individualZzzs' && (
            <IndividualZzzsView
              top={individualZzzsTop}
              you={individualZzzsYou}
              myTier={myBiometricTier}
              totalMembers={totalMembers}
            />
          )}
          {tab === 'individualHours' && (
            <IndividualHoursView
              top={individualHoursTop}
              you={individualHoursYou}
              myTier={myBiometricTier}
              totalMembers={totalMembers}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

function TeamZzzsView({ data }: { data: LeaderboardTeamZzzsRow[] }) {
  const maxZzzs = data.length > 0 ? data[0].zzzs : 1;
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Sponsor strip */}
      <View style={{
        backgroundColor: '#171717',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2A2A2A',
      }}>
        <Trophy size={20} color="#FFD700" />
        <Text style={{ color: '#F5F2EA', fontSize: 12, fontWeight: '500', marginLeft: 8, flex: 1 }}>
          5 SOL pool sponsored by REM Labs · finalizes Sunday
        </Text>
      </View>

      {/* Table header */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 4, marginBottom: 6, alignItems: 'center' }}>
        <View style={{ width: 28 }} />
        <View style={{ width: 36 }} />
        <Text style={{ flex: 1, color: '#6B6760', fontSize: 9, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' }}>Tribe</Text>
        <Text style={{ width: 55, color: '#6B6760', fontSize: 9, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'right' }}>ZZZs</Text>
        <Text style={{ width: 50, color: '#6B6760', fontSize: 9, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'right' }}>Payout</Text>
        <Text style={{ width: 45, color: '#6B6760', fontSize: 9, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'right' }}>Stake</Text>
      </View>

      {data.length === 0 ? (
        <Text style={{ color: '#6B6760', fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>
          No teams yet — create a tribe to get started!
        </Text>
      ) : (
        data.map(row => (
          <View
            key={row.rank}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: row.isYou ? 'rgba(94, 191, 181, 0.08)' : 'transparent',
              borderWidth: row.isYou ? 1 : 0,
              borderColor: row.isYou ? '#5EBFB5' : 'transparent',
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 4,
              marginBottom: 4,
            }}
          >
            <RankBadge rank={row.rank} />
            <View style={{ marginRight: 8 }}>
              <SmartAvatar name={row.name} size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: row.isYou ? '#5EBFB5' : '#F5F2EA', fontSize: 12, fontWeight: '500' }} numberOfLines={1}>
                  {row.name}{row.isYou ? ' (you)' : ''}
                </Text>
                {row.isSeed && <SeedBadge />}
              </View>
              <BarFill value={row.zzzs} max={maxZzzs} />
            </View>
            <Text style={{ width: 55, color: '#F5F2EA', fontSize: 11, fontWeight: '500', textAlign: 'right' }}>
              {row.zzzs}
            </Text>
            <Text style={{ width: 50, color: row.payout ? '#5EBFB5' : '#6B6760', fontSize: 10, textAlign: 'right' }}>
              {row.payout ?? '—'}
            </Text>
            <Text style={{ width: 45, color: '#6B6760', fontSize: 10, textAlign: 'right' }}>
              {row.stake}
            </Text>
          </View>
        ))
      )}

      <Text style={{ color: '#6B6760', fontSize: 10, textAlign: 'center', marginTop: 12 }}>
        Forfeited stakes go to the Sleep Research Foundation
      </Text>
    </View>
  );
}

function TeamHoursView({ data }: { data: LeaderboardTeamHoursRow[] }) {
  const maxHours = 147;
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text style={{ color: '#6B6760', fontSize: 12, fontWeight: '500', marginBottom: 12 }}>
        Most consistent tribes this week
      </Text>

      {data.length === 0 ? (
        <Text style={{ color: '#6B6760', fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>
          No teams yet — create a tribe to get started!
        </Text>
      ) : (
        data.map(row => (
          <View
            key={row.rank}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: row.isYou ? 'rgba(94, 191, 181, 0.08)' : 'transparent',
              borderWidth: row.isYou ? 1 : 0,
              borderColor: row.isYou ? '#5EBFB5' : 'transparent',
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 4,
              marginBottom: 4,
            }}
          >
            <RankBadge rank={row.rank} />
            <View style={{ marginRight: 8 }}>
              <SmartAvatar name={row.name} size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: row.isYou ? '#5EBFB5' : '#F5F2EA', fontSize: 12, fontWeight: '500' }} numberOfLines={1}>
                  {row.name}{row.isYou ? ' (you)' : ''}
                </Text>
                {row.isSeed && <SeedBadge />}
              </View>
              <BarFill value={row.hours} max={maxHours} />
            </View>
            <Text style={{ width: 50, color: '#F5F2EA', fontSize: 12, fontWeight: '500', textAlign: 'right' }}>
              {row.hours}h
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

function IndividualZzzsView({
  top,
  you,
  myTier,
  totalMembers,
}: {
  top: LeaderboardIndividualRow[];
  you: LeaderboardIndividualRow | null;
  myTier: BiometricTier;
  totalMembers: number;
}) {
  const maxZzzs = top.length > 0 ? (top[0].zzzs ?? 1) : 1;
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text style={{ color: '#6B6760', fontSize: 12, fontWeight: '500', marginBottom: 12 }}>
        Top performers across THRIVV · {totalMembers} active member{totalMembers !== 1 ? 's' : ''}
      </Text>

      {top.map(row => (
        <View
          key={row.rank}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 4,
            marginBottom: 4,
          }}
        >
          <RankBadge rank={row.rank} />
          <View style={{ marginRight: 8 }}>
            <SmartAvatar name={row.name} size={28} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#F5F2EA', fontSize: 12, fontWeight: '500' }}>{row.name}</Text>
              {row.verified && row.verified !== 'none' && <VerifiedBadgeInline tier={row.verified} />}
              {row.isSeed && <SeedBadge />}
            </View>
            <Text style={{ color: '#6B6760', fontSize: 10 }}>{row.tribe}</Text>
          </View>
          <View style={{ width: 75, alignItems: 'flex-end' }}>
            <Text style={{ color: '#F5F2EA', fontSize: 11, fontWeight: '500' }}>{row.zzzs} ZZZs</Text>
            <BarFill value={row.zzzs ?? 0} max={maxZzzs} />
          </View>
        </View>
      ))}

      {you && (
        <>
          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
            <Text style={{ color: '#6B6760', fontSize: 10, marginHorizontal: 8 }}>···</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(94, 191, 181, 0.08)',
            borderWidth: 1,
            borderColor: '#5EBFB5',
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 4,
          }}>
            <RankBadge rank={you.rank} />
            <View style={{ marginRight: 8 }}>
              <SmartAvatar name="You" size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#5EBFB5', fontSize: 12, fontWeight: '500' }}>You</Text>
                {myTier !== 'none' && <VerifiedBadgeInline tier={myTier} />}
              </View>
              <Text style={{ color: '#6B6760', fontSize: 10 }}>{you.tribe}</Text>
            </View>
            <View style={{ width: 75, alignItems: 'flex-end' }}>
              <Text style={{ color: '#5EBFB5', fontSize: 11, fontWeight: '500' }}>{you.zzzs} ZZZs</Text>
              <BarFill value={you.zzzs ?? 0} max={maxZzzs} color="#5EBFB5" />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

function IndividualHoursView({
  top,
  you,
  myTier,
  totalMembers,
}: {
  top: LeaderboardIndividualRow[];
  you: LeaderboardIndividualRow | null;
  myTier: BiometricTier;
  totalMembers: number;
}) {
  const maxHours = 49;
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text style={{ color: '#6B6760', fontSize: 12, fontWeight: '500', marginBottom: 12 }}>
        Most consistent sleepers this week · {totalMembers} active member{totalMembers !== 1 ? 's' : ''}
      </Text>

      {top.map(row => (
        <View
          key={row.rank}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: row.isTeammate ? 'rgba(94, 191, 181, 0.05)' : 'transparent',
            borderWidth: row.isTeammate ? 1 : 0,
            borderColor: row.isTeammate ? 'rgba(94, 191, 181, 0.3)' : 'transparent',
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 4,
            marginBottom: 4,
          }}
        >
          <RankBadge rank={row.rank} />
          <View style={{ marginRight: 8 }}>
            <SmartAvatar name={row.name} size={28} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: row.isTeammate ? '#5EBFB5' : '#F5F2EA', fontSize: 12, fontWeight: '500' }}>
                {row.name}
              </Text>
              {row.verified && row.verified !== 'none' && <VerifiedBadgeInline tier={row.verified} />}
              {row.isSeed && <SeedBadge />}
            </View>
            <Text style={{ color: '#6B6760', fontSize: 10 }}>{row.tribe}</Text>
          </View>
          <View style={{ width: 50, alignItems: 'flex-end' }}>
            <Text style={{ color: '#F5F2EA', fontSize: 11, fontWeight: '500' }}>{row.hours}h</Text>
            <BarFill value={row.hours ?? 0} max={maxHours} />
          </View>
        </View>
      ))}

      {you && (
        <>
          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
            <Text style={{ color: '#6B6760', fontSize: 10, marginHorizontal: 8 }}>···</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(94, 191, 181, 0.08)',
            borderWidth: 1,
            borderColor: '#5EBFB5',
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 4,
          }}>
            <RankBadge rank={you.rank} />
            <View style={{ marginRight: 8 }}>
              <SmartAvatar name="You" size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#5EBFB5', fontSize: 12, fontWeight: '500' }}>You</Text>
                {myTier !== 'none' && <VerifiedBadgeInline tier={myTier} />}
              </View>
              <Text style={{ color: '#6B6760', fontSize: 10 }}>{you.tribe}</Text>
            </View>
            <View style={{ width: 50, alignItems: 'flex-end' }}>
              <Text style={{ color: '#5EBFB5', fontSize: 11, fontWeight: '500' }}>{you.hours}h</Text>
              <BarFill value={you.hours ?? 0} max={maxHours} color="#5EBFB5" />
            </View>
          </View>
        </>
      )}
    </View>
  );
}
