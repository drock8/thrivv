# THRIVV — Demo Mode Spec

> **Read this file before writing any component that touches time.**
> Demo mode is foundational, not bolted on. It's small but must be wired in from hour 0.

**Version:** 1.2 (seed script now includes Supabase profile inserts for demo avatars)

---

## 1. Why this exists

THRIVV's UI is heavily time-dependent. The home screen ring shifts color based on time of day. The wind-down countdown depends on time relative to target bedtime. The "Confirm last night" button only appears when the user is in WAKING state, which depends on elapsed time since they tapped "Going to bed."

For the **demo**, you need to manipulate the app's perception of time:
- Show the 8pm wind-down state at 9am during filming
- Show "you slept 7h 30m" without actually waiting 7.5 hours
- Trigger the wake-up screen on demand
- Walk judges through a full night cycle in 90 seconds

For **development**, this same mechanism lets you test "what does the UI look like at 11:50pm with a 12pm target bedtime" without actually waiting until 11:50pm.

**Solution: a global app-only fake clock that overrides what the UI thinks "now" is, while leaving real on-chain timestamps untouched.**

---

## 2. Critical design rule

**The demo clock affects DISPLAY ONLY, never on-chain transactions.**

When the user taps "Going to bed," the `start_night` instruction's timestamp comes from the Solana program (`Clock::get()?.unix_timestamp` — the validator's real clock). Same for `submit_night`. **Do not pass demo time to any instruction.** If you do, on-chain validation will reject your transactions because faked times produce nonsense (e.g., end_time before start_time).

The mobile app reads from `useDemoClock()` for:
- ✅ UI countdowns and timers
- ✅ "X minutes until bedtime" labels
- ✅ Sleep window state ("winding down" vs "late")
- ✅ The state machine's transition triggers (IDLE → COMMITTED → ASLEEP → WAKING)
- ✅ Screen color shifts based on time of day

The mobile app uses real `Date.now()` for:
- ✅ Solana transaction construction (any field that goes on-chain)
- ✅ Signing nonces, request IDs
- ✅ Anything that hits Supabase as a timestamp (so prod data stays clean)

If you're unsure, ask: **"does this number end up in a transaction or a database write?"** If yes, real clock. If it's just for the user to see, demo clock.

---

## 3. Implementation

### 3.1 Demo clock context

Create `src/lib/demoClock.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DemoClockState = {
  enabled: boolean;
  // Offset in milliseconds from real time. Positive = future, negative = past.
  offsetMs: number;
  // Frozen mode: time doesn't advance even as real time passes (for filming).
  frozen: boolean;
};

type DemoClockContext = {
  state: DemoClockState;
  enable: () => void;
  disable: () => void;
  setTime: (date: Date) => void;
  freeze: () => void;
  unfreeze: () => void;
  reset: () => void;
};

const Context = createContext<DemoClockContext | null>(null);
const STORAGE_KEY = 'thrivv.demoClock';

export function DemoClockProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoClockState>({
    enabled: false,
    offsetMs: 0,
    frozen: false,
  });

  // Persist across app restarts so demo state survives.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { setState(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const ctx: DemoClockContext = {
    state,
    enable: () => setState(s => ({ ...s, enabled: true })),
    disable: () => setState({ enabled: false, offsetMs: 0, frozen: false }),
    setTime: (date) =>
      setState(s => ({ ...s, enabled: true, offsetMs: date.getTime() - Date.now() })),
    freeze: () => setState(s => ({ ...s, frozen: true })),
    unfreeze: () => setState(s => ({ ...s, frozen: false })),
    reset: () => setState({ enabled: false, offsetMs: 0, frozen: false }),
  };

  return <Context.Provider value={ctx}>{children}</Context.Provider>;
}

export function useDemoClock() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useDemoClock must be used inside DemoClockProvider');
  return ctx;
}

/**
 * USE THIS EVERYWHERE in UI code instead of Date.now() or new Date().
 * Returns a Date object representing the app's current "perceived" time.
 */
export function useNow(): Date {
  const { state } = useDemoClock();
  const [, tick] = useState(0);

  useEffect(() => {
    if (state.frozen) return;
    const id = setInterval(() => tick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [state.frozen]);

  if (!state.enabled) return new Date();
  return new Date(Date.now() + state.offsetMs);
}
```

### 3.2 Wrap the app

In `app/_layout.tsx` (or your top-level component):

```typescript
import { DemoClockProvider } from '@/lib/demoClock';

export default function RootLayout() {
  return (
    <DemoClockProvider>
      {/* existing app tree */}
    </DemoClockProvider>
  );
}
```

### 3.3 Use everywhere

Wherever you'd write `new Date()` or `Date.now()` in a UI component, use `useNow()` instead:

```typescript
// BAD (will not respond to demo mode):
const now = new Date();
const minutesUntilBedtime = (targetBedtime.getTime() - now.getTime()) / 60000;

// GOOD:
const now = useNow();
const minutesUntilBedtime = (targetBedtime.getTime() - now.getTime()) / 60000;
```

The single rule: **UI components use `useNow()`. Transaction builders use real `Date.now()`.** No exceptions.

### 3.4 Hidden access gesture

You don't want a "Demo Mode" button visible in normal use. Two options for hiding it:

**Recommended: 5-tap on the logo on the Sign-in screen.** Counts taps within 2 seconds; on the 5th, opens the Demo Settings sheet.

```typescript
const [tapCount, setTapCount] = useState(0);
const lastTap = useRef(0);

const handleLogoTap = () => {
  const now = Date.now();
  if (now - lastTap.current > 2000) {
    setTapCount(1);
  } else {
    setTapCount(t => t + 1);
    if (tapCount + 1 >= 5) {
      setTapCount(0);
      router.push('/demo-settings');
    }
  }
  lastTap.current = now;
};
```

**Alternative: hidden in Settings → "About" → version number 5-tap.** Same idea, different location.

### 3.5 Demo Settings screen

A simple screen with these controls:

- **Toggle: Enable demo clock** (master switch)
- **Time picker: Set "now"** (calls `setTime`)
- **Quick buttons:**
  - "Set to 8pm tonight" (wind-down state)
  - "Set to 11pm" (target bedtime)
  - "Set to 11:30pm" (committed)
  - "Set to 6:30am tomorrow" (waking state)
- **Toggle: Freeze time** (stop real-time advance — useful while filming a single shot)
- **Button: Reset to real time** (calls `reset`)
- **Tribe state shortcuts:**
  - "Pre-seed: my tribe is on a 4-day streak, ranked #3"
  - "Reset all tribe state"

The tribe state shortcuts are bonus — they're a separate concern (Supabase mutations + Anchor instructions) but worth adding to the same screen for film prep convenience.

---

## 4. Demo state machine override

The state machine (IDLE → COMMITTED → ASLEEP → WAKING) normally triggers transitions based on real elapsed time and accelerometer/screen-state heuristics. For filming, you need to bypass these.

**Add a manual override panel inside Demo Settings:**

- "Force state: IDLE / COMMITTED / ASLEEP / WAKING / CONFIRMED / FAILED"

This sets the state machine's current state directly, bypassing the trigger logic. Use this in Shot 6 of the demo video to jump from "tap going to bed" straight to "wake up screen" without waiting.

```typescript
type SleepState = 'IDLE' | 'COMMITTED' | 'ASLEEP' | 'INTERRUPTED' | 'WAKING' | 'CONFIRMED' | 'FAILED';

// In your sleep state context, add a debug override:
const forceState = (s: SleepState) => {
  setSleepState(s);
};
```

Expose this only from the Demo Settings screen.

---

## 5. Demo data seeding

Separate from the demo clock, you need realistic-looking app state for filming and the live demo. The Demo Settings screen should include:

- **Button: Seed demo tribe** — Creates the demo tribe with 3 members and pre-populates everything needed for filming and live demo:
  - Generate or load 3 demo keypairs: yours + Anatoly + Satoshi (real wallet keypairs on devnet, recorded in `DECISIONS.md`)
  - Upsert 3 rows into the Supabase `profiles` table:
    - `{ pubkey: ANATOLY_PUBKEY, display_name: "Anatoly", avatar_url: "anatoly.png" }`
    - `{ pubkey: SATOSHI_PUBKEY, display_name: "Satoshi", avatar_url: "satoshi.png" }`
    - `{ pubkey: YOU_PUBKEY, display_name: "You" /* or your real name */, avatar_url: "you.png" }`
  - Call `create_team` from your wallet, `join_team` from the other two
  - Submit 4 prior nights of `NightAttestation` records on devnet (real transactions, predated `local_date` values from past 4 days) — gives the tribe a 4-day streak
  - Call `stake_week` from each member for the current week
  - Pre-fund the weekly `WeeklySponsorPool` PDA from the "Sleep Co" demo wallet (e.g., 5 SOL)
  - Result: tribe shows ranked #2 or #3 on weekly leaderboard, all 3 staked, 4-day streak going into "tonight"
- **Button: Reset demo tribe** — Wipes the above state (deletes Supabase rows, doesn't try to undo on-chain — devnet records can stay; the Reset just clears `current_team` on each `UserAccount` so they can re-create cleanly for testing)

**Important:** these seeded transactions are real on-chain writes. The "4 prior nights" should use `local_date` values from actual prior days (not demo-clock dates). The Anchor program won't accept future-dated nights, and shouldn't.

**The avatar files (`anatoly.png`, `satoshi.png`, `you.png`) must be bundled in `assets/avatars/` BEFORE the seed script runs** — the Supabase profile rows reference filenames that the mobile app maps to bundled `require()` assets. See `THRIVV_BUILD_GUIDE.md` section 4.5 for the full avatar resolution pattern.

The seed script can run as a script on your laptop (TypeScript using `@solana/web3.js`) or as a button inside the app. **App button is more convenient** for live re-seeding if something gets corrupted.

---

## 6. Production safety

Demo mode features are dangerous in production. Two protections:

1. **Wrap demo UI in a build-time flag.** In Expo, use `expo-constants` to read `EXPO_PUBLIC_ENABLE_DEMO=1` from `.env.development` only:

   ```typescript
   import Constants from 'expo-constants';
   export const DEMO_ENABLED = Constants.expoConfig?.extra?.enableDemo === true;
   ```

   Wrap the 5-tap logo handler and the Demo Settings screen with `if (!DEMO_ENABLED) return null;`.

2. **Strip from production builds.** When you eventually do an `eas build --profile production`, set `EXPO_PUBLIC_ENABLE_DEMO=0`. The 5-tap does nothing; Demo Settings screen is unreachable.

For the hackathon, you can leave it on. Just remember to disable before any public release.

---

## 7. Filming workflow (how you actually use this)

When filming the 30-second demo video tomorrow:

> **Important: you are filming video, not taking screenshots.** Demo mode lets you reach any state on demand, but the deliverable is short clips of motion (3-6 seconds each) — your hand reaching toward the phone, the ring's subtle breathing animation, a notification arriving, a fingerprint touch, a transaction hash sliding in. A video of static screenshots reads as "they couldn't get it working." A video of motion reads as "this is a real product." See `DEMO_VIDEO_PLAN.md` for the full shot list.

The role of demo mode during filming is to make each shot's *state* trivially achievable, so you spend zero time waiting for real-time UI to advance. The motion you capture in each shot is real — taps, animations, biometric prompts, transaction confirmations.

**Step-by-step using Demo Settings:**

1. **Boot the app on your Seeker.** 5-tap the logo. Demo Settings opens.
2. **Tap "Set to 8pm tonight."** Home screen now shows the wind-down state (teal-blue ring, "🌙 2h until bedtime").
3. **Roll camera. Film Shot 1** for 5+ seconds. Capture motion: hand approaching phone, slow zoom, ring's breathing animation. Not a screenshot.
4. **Tap "Set to 10:45pm."** Phone shows amber ring with "🛏️ 15m until bedtime."
5. **Have teammate fire the nudge from their phone.** Your phone receives notification. Film the notification arriving — this is a real moment, not a fake.
6. **Set state to COMMITTED. Set time to 11pm.**
7. **Film Shot 4** (tap "Going to bed," phone face-down). Capture the actual tap.
8. **Force state: WAKING. Set time to 6:30am tomorrow.**
9. **Film Shot 5+6** (wake screen, fingerprint, transaction confirms — **this part is real, not demo-clock-faked.** The signing actually happens; the tx actually lands on devnet).
10. **Force state: CONFIRMED.** Cut to tribe screen showing 3 green checks.
11. **Film Shot 7.**

Total: ~20 minutes of filming with one continuous app session. No waiting. No real overnight data.

**You can also take screenshots from demo mode if you want them for pitch deck slides or marketing materials. But the demo video itself is video, not stills.**

---

## 8. What this spec does NOT cover

- Real sleep tracking (accelerometer, screen-state detection) — v2
- Multi-device demo state sync — handled by real on-chain writes, not demo mode
- Stripping demo code from production builds beyond the env flag — v2 cleanup
- Time zone simulation across multiple users — out of scope; demo from one location

---

## 9. Build order

This goes into the **hour 0–1 setup** along with MWA round-trip:

1. ✅ Scaffold Expo template, MWA round-trip works
2. ✅ Add `DemoClockProvider`, `useNow()`, `useDemoClock()`
3. ✅ Wrap app with provider
4. ✅ Add 5-tap gesture on a placeholder Sign-in screen
5. ✅ Stub Demo Settings screen with toggle + time picker (full controls can come later)

Adding it now means every UI component built thereafter uses `useNow()` from the start. **Adding it later means refactoring every component that touched time.**

---

*Activate your tribe. Thrivv.*
