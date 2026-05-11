import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const BIOMETRIC_KEY = 'thrivv.profile.biometricVerified';

export type BiometricTier = 'none' | 'biometric' | 'hardware';

type BiometricState = {
  tier: BiometricTier;
  verifiedAt: string | null;
};

const DEFAULT_STATE: BiometricState = { tier: 'none', verifiedAt: null };

let listeners: Array<() => void> = [];
let cached: BiometricState | null = null;

function notify() {
  listeners.forEach(fn => fn());
}

export async function loadBiometricState(): Promise<BiometricState> {
  if (cached) return cached;
  const raw = await AsyncStorage.getItem(BIOMETRIC_KEY);
  cached = raw ? JSON.parse(raw) : DEFAULT_STATE;
  return cached!;
}

async function saveBiometricState(state: BiometricState) {
  cached = state;
  await AsyncStorage.setItem(BIOMETRIC_KEY, JSON.stringify(state));
  notify();
}

export async function detectHardwareWallet(): Promise<boolean> {
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return level === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG;
  } catch {
    return false;
  }
}

export async function enrollBiometric(): Promise<{ success: boolean; tier: BiometricTier }> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return { success: false, tier: 'none' };
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) {
    return { success: false, tier: 'none' };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Verify your identity for THRIVV',
    fallbackLabel: 'Use passcode',
    disableDeviceFallback: false,
  });

  if (!result.success) {
    return { success: false, tier: 'none' };
  }

  const isHardware = await detectHardwareWallet();
  const tier: BiometricTier = isHardware ? 'hardware' : 'biometric';

  await saveBiometricState({
    tier,
    verifiedAt: new Date().toISOString(),
  });

  return { success: true, tier };
}

export async function revokeBiometric() {
  await saveBiometricState(DEFAULT_STATE);
}

export function useBiometricTier(): BiometricTier {
  const [tier, setTier] = useState<BiometricTier>('none');

  useEffect(() => {
    loadBiometricState().then(s => setTier(s.tier));
    const listener = () => {
      loadBiometricState().then(s => setTier(s.tier));
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return tier;
}
