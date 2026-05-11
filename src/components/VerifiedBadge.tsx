import React from 'react';
import { View, Text } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import type { BiometricTier } from '../lib/biometricStore';

type Props = {
  tier: BiometricTier;
  size?: 'sm' | 'md';
};

const COLORS: Record<Exclude<BiometricTier, 'none'>, { bg: string; fg: string; label: string }> = {
  biometric: { bg: 'rgba(94, 191, 181, 0.15)', fg: '#5EBFB5', label: 'Verified' },
  hardware: { bg: 'rgba(255, 215, 0, 0.15)', fg: '#FFD700', label: 'HW Verified' },
};

export function VerifiedBadge({ tier, size = 'sm' }: Props) {
  if (tier === 'none') return null;

  const { bg, fg, label } = COLORS[tier];
  const iconSize = size === 'sm' ? 10 : 14;
  const fontSize = size === 'sm' ? 8 : 11;
  const py = size === 'sm' ? 2 : 3;
  const px = size === 'sm' ? 4 : 6;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: bg,
      borderRadius: 6,
      paddingVertical: py,
      paddingHorizontal: px,
      gap: 2,
    }}>
      <ShieldCheck size={iconSize} color={fg} />
      <Text style={{ color: fg, fontSize, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export function VerifiedBadgeInline({ tier }: { tier: BiometricTier }) {
  if (tier === 'none') return null;
  const { fg } = COLORS[tier];
  return <ShieldCheck size={12} color={fg} style={{ marginLeft: 3 }} />;
}
