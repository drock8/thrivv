import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DemoClockState = {
  enabled: boolean;
  offsetMs: number;
  frozen: boolean;
  frozenAt: number | null;
};

type DemoClockContextType = {
  state: DemoClockState;
  enable: () => void;
  disable: () => void;
  setTime: (date: Date) => void;
  freeze: () => void;
  unfreeze: () => void;
  reset: () => void;
};

const DemoClockContext = createContext<DemoClockContextType | null>(null);
const STORAGE_KEY = 'thrivv.demoClock';

const DEFAULT_STATE: DemoClockState = {
  enabled: false,
  offsetMs: 0,
  frozen: false,
  frozenAt: null,
};

export function DemoClockProvider({children}: {children: React.ReactNode}) {
  const [state, setState] = useState<DemoClockState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          setState(JSON.parse(raw));
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, loaded]);

  const ctx: DemoClockContextType = {
    state,
    enable: () => setState(s => ({...s, enabled: true})),
    disable: () => setState(DEFAULT_STATE),
    setTime: (date: Date) =>
      setState(s => ({...s, enabled: true, offsetMs: date.getTime() - Date.now()})),
    freeze: () =>
      setState(s => ({...s, frozen: true, frozenAt: Date.now() + s.offsetMs})),
    unfreeze: () =>
      setState(s => {
        if (s.frozenAt === null) return {...s, frozen: false};
        return {
          ...s,
          frozen: false,
          offsetMs: s.frozenAt - Date.now(),
          frozenAt: null,
        };
      }),
    reset: () => setState(DEFAULT_STATE),
  };

  return (
    <DemoClockContext.Provider value={ctx}>
      {children}
    </DemoClockContext.Provider>
  );
}

export function useDemoClock(): DemoClockContextType {
  const ctx = useContext(DemoClockContext);
  if (!ctx) throw new Error('useDemoClock must be used inside DemoClockProvider');
  return ctx;
}

export function useNow(): Date {
  const {state} = useDemoClock();
  const [, tick] = useState(0);

  useEffect(() => {
    if (state.frozen) return;
    const id = setInterval(() => tick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [state.frozen]);

  if (!state.enabled) return new Date();
  if (state.frozen && state.frozenAt !== null) return new Date(state.frozenAt);
  return new Date(Date.now() + state.offsetMs);
}
