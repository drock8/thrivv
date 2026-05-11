import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'thrivv.bedtime';
const DEFAULT_HOUR = 22;
const DEFAULT_MIN = 45;

export type Bedtime = { hour: number; min: number };

const listeners = new Set<(b: Bedtime) => void>();

let cached: Bedtime | null = null;

export async function loadBedtime(): Promise<Bedtime> {
  if (cached) return cached;
  const raw = await AsyncStorage.getItem(KEY);
  if (raw) {
    try {
      cached = JSON.parse(raw);
      return cached!;
    } catch {}
  }
  cached = { hour: DEFAULT_HOUR, min: DEFAULT_MIN };
  return cached;
}

export async function saveBedtime(b: Bedtime) {
  cached = b;
  await AsyncStorage.setItem(KEY, JSON.stringify(b));
  listeners.forEach(fn => fn(b));
}

export function useBedtime(): Bedtime {
  const [bt, setBt] = useState<Bedtime>({ hour: DEFAULT_HOUR, min: DEFAULT_MIN });

  useEffect(() => {
    loadBedtime().then(setBt);
    listeners.add(setBt);
    return () => { listeners.delete(setBt); };
  }, []);

  return bt;
}
