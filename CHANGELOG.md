# CHANGELOG

## 2026-05-07

### Step 8 — Leaderboard Screen

**Goal:** Build the Leaderboard tab with 4 switchable views (Team ZZZs, Team Hours, Individual ZZZs, Individual Hours) using hardcoded mock data. All data consistent with ZZZ scoring formula.

**Views:**
- **Team ZZZs (default):** Sponsor strip (5 SOL pool by REM Labs), 10 teams with rank/avatar/ZZZs/bar/payout/stake. Sleep Seekers #3 highlighted with Glacier border.
- **Team Hours:** 10 teams ranked by hours out of 147h cap. Sleep Seekers #4 highlighted.
- **Individual ZZZs:** 12 top performers + divider + You at #43. Anatoly appears at #9.
- **Individual Hours:** 12 top + divider + You at #67. Satoshi #9 and Anatoly #10 highlighted as teammates.

**Features:**
- 2x2 pill tab grid (active: bg-primary text-foreground, inactive: bg-surface text-muted)
- THRIVV bone logo centered at top with spacing for future sponsor logos
- SmartAvatar component: real PNGs for Sleep Seekers/Anatoly/Satoshi/You, Eucalyptus initial circles for all others
- Rank badges: gold #1, silver #2, bronze #3, muted for rest
- Bar fills showing relative progress
- Glacier border + tint on "you" and teammate rows
- Foundation footer on Team ZZZs view

**Files modified:**
- `src/screens/LeaderboardScreen.tsx` — Complete rewrite from placeholder stub

**Status:** TypeScript compiles clean. All 4 tabs verified on device.

---

### Step 7c — Correct Mock Data to Match ZZZ Scoring Formula

**Goal:** Replace placeholder mock numbers with correctly calculated values using the nightZzzs() formula. Team streak = worst individual streak (was incorrectly 5, now 2).

**Night-by-night inputs (4 nights this week):**
- Anatoly: 7 + 7 + 7 + 5 = 26h, streak 3
- You: 7 + 7 + 5 + 0 = 19h, streak 2
- Satoshi: 7 + 7 + 7 + 7 = 28h, streak 4
- Tribe hit (all 3 ≥ 7h): nights 1-2 only

**Calculated values:**
- Anatoly: 66 ZZZs (24+24+8+5 + 5 solo streak bonus)
- You: 53 ZZZs (24+24+5+0)
- Satoshi: 69 ZZZs (24+24+8+8 + 5 solo streak bonus)
- Team: 188 ZZZs, 73h, streak 2, 4 days filled

**Files modified:**
- `src/screens/HomeScreen.tsx` — Updated MOCK_TEAM and MOCK_TEAMMATES constants

---

### Step 7b — Attestation Polish + Bug Fixes

**Fixes:**
- Timer no longer continues after wake confirm — AsyncStorage writes `awake` state BEFORE MWA wallet switch so remount reads correct state
- Added `AppState` listener to reload attestation from AsyncStorage when app returns to foreground after MWA
- MWA errors now surface via Alert instead of being silently swallowed
- Persistent proof line styled with light peach background block (`rgba(232, 155, 126, 0.15)`), Coral text, rounded corners — stands out for demo credibility

**Files modified:**
- `src/screens/HomeScreen.tsx`
- `src/components/home/ActionZone.tsx`

---

### Step 7 — Solana Explorer Attestation Visibility

**Goal:** Make the on-chain sleep proof visible and tappable — the demo's primary credibility moment for judges.

**Part A: Success toast after wake confirm.**
- Glacier-bordered toast slides in from top after MWA tx succeeds
- Line 1: "Night logged on chain" (Glacier)
- Line 2: "{hours}h {mins}m · {zzzs} ZZZs earned" (Mist)
- Line 3: "View on Solana Explorer →" — tappable, opens browser to devnet explorer tx page
- Auto-dismisses after 8 seconds, tap anywhere to dismiss early
- Animated slide+fade in/out using RN Animated API

**Part B: Persistent "Last on-chain proof" line.**
- Positioned between Section 2 (Teammate Cards) and Section 3 (Action Zone)
- Shows "Last on-chain proof: {hours}h {mins}m on {date} →" in Graphite text
- Tappable — opens same Solana Explorer URL
- Hidden when no attestation exists (fresh state)
- Last tx metadata (sig, hours, mins, zzzs, date) persisted in AsyncStorage under `thrivv.lastAttestation`

**ActionZone prop change:** `onSleepAction` → `onWakeConfirm(durationMs) => Promise<string | null>`. MWA tx only fires on wake confirm. Returns signature to HomeScreen for toast + persistence.

**Files modified:**
- `src/screens/HomeScreen.tsx` — Full rewrite: toast system, attestation persistence, proof line between sections 2-3, updated callback
- `src/components/home/ActionZone.tsx` — Changed prop from `onSleepAction` to `onWakeConfirm` returning signature

**Status:** TypeScript compiles clean. Awaiting on-device verification.

---

### Step 6c — Home Screen UX Polish Pass 2

**Goal:** Additional visual polish — logo, streak redesign, hours labels, layout alignment, team identity update.

**Changes:**

1. **THRIVV logo:** Added centred bone logo (`assets/thrivv-logo-bone.png`) at top of HomeScreen. Sized at 190x59 with tight padding.

2. **Team name + avatar:** Changed from "The Sleep Lions" / you.png to "Sleep Seekers" / sleep-seekers.png.

3. **Team ring 20% bigger:** Ring 100→120, avatar 62→74, strokes scaled proportionally. Team is the hero element.

4. **Hours label on inner ring:** Added Eucalyptus-colored "Xh / Xh" text below both team and individual rings so the inner ring meaning (hours) is clear.

5. **Streak pill simplified:** Team streak pill now shows dots + number only (no "STREAK X DAYS" text). 4 dots then the streak count replacing the 5th position.

6. **Individual streak pill:** Converted from 5 separate dots to same merged pill style as team — 7 circles for the week, active ones merged into Glacier pill with number.

7. **Teammate bottom-alignment:** Avatar/ring row aligns to bottom (`flex-end`) so the "You" larger card and smaller cards share a baseline.

8. **Countdown + sleep labels inside ring:** "Bed by 10:45 PM" moved inside the countdown ring below the time. "Sleeping..." moved inside the ring above the timer.

**Files modified:**
- `src/screens/HomeScreen.tsx`
- `src/components/home/TeamCard.tsx`
- `src/components/home/TeammateCard.tsx`
- `src/components/home/ActionZone.tsx`

**Status:** TypeScript compiles clean. Awaiting on-device verification.

---

### Step 6b — Home Screen UX Polish Pass

**Goal:** Visual polish and interaction fixes based on on-device review. No logic or data changes beyond sleep action flow.

**Changes:**

1. **Ring start position:** All SVG progress rings (ProgressRing + ActionZone countdown) now start at 12 o'clock instead of 9 o'clock. Fixed `strokeDashoffset` from `circumference * 0.25` to `0`.

2. **Team streak pill:** Replaced 7 individual day-dot circles + "TEAM STREAK: X NIGHTS" text with a single merged Glacier pill capsule containing filled dots + "STREAK X DAYS" text inside. Unfilled days shown as small outlined dots after the pill.

3. **"You" avatar sizing:** TeammateCard now renders "You" 10% larger (ring 99px, avatar 60px) and others 10% smaller (ring 81px, avatar 50px) for clear visual distinction.

4. **Individual streak dots:** Shrunk from 20px to 12px. Removed "X NIGHT STREAK" text label — dots are self-evident.

5. **Countdown ring wind-down:** Ring stays empty until within 3-hour wind-down window of target bedtime. Previously showed progress even 22+ hours out.

6. **Sleep action flow rewrite:**
   - "I'M GOING TO SLEEP" no longer triggers MWA transaction. Instead starts a sleep timer displayed in the center ring with animated dashed ring.
   - "I'M WAKING UP" stops the timer and shows a confirmation modal ("Good Morning! You slept for Xh Xm") with "CONFIRM & LOG SLEEP" button.
   - MWA memo transaction only fires on wake-up confirmation.
   - Sleep start time persisted to AsyncStorage so timer survives app restart.

7. **Fit on one screen:** Shrunk all sections — team card ring (140→100), avatar (90→62), score text (40→32), action zone ring (180→140), section gaps (16→10), padding reduced throughout.

**Files modified:**
- `src/components/home/ProgressRing.tsx`
- `src/components/home/TeamCard.tsx`
- `src/components/home/TeammateCard.tsx`
- `src/components/home/ActionZone.tsx`
- `src/screens/HomeScreen.tsx`

**Status:** TypeScript compiles clean. Awaiting on-device verification.

---

### Step 6 — Home Screen Shell (Dark Theme + Bottom Nav)

**Goal:** Build the dark-themed Home Screen layout with 3 sections (Team card, Teammate cards, Action zone) + 3-tab bottom nav (Home/Leaderboard/Profile). Remove all template placeholder UI. Wire MWA memo signing into the action button.

**Sub-steps completed:**

**Step 6.1 — Dark palette tokens:** Updated `tailwind.config.js` — swapped background to Obsidian (#0A0A0A), foreground to Mist (#F5F2EA), surface to near-black (#171717), border to dark (#2A2A2A). Added action (#E89B7E) and actionDeep (#D97A5C) tokens. Primary/accent/muted/warning/danger unchanged.

**Step 6.2 — ZZZ scoring constants:** Created `src/lib/zzzScoring.ts` — V1 constants (HOURS_CAP=7.0, TARGET_HOURS=7.0, TRIBE_MULTIPLIER=3, streak bonuses, per-week caps) and `nightZzzs()` function.

**Packages installed:**
- `react-native-svg@15.8.0` — SVG rendering for concentric progress rings
- `lucide-react-native@^1.14.0` — Icon library (Home, Trophy, User, Moon, Sun, Flame, etc.)

**Files created:**
- `src/lib/zzzScoring.ts` — V1 scoring constants and nightZzzs() pure function
- `src/components/home/ProgressRing.tsx` — Reusable double concentric SVG ring (inner + outer progress arcs with configurable colors, stroke widths, gap). Used by both TeamCard and TeammateCard.
- `src/components/home/TeamCard.tsx` — Section 1: team avatar with double ring, team name + pencil, big score number, weekly %, day-of-week dots (filled/dashed), streak text
- `src/components/home/TeammateCard.tsx` — Section 2: individual member card with name, avatar + double ring, percentage, ZZZ score, streak dots with checkmarks
- `src/components/home/ActionZone.tsx` — Section 3: countdown ring (uses useNow() demo clock), bed time label, last night/average/streak/consistency stats, two-state action button (I'M GOING TO SLEEP / I'M WAKING UP) with AsyncStorage persistence and MWA memo callback
- `src/screens/LeaderboardScreen.tsx` — Placeholder stub (Trophy icon + "Coming next")
- `src/screens/ProfileScreen.tsx` — Placeholder stub (User icon + "Coming next")

**Files edited:**
- `tailwind.config.js` — Dark theme palette swap + new action tokens
- `src/screens/HomeScreen.tsx` — Complete rewrite. Removed all template placeholders (Solana Mobile Expo Template text, Section components, AccountDetailFeature, MemoTestButton, Supabase test button). New layout: ScrollView with 3 sections using mock data (team_hours=98, team_zzzs=503; Anatoly 32h/152z, You 36h/184z, Satoshi 30h/167z). Signed-in state shows full dashboard. Not-signed-in state shows THRIVV branding + SignInFeature.
- `src/screens/index.ts` — Added LeaderboardScreen and ProfileScreen exports
- `src/navigators/HomeNavigator.tsx` — Replaced 2-tab (Home/Blank) with 3-tab (Home/Leaderboard/Profile). Switched from MaterialCommunityIcons to lucide-react-native. Dark tab bar styling (Obsidian bg, Glacier active, Graphite inactive).
- `App.tsx` — Force dark background (#0A0A0A) on SafeAreaView instead of system color scheme

**Mock data (hardcoded for v1):**
- Team: "The Sleep Lions", 503 ZZZs, 98 hours, 5-night streak, 5 filled days
- Anatoly: 32h / 152 ZZZs, 4-night streak
- You: 36h / 184 ZZZs, 5-night streak
- Satoshi: 30h / 167 ZZZs, 3-night streak

**Status:** TypeScript compiles clean. Awaiting on-device verification.

---

### Hour 0 — MWA Memo Round-Trip (Step 1)

**Goal:** De-risk MWA signing by proving a full round-trip: button tap → wallet biometric → memo transaction lands on devnet → tx hash visible on screen.

**Files created:**
- `src/utils/useMemoTransaction.tsx` — Hook that builds and sends a Solana Memo Program transaction via MWA. Uses `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr` with signer pubkey in keys array (`isSigner: true, isWritable: false`). Follows the existing template's `VersionedTransaction` + `getLatestBlockhashAndContext` + `signAndSendTransactions` pattern.
- `src/components/memo-test/MemoTestButton.tsx` — Test UI: one "Test Sign (Memo)" button. Sends `"thrivv:hello:{pubkey}"` as memo payload. Shows tx signature and Solana Explorer link on success. Temporary — will move to dev tools / Demo Settings once built.

**Files edited:**
- `src/screens/HomeScreen.tsx` — Added `MemoTestButton` below `AccountDetailFeature` when wallet is connected.
- `src/utils/useAuthorization.tsx` — Updated `APP_IDENTITY` from "Solana Mobile Expo Template" to `{ name: "THRIVV", uri: "https://thrivv.app" }`.

**Status:** Confirmed working on Seeker. MWA → fakewallet → devnet memo tx lands → Explorer link verified.

---

### Hour 0 — DemoClockProvider (Step 2)

**Goal:** Wire the demo clock system from hour 0 so every future UI component uses `useNow()` instead of `new Date()`. Transactions continue to use real `Date.now()`.

**Files created:**
- `src/lib/demoClock.tsx` — `DemoClockProvider` context, `useDemoClock()` admin hook (enable/disable/setTime/freeze/unfreeze/reset), and `useNow()` hook for UI time. State persists via AsyncStorage across app restarts. Freeze mode captures the exact demo moment for filming (time stops advancing). When disabled, `useNow()` returns real `new Date()` with zero overhead.

**Files edited:**
- `App.tsx` — Wrapped entire app tree with `<DemoClockProvider>` as outermost provider (outside QueryClientProvider, ClusterProvider, ConnectionProvider, etc.).

**Status:** Confirmed working on Seeker. Demo clock ticks every second on HomeScreen. Debug text removed after confirmation.

---

### Hour 0 — NativeWind + Locked Palette (Step 3)

**Goal:** Wire NativeWind v4 with the locked THRIVV brand palette so every new screen uses Tailwind utility classes with branded color tokens. Existing react-native-paper components untouched.

**Packages installed:**
- `nativewind@4.1.23`, `tailwindcss@3.4.17`, `react-native-reanimated@~3.16.7`

**Files created:**
- `tailwind.config.js` — Locked palette tokens: primary (#5EBFB5 Glacier), background (#F5F2EA Mist), surface (#FFFFFF Cloud), foreground (#0A0A0A Obsidian), muted (#6B6760 Graphite), border (#E5E0D5 Bone), accent (#B8D4C9 Eucalyptus), warning (#E89B7E Coral), danger (#C45A3D Brick). Uses `nativewind/preset`.
- `global.css` — Tailwind base/components/utilities directives.
- `nativewind-env.d.ts` — TypeScript support for `className` prop on RN components.

**Files edited:**
- `babel.config.js` — Added `jsxImportSource: "nativewind"` to babel-preset-expo, added `nativewind/babel` preset. Paper production plugin preserved.
- `metro.config.js` — Wrapped config with `withNativeWind()`. Existing crypto polyfill preserved.
- `App.tsx` — Added `import "./global.css"` after polyfills.
- `src/screens/HomeScreen.tsx` — Removed demo clock debug text. Added temporary NativeWind test box (`bg-primary p-4 rounded-lg`) to verify palette renders correctly. Will remove after confirmation.

**Status:** TypeScript compiles clean. Awaiting on-device test.

---

### Step 4 — Cleanup + Avatar Bundle Map

**Goal:** Remove the temporary NativeWind test box from HomeScreen (Step 3 verification complete). Create the avatar bundle map per THRIVV_BUILD_GUIDE.md section 4.5 so demo avatars resolve from bundled PNGs.

**Files created:**
- `src/lib/avatars.ts` — `AVATAR_BUNDLE` map keyed by lowercase display name (`'anatoly'`, `'satoshi'`, `'you'`), each pointing to a `require()` of the corresponding PNG in `assets/avatars/`. Exports `getAvatar(name)` for case-insensitive lookup; returns `null` for non-demo users (identicon fallback layer deferred). Typed with `ImageSourcePropType`.

**Files edited:**
- `src/screens/HomeScreen.tsx` — Removed the temporary `<View className="bg-primary ...">` test box and the unused `RNText` import. NativeWind import structure preserved for future components.

**Avatar PNGs verified:**
- `assets/avatars/anatoly.png` (93 KB)
- `assets/avatars/satoshi.png` (85 KB)
- `assets/avatars/you.png` (94 KB)

**Status:** TypeScript compiles clean. Avatar map not yet wired into any component — that happens when the Tribe screen is built.

**On-device verification (Step 4):**
- Temporarily wired `getAvatar('anatoly')` into HomeScreen as a 64×64 circular `<Image>` — rendered correctly on Seeker. Removed after confirmation.
- Temporarily wired demo clock controls (setTime, freeze, unfreeze, reset) with live clock readout into HomeScreen — all four operations confirmed working on Seeker. Removed after confirmation.
- All Step 1–4 features verified working on device. HomeScreen returned to clean state.

---

### Step 5 — Supabase Client + Profile Helpers

**Goal:** Install Supabase JS client, create typed client init + profile helpers, generate SQL migration for the 3 v1 tables. Prepares the off-chain layer for demo seeding, tribe metadata, and nudge rate-limiting.

**Packages installed:**
- `@supabase/supabase-js@^2.105.3`

**Files created:**
- `src/lib/supabase.ts` — Supabase client init reading `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from environment. Throws on missing vars (fail-fast).
- `src/lib/profiles.ts` — Typed `Profile` type + two helpers: `getProfile(pubkey)` returns profile or null, `upsertProfile({pubkey, display_name?, avatar_url?})` inserts or updates by pubkey. Both use the typed Supabase client.
- `.env.local` — Template with placeholder Supabase credentials (gitignored via `.env*.local` rule).

**SQL migration (run manually in Supabase SQL Editor):**
- `profiles` — pubkey TEXT PK, display_name, avatar_url, created_at
- `team_metadata` — team_pda TEXT PK, team_name, updated_at
- `nudges` — from_pubkey, to_pubkey, sent_at + composite index for rate-limit queries
- RLS enabled on all 3 tables with permissive demo policies (tighten post-hackathon)

**Status:** TypeScript compiles clean. Awaiting Supabase project creation + credentials to wire up.

**Addendum — team_avatar_url column + teams helper:**
- `team_metadata` table updated with `team_avatar_url text not null default ''` column for leaderboard team visuals.
- `src/lib/teams.ts` — Typed `TeamMetadata` type, `teamAvatarUrl(teamName)` helper that generates a DiceBear shapes SVG URL from the team name, `getTeamMetadata(teamPda)` and `upsertTeamMetadata({...})` helpers matching the profiles pattern.
