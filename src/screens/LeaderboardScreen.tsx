import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { getAvatar } from '../lib/avatars';

const THRIVV_LOGO = require('../../assets/thrivv-logo-bone.png');
const SLEEP_SEEKERS_AVATAR = require('../../assets/avatars/sleep-seekers.png');

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

function SmartAvatar({ name, size = 32, teamName }: { name: string; size?: number; teamName?: string }) {
  const bundled = getAvatar(name.toLowerCase());
  if (bundled) return <Image source={bundled} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  if (teamName === 'Sleep Seekers' || name === 'Sleep Seekers') {
    return <Image source={SLEEP_SEEKERS_AVATAR} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return <InitialAvatar name={name} size={size} />;
}

type Tab = 'teamZzzs' | 'teamHours' | 'individualZzzs' | 'individualHours';

const TABS: { key: Tab; label: string }[] = [
  { key: 'teamZzzs', label: 'TEAM ZZZs' },
  { key: 'teamHours', label: 'TEAM HOURS' },
  { key: 'individualZzzs', label: 'INDIVIDUAL ZZZs' },
  { key: 'individualHours', label: 'INDIVIDUAL HOURS' },
];

const TEAM_ZZZS = [
  { rank: 1, name: 'The Pillow Talkers', zzzs: 312, payout: '2.5 SOL', stake: '0.3 SOL', isYou: false },
  { rank: 2, name: 'Recovery Squad', zzzs: 244, payout: '1.5 SOL', stake: '0.3 SOL', isYou: false },
  { rank: 3, name: 'Sleep Seekers', zzzs: 188, payout: '1.0 SOL', stake: '0.3 SOL', isYou: true },
  { rank: 4, name: 'Dream Catchers', zzzs: 172, payout: null, stake: '0.3 SOL', isYou: false },
  { rank: 5, name: 'Night Owls', zzzs: 134, payout: null, stake: '0.3 SOL', isYou: false },
  { rank: 6, name: 'The Nappers', zzzs: 121, payout: null, stake: '0.3 SOL', isYou: false },
  { rank: 7, name: 'Circadian Crew', zzzs: 108, payout: null, stake: '0.3 SOL', isYou: false },
  { rank: 8, name: 'REM Riders', zzzs: 95, payout: null, stake: '0.3 SOL', isYou: false },
  { rank: 9, name: 'Deep Sleepers', zzzs: 82, payout: null, stake: '0.3 SOL', isYou: false },
  { rank: 10, name: 'Snooze Squad', zzzs: 64, payout: null, stake: '0.3 SOL', isYou: false },
];

const TEAM_HOURS = [
  { rank: 1, name: 'The Pillow Talkers', hours: 109, isYou: false },
  { rank: 2, name: 'Recovery Squad', hours: 102, isYou: false },
  { rank: 3, name: 'Dream Catchers', hours: 87, isYou: false },
  { rank: 4, name: 'Sleep Seekers', hours: 73, isYou: true },
  { rank: 5, name: 'Night Owls', hours: 58, isYou: false },
  { rank: 6, name: 'Circadian Crew', hours: 52, isYou: false },
  { rank: 7, name: 'The Nappers', hours: 48, isYou: false },
  { rank: 8, name: 'REM Riders', hours: 41, isYou: false },
  { rank: 9, name: 'Deep Sleepers', hours: 35, isYou: false },
  { rank: 10, name: 'Snooze Squad', hours: 28, isYou: false },
];

const INDIVIDUAL_ZZZS_TOP = [
  { rank: 1, name: 'Marcus Chen', zzzs: 412, tribe: 'Recovery Squad' },
  { rank: 2, name: 'Priya Sharma', zzzs: 389, tribe: 'The Pillow Talkers' },
  { rank: 3, name: 'Jordan Lee', zzzs: 376, tribe: 'Recovery Squad' },
  { rank: 4, name: 'Anya Volkov', zzzs: 351, tribe: 'The Pillow Talkers' },
  { rank: 5, name: 'David Kim', zzzs: 342, tribe: 'Dream Catchers' },
  { rank: 6, name: 'Lena Okoro', zzzs: 331, tribe: 'Night Owls' },
  { rank: 7, name: 'Kai Tanaka', zzzs: 318, tribe: 'Circadian Crew' },
  { rank: 8, name: 'Sofia Reyes', zzzs: 305, tribe: 'The Nappers' },
  { rank: 9, name: 'Anatoly', zzzs: 298, tribe: 'Sleep Seekers' },
  { rank: 10, name: 'Omar Hassan', zzzs: 287, tribe: 'REM Riders' },
  { rank: 11, name: 'Emma Wilson', zzzs: 274, tribe: 'Deep Sleepers' },
  { rank: 12, name: 'Ravi Patel', zzzs: 261, tribe: 'The Pillow Talkers' },
];
const INDIVIDUAL_ZZZS_YOU = { rank: 43, name: 'You', zzzs: 53, tribe: 'Sleep Seekers' };

const INDIVIDUAL_HOURS_TOP = [
  { rank: 1, name: 'Anya Volkov', hours: 47, tribe: 'The Pillow Talkers', isTeammate: false },
  { rank: 2, name: 'Marcus Chen', hours: 46, tribe: 'Recovery Squad', isTeammate: false },
  { rank: 3, name: 'David Kim', hours: 44, tribe: 'Dream Catchers', isTeammate: false },
  { rank: 4, name: 'Lena Okoro', hours: 43, tribe: 'Night Owls', isTeammate: false },
  { rank: 5, name: 'Jordan Lee', hours: 42, tribe: 'Recovery Squad', isTeammate: false },
  { rank: 6, name: 'Kai Tanaka', hours: 40, tribe: 'Circadian Crew', isTeammate: false },
  { rank: 7, name: 'Priya Sharma', hours: 38, tribe: 'The Pillow Talkers', isTeammate: false },
  { rank: 8, name: 'Sofia Reyes', hours: 35, tribe: 'The Nappers', isTeammate: false },
  { rank: 9, name: 'Satoshi', hours: 28, tribe: 'Sleep Seekers', isTeammate: true },
  { rank: 10, name: 'Anatoly', hours: 26, tribe: 'Sleep Seekers', isTeammate: true },
  { rank: 11, name: 'Omar Hassan', hours: 25, tribe: 'REM Riders', isTeammate: false },
  { rank: 12, name: 'Emma Wilson', hours: 24, tribe: 'Deep Sleepers', isTeammate: false },
];
const INDIVIDUAL_HOURS_YOU = { rank: 67, name: 'You', hours: 19, tribe: 'Sleep Seekers' };

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

      {/* Content */}
      {tab === 'teamZzzs' && <TeamZzzsView />}
      {tab === 'teamHours' && <TeamHoursView />}
      {tab === 'individualZzzs' && <IndividualZzzsView />}
      {tab === 'individualHours' && <IndividualHoursView />}
    </ScrollView>
  );
}

function TeamZzzsView() {
  const maxZzzs = TEAM_ZZZS[0].zzzs;
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

      {/* Rows */}
      {TEAM_ZZZS.map(row => (
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
            <Text style={{ color: row.isYou ? '#5EBFB5' : '#F5F2EA', fontSize: 12, fontWeight: '500' }} numberOfLines={1}>
              {row.name}{row.isYou ? ' (you)' : ''}
            </Text>
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
      ))}

      {/* Footer */}
      <Text style={{ color: '#6B6760', fontSize: 10, textAlign: 'center', marginTop: 12 }}>
        Forfeited stakes go to the Sleep Research Foundation
      </Text>
    </View>
  );
}

function TeamHoursView() {
  const maxHours = 147;
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text style={{ color: '#6B6760', fontSize: 12, fontWeight: '500', marginBottom: 12 }}>
        Most consistent tribes this week
      </Text>

      {TEAM_HOURS.map(row => (
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
            <Text style={{ color: row.isYou ? '#5EBFB5' : '#F5F2EA', fontSize: 12, fontWeight: '500' }} numberOfLines={1}>
              {row.name}{row.isYou ? ' (you)' : ''}
            </Text>
            <BarFill value={row.hours} max={maxHours} />
          </View>
          <Text style={{ width: 50, color: '#F5F2EA', fontSize: 12, fontWeight: '500', textAlign: 'right' }}>
            {row.hours}h
          </Text>
        </View>
      ))}
    </View>
  );
}

function IndividualZzzsView() {
  const maxZzzs = INDIVIDUAL_ZZZS_TOP[0].zzzs;
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text style={{ color: '#6B6760', fontSize: 12, fontWeight: '500', marginBottom: 12 }}>
        Top performers across THRIVV · 350 active members
      </Text>

      {INDIVIDUAL_ZZZS_TOP.map(row => (
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
            <SmartAvatar name={row.name} size={28} teamName={row.tribe} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#F5F2EA', fontSize: 12, fontWeight: '500' }}>{row.name}</Text>
            <Text style={{ color: '#6B6760', fontSize: 10 }}>{row.tribe}</Text>
          </View>
          <View style={{ width: 75, alignItems: 'flex-end' }}>
            <Text style={{ color: '#F5F2EA', fontSize: 11, fontWeight: '500' }}>{row.zzzs} ZZZs</Text>
            <BarFill value={row.zzzs} max={maxZzzs} />
          </View>
        </View>
      ))}

      {/* Divider */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
        <Text style={{ color: '#6B6760', fontSize: 10, marginHorizontal: 8 }}>···</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
      </View>

      {/* Your row */}
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
        <RankBadge rank={INDIVIDUAL_ZZZS_YOU.rank} />
        <View style={{ marginRight: 8 }}>
          <SmartAvatar name={INDIVIDUAL_ZZZS_YOU.name} size={28} teamName={INDIVIDUAL_ZZZS_YOU.tribe} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#5EBFB5', fontSize: 12, fontWeight: '500' }}>{INDIVIDUAL_ZZZS_YOU.name}</Text>
          <Text style={{ color: '#6B6760', fontSize: 10 }}>{INDIVIDUAL_ZZZS_YOU.tribe}</Text>
        </View>
        <View style={{ width: 75, alignItems: 'flex-end' }}>
          <Text style={{ color: '#5EBFB5', fontSize: 11, fontWeight: '500' }}>{INDIVIDUAL_ZZZS_YOU.zzzs} ZZZs</Text>
          <BarFill value={INDIVIDUAL_ZZZS_YOU.zzzs} max={maxZzzs} color="#5EBFB5" />
        </View>
      </View>
    </View>
  );
}

function IndividualHoursView() {
  const maxHours = 49;
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text style={{ color: '#6B6760', fontSize: 12, fontWeight: '500', marginBottom: 12 }}>
        Most consistent sleepers this week
      </Text>

      {INDIVIDUAL_HOURS_TOP.map(row => (
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
            <SmartAvatar name={row.name} size={28} teamName={row.tribe} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: row.isTeammate ? '#5EBFB5' : '#F5F2EA', fontSize: 12, fontWeight: '500' }}>
              {row.name}
            </Text>
            <Text style={{ color: '#6B6760', fontSize: 10 }}>{row.tribe}</Text>
          </View>
          <View style={{ width: 50, alignItems: 'flex-end' }}>
            <Text style={{ color: '#F5F2EA', fontSize: 11, fontWeight: '500' }}>{row.hours}h</Text>
            <BarFill value={row.hours} max={maxHours} />
          </View>
        </View>
      ))}

      {/* Divider */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
        <Text style={{ color: '#6B6760', fontSize: 10, marginHorizontal: 8 }}>···</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
      </View>

      {/* Your row */}
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
        <RankBadge rank={INDIVIDUAL_HOURS_YOU.rank} />
        <View style={{ marginRight: 8 }}>
          <SmartAvatar name={INDIVIDUAL_HOURS_YOU.name} size={28} teamName={INDIVIDUAL_HOURS_YOU.tribe} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#5EBFB5', fontSize: 12, fontWeight: '500' }}>{INDIVIDUAL_HOURS_YOU.name}</Text>
          <Text style={{ color: '#6B6760', fontSize: 10 }}>{INDIVIDUAL_HOURS_YOU.tribe}</Text>
        </View>
        <View style={{ width: 50, alignItems: 'flex-end' }}>
          <Text style={{ color: '#5EBFB5', fontSize: 11, fontWeight: '500' }}>{INDIVIDUAL_HOURS_YOU.hours}h</Text>
          <BarFill value={INDIVIDUAL_HOURS_YOU.hours} max={maxHours} color="#5EBFB5" />
        </View>
      </View>
    </View>
  );
}
