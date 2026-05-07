# THRIVV — Claude Code Build Guide

> **Read this file in full at the start of every Claude Code session before generating code.**
> This is the source of truth. If something here conflicts with your instinct, this wins.

**Version:** 4.1 (avatar handling + leaderboard architecture clarified)

> **What changed from v4.0:**
> - Section 4.5 Supabase schema now explicitly documents avatar handling: bundled static assets for the 3 demo accounts (Anatoly, Satoshi, You), identicon fallback for everyone else. No Supabase Storage in v1.
> - New explicit rule: leaderboards computed at render time from on-chain data + Supabase profile join. Never cached. Never persisted.
> - New explicit rule: ZZZ math lives only in `lib.rs`. Mobile never computes scores.

> **What changed from v3.1 (carried forward from v4.0):**
> 1. Mobile stack: Kotlin/Jetpack Compose → **React Native + Expo + TypeScript**
> 2. Wallet primitive: ~~direct Seed Vault SDK~~ → **Mobile Wallet Adapter (MWA)**, which on Seeker delegates to Seed Vault for biometric signing under the hood
> 3. Build plan compressed to **~9 hours** to match remaining time
> 4. Anchor program (`lib.rs`) is **unchanged** — the on-chain side doesn't care what client framework signs the tx
> 5. Screen specs Confirm Night flow updated to reflect MWA prompt UX (signing happens inside the user's wallet app, biometric still triggers)

---

## 0. What we're building

**THRIVV** — the world's first peer-pressure group sleep accountability app, built natively for the Solana Seeker phone.

**Tagline (user-facing):** *Find your tribe. Thrivv.*
**Tagline (sponsor-facing):** *Sponsor the recovery champions.*

**One-liner:** Three friends commit to 7 hours of sleep, stake SOL to keep their word, and prove every night with a fingerprint signed by Solana Seed Vault. Hit your streak, get your stake back. Top tribes win sponsor-funded prize pools each week and month.

**The reframe that drives every decision:** THRIVV is **not** a sleep tracking app. It's a **commitment device with stakes and friends, where sleep is the asset, and recovery is the platform.** We are not competing with Whoop / Oura / AutoSleep. We are Beeminder + Strava for sleep, on-chain, with the phone as the notary — and a sponsorship platform underneath.

**Hackathon target:** Solana Mobile track at the EasyA hackathon. 12-hour build window. We are optimizing for **demo wow factor + technical credibility + believable business model**, not feature breadth.

---

## 1. The pitch (memorize this)

> "One in three adults are sleep-deprived. Tracking apps didn't fix it. We're going back to what worked for ten thousand years — your tribe. THRIVV is a recovery accountability platform where three friends commit to seven hours of sleep, stake SOL to keep their word, and prove it nightly with a biometric-signed transaction on Solana — the kind of attestation only a Seeker phone can produce. Hit your 7-day streak, get your stake back. Miss, and your stake goes to sleep research. The top recovery tribes each week and month win sponsor-funded prize pools — because brands that care about recovery want to be in front of the people who actually do it. Find your tribe. Thrivv."

**The demo moment:** the user wakes up, taps "Confirm last night," their wallet app pops up with a biometric prompt (Seed Vault, under the hood), the fingerprint signs the attestation transaction, MWA returns the signed bytes, the transaction lands on devnet, the team screen lights up green. Practice this until it takes 4 seconds. **This is what wins the hackathon.** No iOS competitor can build it — the biometric-signed-on-chain-attestation pattern requires Seeker hardware (or another Seed Vault-compatible Android device).

---

## 2. Tech stack — locked

| Layer | Choice | Why |
|---|---|---|
| Mobile | **React Native + Expo + TypeScript** | Familiar JS/React mental model; official Solana Mobile Expo template ships MWA out of the box; fastest iteration in the time we have |
| UI styling | **NativeWind** (Tailwind for RN) | Tailwind's utility classes feel native to anyone who's done web; fast to ship; consistent design language |
| On-chain | **Anchor (Rust)** | Saves ~200 lines of boilerplate vs raw Solana; loud, debuggable failure modes; huge ecosystem |
| Wallet signing | **Mobile Wallet Adapter (MWA)** via `@solana-mobile/mobile-wallet-adapter-protocol-web3js` | Correct primitive for a dApp (we are not custodying keys). On Seeker, MWA delegates to the installed wallet which uses Seed Vault for biometric signing — so the user still gets the fingerprint moment, we just route through MWA |
| Solana client | **`@solana/web3.js`** | Standard transaction construction |
| Backend (off-chain) | **Supabase** (Postgres + Realtime) | Profile metadata, team names, nudge rate-limits, optional chat. Keyed by pubkey |
| Push notifications | **Expo Notifications** | Powers the tribe nudge feature |
| Network | **Solana devnet** | Free, demo-friendly |
| Starting template | **Official Solana Mobile Expo template** (`@solana-mobile/solana-mobile-expo-template` or current canonical scaffold from `github.com/solana-mobile`) | MWA pre-wired, saves ~1 hour of setup |

### What we explicitly do NOT use

**Direct Seed Vault SDK.** Seed Vault is for *wallet apps* (apps that custody keys). THRIVV is a dApp — we ask the user's wallet to sign things on our behalf. The right primitive for that is MWA. This was clarified during stack research: Solana Mobile's docs explicitly recommend MWA for dApps and reserve direct Seed Vault calls for wallet builders. The biometric UX is identical from the user's perspective; only the call path differs.

**Native Kotlin / Jetpack Compose.** Considered. Rejected because (a) RN/Expo is already set up, (b) the original argument for native (direct Seed Vault access) is moot since we use MWA, (c) the official Solana Mobile Expo template handles MWA out of the box.

**Firebase, Convex.** Firebase: would migrate off post-hackathon. Convex: Claude Code hallucinates the API more often. Supabase wins on every axis.

**Real sleep verification (accelerometer, screen-off detection).** v2. For v1 the user taps "Going to bed" and "Confirm last night" — we trust them. Demo doesn't need real verification; the on-chain attestation moment is what matters.

---

## 3. Hard scope — what's IN and what's OUT for v1

### IN (build these)
- Single-button "Going to bed" flow with home-screen widget
- State machine: idle → committed → asleep → (interrupted ↔ asleep) → waking → confirmed/failed
- Mid-night phone use tolerance: up to 10 cumulative minutes; **2x penalty** (3 min on phone = 6 min deducted from sleep credit)
- Morning fingerprint sign-off via Seed Vault (THE demo moment)
- Anchor program with team/user/night/stake/sponsor-pool accounts on devnet
- Teams of exactly 3 — invite code to join
- **Fixed weekly stake** (e.g., 0.1 SOL flat) — same for everyone
- Hit 7-day tribe streak → stake returns to user; miss any night → stake goes to nonprofit
- **Sponsor-funded weekly prize pool** — top 3 tribes by collective ZZZs split **50/30/20** (eligibility: all 3 members staked)
- **Sponsor-funded monthly prize pool** — top 3 tribes by collective ZZZs split **50/30/20** (eligibility: all 3 members staked)
- Streak tracking (cumulative; resets fully on any miss)
- ZZZ scoring system (see section 5)
- Sleep window countdown (see section 6)
- Two widgets: **solo (1×1)** and **tribe (4×1 or 2×2)**
- Tribe nudge feature (tap a teammate's avatar to send a push notification)
- Coarse GPS location hash logged passively at sleep-start (not surfaced in v1 UI; **mention on pitch slide as future dataset**)
- Cold-start: solo onboarding with auto-matching to a "pending team"
- Mid-week joiners: practice during current cycle (earn ZZZs, no prize eligibility); first eligible cycle is the next full Mon–Sun
- **Demo sponsor seed:** a "Sleep Co" wallet pre-funds the demo's weekly + monthly pools so the pitch shows real prize numbers

### Stretch (build only if ahead of schedule)
- Group chat thread (Supabase Realtime) — hour 9–10+ only
- Long-press canned nudge messages
- "Bed Mode" opt-in (phone on mattress, 1.1x multiplier)

### OUT (resist scope creep — pitch-slide mentions only)
- Real sponsor onboarding flow
- Multiple sponsor categories (recovery / nutrition / fitness — v2)
- Sleep quality 1–5 rating
- Photo-of-bed proof
- Microphone / ambient audio fingerprinting
- Whoop / Oura integrations *(see v2 note in section 5)*
- Variable stake amounts
- Shift worker support
- iOS

---

## 4. Locked design decisions

| Decision | Value | Notes |
|---|---|---|
| Team size | **3** | Don't change. 2 collapses on flake, 5 has diffusion of responsibility, 3 keeps loss sharp |
| Sleep target | **7 hours** | Fixed for v1 |
| Sleep window | **7 hours within a 10pm–10am local window** | Handles night owls without shift-worker complexity |
| Mid-night tolerance | **10 cumulative minutes max, 2x penalty deducted from sleep credit** | Continuous, not binary |
| ZZZ hours cap | **9 hours** for ZZZ calc (actual hours uncapped) | Prevents gaming, rewards sustained range, doesn't punish over-sleepers |
| Stake currency | **Devnet SOL** | |
| Stake amount | **Fixed per week (default 0.1 SOL)** | Same for every user; equal stakes across tribes; v2 = variable |
| Stake outcome | **7-day streak → stake returned. Miss → stake to nonprofit wallet** | Personal commitment device |
| Forfeit destination | **Sleep-research nonprofit wallet** | Best PR answer; judges love it |
| Weekly sponsor pool | **Top 3 tribes by ZZZs split 50/30/20** | Eligibility: all 3 members staked |
| Monthly sponsor pool | **Top 3 tribes by ZZZs split 50/30/20** | Eligibility: all 3 members staked |
| Sponsor pool funding | **Sponsors deposit to pool PDAs (permissionless)** | For demo: pre-fund from a "Sleep Co" wallet |
| Time zones | **Each member's commitment is their local night** | Individual bedtimes, no synchronized schedules |
| Cold start | **Solo onboarding with auto-match to pending team** | Kills the empty-room problem |
| Mid-week joiner | **Practice cycle (no prize eligibility); first prize-eligible week is next Mon–Sun** | All 3 must stake by Mon 11:59pm local for tribe to be eligible |
| Brand | **THRIVV** (double V) | Distinctive; spell loud on pitch slide |
| Tagline (user) | **"Find your tribe. Thrivv."** | Lock |
| Tagline (sponsor) | **"Sponsor the recovery champions."** | For sponsor pitch slide only — don't muddle audiences |
| Points name | **ZZZs** ("zees") | Triple meaning: sleep sound, "catching Zs" idiom, fits brand |
| Auth model | **Wallet-only (Sign-in with Solana via Mobile Wallet Adapter)** | No email/password/OAuth. Pubkey IS identity. Profile data in Supabase keyed by pubkey |
| Invite mechanism | **6-char code + `thrivv://join/CODE` deep link via Android share sheet** | No email, SMS, or WhatsApp infra. User picks channel from native share sheet |
| Team admin | **Creator is sole admin. Can rename team, kick members, dissolve team. No promotion mechanism in v1** | If creator leaves, team dissolves; surviving members refunded unsettled stakes |
| Discovery list | **"Users without a team" list, top 20 by lifetime ZZZs** | No public browse-all-users in v1 (privacy + spam concerns) |
| Friend request flow | **Deferred to v2** | Code-based invites only in v1; auto-match for solo onboarders |
| Status indicators | **Read from on-chain state, never duplicated in Supabase** | Staking, on-team, available all derived from PDAs |
| Wallet signing | **Mobile Wallet Adapter (MWA)** | THRIVV is a dApp, not a wallet. Biometric UX still happens — Seeker's wallet app uses Seed Vault under the hood when MWA requests a signature |
| Demo moment language | **"Your wallet on Seeker signs each night with biometric, anchored on Solana devnet"** | Accurate to architecture; preserves the "fingerprint signs your sleep" emotional beat |

---

## 4.5 Auth, identity & team formation

### Auth model: wallet-only (Sign-in with Solana)

The user's Solana pubkey IS their identity. No email, no password, no OAuth.

- Sign-in flow uses **Solana Mobile Wallet Adapter** + **Sign-in with Solana (SIWS)**: the user signs a challenge message via MWA on first launch (the wallet app prompts for biometric, which on Seeker delegates to Seed Vault under the hood)
- Profile metadata (display name, avatar URL, target bedtime) lives in Supabase, keyed by pubkey
- On-chain state (`UserAccount`, `NightAttestation`, `UserStake`) is the source of truth for anything that affects ranking, prizes, or stakes

**Why this matters for the pitch:** The whole product premise is "your phone is the notary, your fingerprint signs your sleep." A separate email/password identity would muddy the on-chain story. Wallet-only keeps the narrative clean and eliminates an entire class of problems (password resets, email deliverability, OAuth setup).

### Team formation: invite codes + deep links

When a tribe is created, the `TeamAccount` PDA already includes a 6-character `invite_code`. This code becomes a deep link.

- Creator taps "Invite friends" → Android **native share sheet** opens with: *"Join my THRIVV tribe → thrivv://join/A3B7K9"*
- User picks channel (WhatsApp, iMessage, Signal, AirDrop, anything) — that's not THRIVV's problem
- Recipient taps link → app opens (or installs from Play Store, then opens) → join confirmation screen → `join_team` instruction signed by Seed Vault
- **Bonus polish:** display the same link as a QR code for in-person invites

**Why no email/SMS/WhatsApp from-app sending:**
- Email = SendGrid/Resend setup, deliverability hell, spam folders → could eat 90 min of debugging at hour 8
- SMS = Twilio API, paid, country code handling
- WhatsApp = no public API for app-initiated messages without WhatsApp Business approval (weeks)
- Native share sheet = zero backend, OS handles channel selection, every modern app does this

### Cold start: solo onboarders auto-matched

Single user signs up, no invite code. Flow:

1. User creates `UserAccount` (no team yet)
2. App offers: **(a)** "I have an invite code" or **(b)** "Find me a tribe"
3. Path (b) shows the **discovery list** — top 20 users without a team, ranked by lifetime ZZZs
4. User taps a candidate → sends a join intent (off-chain in Supabase, since no friend-request system)
5. When 3 mutual intents form a triangle, prompt one to `create_team` and the others auto-`join_team`

**Hackathon simplification:** for the demo, manually pre-match 3 demo accounts and skip the auto-match logic. The code path exists in spec; the demo doesn't have to exercise it.

### Status indicators (read from chain only)

When showing a user in any list, three status pills appear next to their name:

- **🟢 Staking** — `UserStake` PDA exists for current week (`stake.settled == false`)
- **👥 On a team** — `UserAccount.current_team` is `Some(...)`
- **✋ Available** — inverse of "on a team"

**Critical:** these are derived from on-chain state at render time. Do NOT mirror them in Supabase — sync bugs during the demo would be brutal. If a query is too slow, cache for 30 seconds in app memory; never persist.

### Admin model

- **Creator of `TeamAccount` = admin.** Permanent for v1.
- **Admin can:** rename team (off-chain, in Supabase `team_metadata` table — name doesn't need to be on-chain), kick a member (`leave_team` instruction by admin), dissolve team (refunds any unsettled stakes)
- **Admin cannot promote others in v1.** If admin leaves → team dissolves automatically.
- **Why simple:** admin-management UI = another screen. Permission checks throughout the codebase = bug surface. "What if 0 admins" edge case = no thanks. v2.

### Supabase schema (off-chain)

Minimal. Only what genuinely doesn't belong on-chain:

```
profiles (
  pubkey TEXT PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,         -- bundled filename like "anatoly.png" for v1; null falls back to identicon
  created_at TIMESTAMP
)

team_metadata (
  team_pda TEXT PRIMARY KEY,
  team_name TEXT,
  updated_at TIMESTAMP
)

join_intents (             -- cold-start auto-matching (DEFERRED to v2 if time-constrained)
  from_pubkey TEXT,
  to_pubkey TEXT,
  created_at TIMESTAMP,
  PRIMARY KEY (from_pubkey, to_pubkey)
)

nudges (                   -- rate-limit tracking for tribe widget
  from_pubkey TEXT,
  to_pubkey TEXT,
  sent_at TIMESTAMP
)

chat_messages (            -- STRETCH ONLY, hour 10+
  team_pda TEXT,
  author_pubkey TEXT,
  body TEXT,
  sent_at TIMESTAMP
)
```

Anything else lives on-chain or is computed at render time.

### Avatar handling (v1 implementation)

Avatars are bundled as static assets in the Expo project, not uploaded to Supabase Storage. This avoids storage bucket setup and an upload UI for v1.

- Three demo accounts have hand-picked avatars bundled at `assets/avatars/`:
  - `assets/avatars/anatoly.png` (Anatoly Yakovenko, Solana co-founder)
  - `assets/avatars/satoshi.png` (Satoshi Nakamoto)
  - `assets/avatars/you.png` (founder's own image)
- The `avatar_url` column in `profiles` for these three accounts stores the filename string (e.g., `"anatoly.png"`)
- All other users (anyone joining live during the hackathon) get a deterministic identicon generated from their pubkey — no upload, no `avatar_url`

**Mobile app resolution pattern:**

```typescript
const AVATAR_BUNDLE = {
  'anatoly.png': require('../assets/avatars/anatoly.png'),
  'satoshi.png': require('../assets/avatars/satoshi.png'),
  'you.png': require('../assets/avatars/you.png'),
};

function resolveAvatar(profile: Profile) {
  if (profile.avatar_url && AVATAR_BUNDLE[profile.avatar_url]) {
    return AVATAR_BUNDLE[profile.avatar_url];
  }
  return generateIdenticon(profile.pubkey);
}
```

For identicon generation, use any deterministic-from-string library (e.g., `react-native-jdenticon` or roll your own from pubkey hash → color palette). 5-minute task.

**Real avatar uploads via Supabase Storage = v2.** Don't build the upload flow for the demo.

### Leaderboards & ZZZ math: where they live

Two architectural rules to internalize, because they prevent the worst category of bugs:

**1. Leaderboards are computed at render time from on-chain data, never cached in Supabase.**

When the leaderboard screen renders:
- Fetch all `TeamAccount` PDAs via Anchor's `program.account.teamAccount.all()`
- Sort by `current_week_zzzs_tenths` (or `current_tribe_streak`, depending on the active view)
- For the rendered rows, batch-fetch member profiles from Supabase in a single `IN (...)` query
- Stitch on-chain ranking + Supabase cosmetics together for display

Cache results in app memory for 30 seconds if needed. **Never persist anywhere.** At hackathon scale (5–20 tribes) this query runs in under a second; the simplicity is worth it.

**2. ZZZ math lives in exactly one place: `programs/thrivv/src/lib.rs`.**

The mobile app NEVER computes ZZZs. It reads `night.zzzs_awarded_tenths` from `NightAttestation` and divides by 10 for display. Per-night ZZZs are computed in `submit_night`; tribe multiplier and streak bonuses are applied in `apply_tribe_bonus`. The constants (`TARGET_HOURS_TENTHS`, `HOURS_CAP_TENTHS`, `TRIBE_MULTIPLIER`, etc.) are hardcoded in `lib.rs` and not duplicated client-side.

**Why this matters:** if ZZZs were computed off-chain, the sponsor pool prizes (which are determined by ZZZ rankings) would be game-able. On-chain calculation = trustworthy ranking = real economic primitive. This is part of the moat.

**No data sync between layers needed.** On-chain is the source of truth for stats, stakes, prizes, rankings. Supabase is for cosmetics (names, avatars) and ephemerals (nudge rate-limits, optional chat). They serve different purposes; there is no cron job or replication step.

---

## 5. Scoring system — ZZZs

### Two metrics, always shown together

THRIVV tracks **two distinct numbers** for every user. They are NOT the same thing and must be displayed side-by-side everywhere.

1. **Total hours slept** — raw, uncapped, no penalty, no bonuses. The truth. This is the health stat.
2. **ZZZs** — gamified score with all penalties, bonuses, and multipliers applied. This is the game stat and the prize-pool ranking metric.

**Display rule:** lifetime totals must always be shown with **night count and average**. Examples:

- *"Lifetime: 523h across 67 nights · avg 7h 48m"*
- *"1,247 ZZZs · 67 nights · avg 18.6/night"*

The average is the headline number. The total is the supporting context. Without the denominator, totals are misleading.

### Per-night formula

```
night_zzzs = (capped_actual_hours + target_bonus) × tribe_multiplier
where:
  actual_hours        = real sleep time, in hours (e.g., 7.7 for 7h 42m)
                        — calculated AFTER the 2x interruption penalty deduction
  capped_actual_hours = min(actual_hours, 9.0)
  target_bonus        = 1.0 if actual_hours >= 7.0 else 0
  tribe_multiplier    = 3 if all 3 tribe members hit target tonight, else 1
```

**Storage:** all hour values stored as **u16 in tenths** on-chain (e.g., 77 = 7.7 hours, 246 = 24.6 ZZZs). Avoids floats. Mobile divides by 10 for display.

### Worked examples

| Scenario | Actual sleep | Pre-mult | Tribe mult | ZZZs |
|---|---|---|---|---|
| Scraped 7h, tribe missed | 7.0 | 8.0 | ×1 | **8.0** |
| Scraped 7h, tribe hit | 7.0 | 8.0 | ×3 | **24.0** |
| Slept 7h 42m, tribe hit | 7.7 | 8.7 | ×3 | **26.1** |
| Slept 8h, tribe hit | 8.0 | 9.0 | ×3 | **27.0** |
| Slept 9h+, tribe hit (capped) | 9.0+ | 10.0 | ×3 | **30.0 (max)** |
| Slept 6h 30m, tribe failed | 6.5 | 6.5 (no bonus) | ×1 | **6.5** |

**Maximum single-night ZZZs: 30.0** (perfect tribe night, capped sleep).

### Streak bonuses (cumulative)

Streak = consecutive nights where **all 3 tribe members hit target**. Streaks are **cumulative** — they do not reset at milestones. They reset to 0 on any single miss by any member.

| Milestone | Bonus per member | When awarded |
|---|---|---|
| 3-day tribe streak | **+10 ZZZs** | One-time, on the 3rd qualifying night |
| 5-day tribe streak | **+25 ZZZs** | One-time, on the 5th qualifying night |
| 7-day tribe streak | **2× multiplier on the entire week's ZZZs** | One-time, on the 7th qualifying night; ALSO triggers stake return to each member |

**The 7-day streak is the dual-trigger event:** ZZZ multiplier AND stake return. Loss aversion at day 6 is the strongest single moment in the product.

### Solo streak (consolation)

Personal streak — nights you personally hit target, regardless of tribe. Smaller bonuses so failed-tribe nights still have something:

| Milestone | Solo bonus |
|---|---|
| 3-day solo streak | +5 ZZZs |
| 7-day solo streak | +15 ZZZs |

Order of magnitude smaller than tribe streaks. Solo is consolation, not the goal.

### Worked example: full perfect week

Tribe of 3, every member hits 7.5h every night for 7 days:

- Per night: (7.5 + 1.0) × 3 = 25.5 ZZZs per member
- 7 nights raw: 25.5 × 7 = **178.5 ZZZs**
- Streak bonuses: 10 (day 3) + 25 (day 5) = **35 ZZZs**
- 7-day weekly 2× multiplier: (178.5 + 35) × 2 = **427 ZZZs per member**
- Tribe collective for the week: 427 × 3 = **1,281 ZZZs**
- Outcome: each member's stake returns + tribe ranks high in weekly + monthly sponsor pools

### Worked example: perfect-individual-broken-tribe member

You hit 7.5h every night, but your tribe missed twice during the week:

- 5 perfect tribe nights: 25.5 × 5 = 127.5
- 2 solo-only nights (tribe failed): (7.5 + 1.0) × 1 × 2 = 17
- Solo streak bonuses: +5 (3-day solo) + 15 (7-day solo) = 20
- Tribe streak broken twice → no tribe streak bonuses, no weekly 2× multiplier, **no stake return**, no prize-pool eligibility
- **Total: ~165 ZZZs + lost stake**

Gap: **427 − 165 = 262 ZZZs PLUS the returned stake PLUS prize-pool eligibility.** That gap is the entire game. It's why you nag your friends.

### Collective tribe ZZZs

Tribe ZZZs = **simple sum of all 3 members' personal ZZZs.** No separate accounting. The 3× multiplier and streak bonuses are already baked into each member's personal total, so summing produces a tribe total that naturally rewards perfect-night-together tribes. **This is the metric that ranks tribes for sponsor pool prizes.**

### v2 note: sleep tracker integration

When users connect a Whoop or Oura (v2+), the unit shifts from "hours" to **"sleep need %"** — Whoop's metric for whether you got the sleep your body actually needed (which adjusts for sleep debt, recent activity, illness, etc.). Sleep-need % is a better metric than raw hours because 7h after a hard workout day is different from 7h after a rest day. The ZZZ formula stays the same shape; the input just becomes percentage-of-need instead of capped hours. Mention on pitch slide as v2.

---

## 5.5 The sponsor model

### Why sponsors fit THRIVV

Brands that care about recovery — mattress companies, magnesium/sleep supplement brands, recovery-focused fitness brands, wellness clinics, sleep tech — desperately want access to people who *actually do the recovery work*. Most "wellness" advertising sprays into the void hoping it lands on the right person. THRIVV gives sponsors a self-selected audience: people staking real money to prove they sleep well.

### The economic loop

1. **Users stake** SOL personally. Each user's stake is their own commitment device. Win it back on a 7-day tribe streak; lose it to nonprofit on miss.
2. **Sponsors fund prize pools** — weekly and monthly. Pools sit in on-chain PDAs anyone can fund. Sponsors get visibility (logo on pool, "this week's pool brought to you by SLEEP CO") and attribution (every prize tx is on-chain).
3. **Top 3 tribes by collective ZZZs win** — split 50/30/20. Eligibility requires all 3 members staked that week.
4. **Result:** users get skin in the game (downside) and sponsor-funded upside (asymmetric reward). Sponsors get a precision-targeted audience and on-chain attribution. Nonprofit gets the forfeit revenue.

### Why this matters for the hackathon pitch

Judges see 40 sleep apps with no business model. THRIVV has:
- **Real economic primitives** (stake, forfeit, sponsor pools — all on-chain)
- **A clear monetization story** (sponsor placements + take rate on sponsor pools in the future)
- **A defensible moat** (the on-chain attestation graph is a recovery dataset no advertiser can buy elsewhere)

This is a **business**, not a demo. Lead with that.

### Demo seeding

For the hackathon, pre-fund the weekly and monthly sponsor pools from a wallet labeled **"Sleep Co"** in your demo script. On the leaderboard screen, show the pool prominently: *"This week's pool: 5 SOL, sponsored by SLEEP CO."* Judges understand simulated demo data. The pitch slide says: *"In production, sponsors fund pools directly. For this demo, our example sponsor is pre-loaded."*

---

## 6. Sleep window & widgets

### The sleep window concept

Each user sets a **target bedtime** (default 11pm, configurable). The sleep window is **3 hours wide, opening 3 hours before target bedtime**. Example for an 11pm target:

- **8pm:** sleep window opens — "🌙 2h until ideal bedtime — start winding down" (calm blue)
- **10pm:** "⏰ 1h until bedtime — wrap it up" (amber, more urgent)
- **11pm (target):** "Tap when you're in bed" (button is now primary action)
- **After 11pm:** "X minutes past ideal bedtime" (gentle red, accumulating cost)

The 3-hour window gives users 2 hours to wind down before the 1-hour "get ready" warning fires.

### Solo widget (1×1, app-icon size)

Minimum surface, maximum signal.

- **Primary button** (state-driven):
  - `IDLE` → "Going to bed" (during/after sleep window)
  - `INTERRUPTED` → "Returning to sleep"
  - `WAKING` → "Confirm last night"
- **One line below button** — shows ONE of the following depending on time of day:
  - During sleep window: countdown ("⏰ 47m until bedtime")
  - After confirm: last night's ZZZ score ("💤 26.1 ZZZs last night")
  - Idle in daytime: current streak ("🔥 5-day streak")

Resist adding anything else. At 1×1, less is more.

### Tribe widget (4×1 horizontal, or 2×2)

The social-pressure widget. This is what makes the app feel alive.

- **3 member avatars in a row,** each showing live status:
  - 🌙 Winding down (within sleep window, not yet in bed)
  - 🛏️ In bed (committed, phone idle)
  - 😴 Asleep (idle for >10 min)
  - ✅ Confirmed (signed last night successfully)
  - ⚠️ Late (past their target bedtime, not yet in bed)
  - 💤 Streak count visible on each avatar
- **Tap an avatar** → fires a **nudge** (push notification to that teammate: *"Sarah is reminding you to go to bed 💤"*) and posts a system message in the tribe chat
- **Long-press an avatar** → canned message picker ("Don't break our streak!", "GO TO BED", custom)
- **Bottom strip:** current tribe streak number + this week's collective tribe ZZZs + tribe's current rank in weekly sponsor pool

**Nudge rate-limit: 1 per teammate per hour.** No 2am weaponization.

### Tribe bedtime visibility

Each member sees the other 2 members' bedtime status at all times. This is what creates the "I see Sarah went to bed early, I shouldn't be the laggard" pressure. **Privacy-respecting:** members see *status* (in bed / late / confirmed) and *current streak*, NOT continuous location, sleep duration in real-time, or anything granular.

---

## 7. Anchor program structure

### Accounts (data model)

- **`UserAccount`** — PDA from user pubkey
  - `authority: Pubkey`
  - `current_team: Option<Pubkey>`
  - `target_bedtime_local_minutes: u16` *(minutes since midnight, e.g. 1380 = 11pm)*
  - `lifetime_actual_hours_tenths: u64` *(uncapped, raw)*
  - `lifetime_zzzs_tenths: u64` *(gamified, with all bonuses)*
  - `nights_tracked: u32`
  - `current_solo_streak: u32`
  - `joined_at: i64`
  - `bump: u8`

- **`TeamAccount`** — PDA from invite_code
  - `creator: Pubkey`
  - `members: [Pubkey; 3]`
  - `member_count: u8`
  - `target_hours: u8` (default 7)
  - `current_tribe_streak: u32`
  - `tribe_lifetime_zzzs_tenths: u64`
  - `current_week_zzzs_tenths: u64` *(reset each Monday; used for sponsor pool ranking)*
  - `current_month_zzzs_tenths: u64` *(reset each month)*
  - `week_start_timestamp: i64`
  - `invite_code: [u8; 6]`
  - `bump: u8`

- **`NightAttestation`** — PDA from user pubkey + local_date
  - `user: Pubkey`
  - `local_date: u32`
  - `sleep_start_unix: i64`
  - `sleep_end_unix: i64`
  - `interruption_seconds: u32`
  - `actual_hours_tenths: u16` *(post-penalty, uncapped)*
  - `zzzs_awarded_tenths: u16` *(after target bonus + tribe multiplier; pre-streak-bonus)*
  - `tribe_multiplier_applied: bool` *(true if all 3 hit target this night)*
  - `location_hash: Option<[u8; 8]>`
  - `verified: bool`
  - `bump: u8`

- **`UserStake`** — PDA per user per week
  - `user: Pubkey`
  - `team: Pubkey`
  - `week_number: u32`
  - `amount_lamports: u64`
  - `settled: bool`
  - `bump: u8`

- **`WeeklySponsorPool`** — global PDA per week
  - `week_number: u32`
  - `total_lamports: u64`
  - `settled: bool`
  - `bump: u8`

- **`MonthlySponsorPool`** — global PDA per month
  - `month_number: u32`
  - `total_lamports: u64`
  - `settled: bool`
  - `bump: u8`

### Instructions (verbs)

- `create_team(invite_code, target_bedtime_local_minutes)`
- `join_team(invite_code, target_bedtime_local_minutes)`
- `set_bedtime(target_bedtime_local_minutes)` — adjust target later
- `stake_week(week_number)` — user deposits the fixed weekly stake amount into their `UserStake` PDA
- `start_night(local_date, location_hash)`
- `submit_night(end_time, interruption_seconds)` — **MUST be signed via Seed Vault**; computes actual_hours_tenths and zzzs_awarded_tenths (without tribe multiplier yet)
- `apply_tribe_bonus(date)` — anyone can call once all 3 nights for a date are submitted; applies 3× multiplier retroactively, updates streak counters, updates `current_week_zzzs_tenths` and `current_month_zzzs_tenths` on team
- `award_streak_bonus(streak_length)` — called by `apply_tribe_bonus` when milestones hit
- `sponsor_deposit_weekly(week_number, amount)` — permissionless; anyone can fund the weekly pool (in v1, the demo "Sleep Co" wallet does this)
- `sponsor_deposit_monthly(month_number, amount)` — permissionless; anyone can fund the monthly pool
- `settle_user_stake(week_number)` — if user's tribe hit 7-day streak that week → return stake to user; else → transfer to nonprofit wallet
- `settle_weekly_pool(week_number)` — distributes weekly sponsor pool 50/30/20 to top 3 tribes by `current_week_zzzs_tenths` (eligibility check: all 3 members staked that week)
- `settle_monthly_pool(month_number)` — distributes monthly sponsor pool 50/30/20 to top 3 tribes by `current_month_zzzs_tenths` (eligibility check: all 3 members staked at any point during the month)

### Critical design rule

**`submit_night` is the instruction the user's wallet signs in the morning via MWA.** That signature *is* the on-chain proof. It's the demo moment. **Do not let this part get rushed or improvised.** When implementing the mobile signing call, follow the MWA signing pattern from the official `@solana-mobile/solana-mobile-expo-template` — don't let Claude Code generate the MWA flow from scratch. The biometric prompt happens inside the wallet app on Seeker; THRIVV just calls `transact()` with `signTransactions`.

**Tribe multiplier and streak bonuses are applied in a SEPARATE instruction (`apply_tribe_bonus`)** that runs after all 3 members' nights are submitted for a given date. This keeps `submit_night` simple and deterministic per-user; the social math layers on top.

**Stake settlement and pool distribution are separate instructions** so failure modes are isolated. A bug in pool distribution shouldn't block stake returns.

---

## 8. State machine (mobile app brain)

```
IDLE
  ↓ user taps "Going to bed" (widget or app)  ⛓ start_night()
COMMITTED
  ↓ screen off + accelerometer quiet for 10 min
ASLEEP
  ↓ phone unlocked
   ├── if elapsed < min_window (e.g., 4hr): → INTERRUPTED
   └── if elapsed ≥ min_window: → WAKING
INTERRUPTED  (timer counting; 2x penalty accruing)
  ↓ screen off + still for 5 min → back to ASLEEP
  ↓ interruption_seconds × 2 exceeds budget → FAILED
WAKING
  ↓ user taps "Confirm last night" + Seed Vault biometric  ⛓ submit_night()
CONFIRMED  (terminal — green check, hours credited, team notified)
   ↓ once all 3 tribe members are CONFIRMED for the date
   ⛓ apply_tribe_bonus(date)  → tribe multiplier + streak bonuses applied

FAILED  (terminal — red, no credit, team sees the gap, streak resets)
```

⛓ = on-chain write

### UX rules driven by the state machine

1. **Solo widget shows ONE button at a time**, driven by current state. The widget is your friction-killer. User should never have to open the app to record sleep state.

2. **WAKING → CONFIRMED is the demo moment.** Make this screen *ceremonial*: animation, haptic, visible hash being written. 4 seconds end-to-end.

3. **Tribe widget shows all 3 members' states in real-time.** Drives the social pressure loop.

---

## 9. The four screens

Don't open Figma. Sketch on paper, photograph, move on.

1. **Home / Tonight** — Big circular ring (target = 7h). Single primary button reflecting current state. Sleep window countdown above (when active). Below the ring: tiny row of 3 avatars showing team's status for last night (green check / red x / pending). **Always show: tonight's ZZZ potential + current streak + your stake status (staked ✓ / not staked).**

2. **Confirm Night** — "You slept 7h 42m. Earning 26.1 ZZZs (with tribe). Sign to lock it in." One fingerprint button. Show the hash being written. Animation + sound + weight. **This is the moment.**

3. **Team / Tribe** — Three members, current tribe streak, this week's collective ZZZs, **tribe's rank in weekly sponsor pool (with prize value)**, **tribe's rank in monthly sponsor pool**, group chat thread *(Supabase, stretch)*. Trash talk lives here.

4. **Leaderboard** — Five toggleable views:
   - Individual by ZZZs (this week)
   - Individual by current streak
   - Tribes by collective ZZZs (this week) — **show prize values for top 3**
   - Tribes by current tribe streak
   - **Monthly:** top tribes by month-to-date collective ZZZs — **show prize values for top 3**

Sponsor pool prizes shown prominently next to ranks. This is the "compete for SLEEP CO's 5 SOL prize pool" moment.

---

## 10. 9-hour build plan

Environment is already set up (Expo running, Solana Mobile dApp template scaffolded). Clock starts at hour 0 = "first feature commit."

| Hour | Goal | Alarm bell if not done |
|---|---|---|
| 0–1 | **MWA round-trip de-risk.** Connect to wallet on Seeker (or RN test pattern), authorize the dApp, sign a dummy message, see the signature back in JS. **Also:** Anchor scaffold (`anchor init thrivv`, paste in `lib.rs`, `anchor build` passes). Supabase project created, schema migrated. Demo "Sleep Co" sponsor wallet + nonprofit wallet generated and recorded in `DECISIONS.md`. | If MWA round-trip doesn't work by hour 1, **stop building features and fix this.** Nothing else matters until signing works. |
| 1–3 | **Vertical slice.** Three screens (Sign-in, Tonight, Confirm). One full path: open app → wallet sign-in → tap "Going to bed" → write `start_night` to chain → tap "Confirm last night" → MWA biometric signs `submit_night` → tx lands on devnet → green check on screen. **Ugly UI is fine.** This is the demo spine. | If you don't have one tx landing on devnet by hour 3, the demo is at risk. Cut features, not the spine. |
| 3–4 | **Tribe formation.** `create_team`, `join_team`, invite code → deep link → share sheet. Test with two devices (or two emulator instances). | |
| 4–5 | **ZZZ scoring + tribe bonus.** Wire `submit_night` to compute ZZZs correctly (target bonus, 9h cap, 2x interruption penalty). Implement `apply_tribe_bonus` for the 3x multiplier. Streak counters update. | |
| 5–6 | **Stake + sponsor pool.** `stake_week` instruction. `sponsor_deposit_weekly` called from the Sleep Co demo wallet to pre-fund the pool. Settlement instructions stubbed (full settlement logic can run off-chain for the demo if needed). | |
| 6–7 | **Tribe screen + nudges.** Live tribe state via Supabase Realtime (or 30s polling). Tap teammate's avatar → Expo push notification fires on their phone. **This is your second wow moment** — practice firing a notification on a second phone live during the demo. | |
| 7–8 | **Polish.** Confirm Night screen ceremonial polish (animation, haptic, visible tx hash). Leaderboard from on-chain queries with sponsor pool prize values displayed. Home screen ring + sleep window countdown. | |
| 8–9 | **Pre-record demo video** as insurance. Write 90-second pitch script. Walk the demo path 5 times. **30 min sleep if possible** (the irony of skipping sleep to ship a sleep app will not be lost on judges, but neither will rambling through your pitch on no sleep). | Demo video is **non-negotiable.** Record it even if features are missing. |

### Cut order if you fall behind

If you're behind at any checkpoint, cut in this order (cut from the bottom first):

1. ❌ Group chat (Supabase Realtime messages) — already stretch
2. ❌ Sleep window countdown widget — keep just the ring
3. ❌ Push notifications for nudges — show the nudge state in-app instead, no notification
4. ❌ Solana home-screen widget — RN home-screen widgets are non-trivial; demo from in-app
5. ❌ `apply_tribe_bonus` instruction — compute tribe multiplier client-side and submit single tx
6. ❌ `settle_weekly_pool` / `settle_monthly_pool` — show the leaderboard with mocked prize math
7. ❌ Leaderboard live data — hardcode for the demo

What you do **NOT** cut, ever:
- ✅ MWA biometric signing the night
- ✅ A real `submit_night` tx landing on devnet
- ✅ Tribe formation with 3 demo accounts
- ✅ The pitch + the demo video

---

## 11. How to direct Claude Code (operator manual)

You're not learning two stacks in 9 hours. You're **directing Claude Code through two stacks (RN/Expo on the client, Anchor/Rust on-chain) in 9 hours.** Different skill.

### Rules of engagement

1. **Lead with the official template, not docs.** You should already be on the `@solana-mobile/solana-mobile-expo-template` (or current canonical Solana Mobile Expo scaffold). MWA is wired in. Use it as known-good reference code — every time stuck → "look at how the template does it."

2. **Build vertical slices, not horizontal layers.** One full path end-to-end first (start night → chain → confirm → Seed Vault sign → chain → green check). Ugly UI, no team logic, no streaks. The spine first. Hours 0–5. Decoration after.

3. **Make Claude Code show, then explain.** Generate code first; ask for walk-through *after* it works. Absorb the stack passively while shipping. Don't try to learn-then-build — you'll run out of clock.

4. **Tight loop.** Deploy to Seeker (or emulator) every 30 min. Worst hackathon failure: "built for 6 hours, now it doesn't deploy."

5. **Stuck >15 min → change altitude.** Don't grind. Either ask Claude Code to simplify (cut feature / hardcode value / mock response) or ask it to explain the error in plain English. Most stuck moments are framework-mental-model mismatch, not real bugs.

6. **Resist refactoring.** Ugly working code stays. Refactoring is an hour-12 luxury you won't have.

7. **Keep `DECISIONS.md` updated.** Every decision (stake amount, bedtime defaults, nonprofit address, demo sponsor wallet address) goes in. Claude Code respects it across sessions. Without it, decisions get re-litigated every context reset.

8. **Reference this guide explicitly in prompts.** "Per THRIVV_BUILD_GUIDE.md section 5, generate the ZZZ scoring logic..." This anchors Claude Code to the locked spec instead of improvising.

### Specific warnings for Claude Code

- **MWA signing has a specific transact() pattern.** Claude Code may try to construct a transaction and naively call a generic `signTransaction` JS method — that won't trigger the wallet app on Seeker. The correct pattern is `transact(async (wallet) => { await wallet.authorize(...); return wallet.signTransactions({ transactions: [tx] }); })`. Reference the `@solana-mobile/mobile-wallet-adapter-protocol-web3js` README and the Expo template's example. Do not let Claude Code improvise this part.
- **Don't let Claude Code refactor working code unprompted.** It will want to. Say no.
- **Watch for hallucinated APIs.** When in doubt about a Solana Mobile Stack, Seed Vault, or Supabase method, check the official sample/docs, not Claude Code's confident assertion.
- **The data model in section 7 is locked.** If Claude Code suggests adding a field, push back unless it's strictly necessary for the demo.
- **Don't build chat until hour 10+.** It's stretch, not core. The on-chain Seed Vault moment is what wins, not a chat thread.
- **Stake settlement and pool settlement are separate instructions.** Don't let Claude Code merge them "for efficiency." Failure isolation matters.

### Backup strategy (real, not parallel codebases)

- **De-risk scary thing first (hour 0–1):** Write world's dumbest Anchor instruction (stores a u64). Call it from Seeker, signed by Seed Vault. If round-trip works, every other instruction is just more of the same. If it doesn't work, find out at hour 1, not hour 7.
- **Off-chain UI fallback:** If on-chain piece breaks at hour 10, the app should still display "night confirmed" with a local signature. Demo what works; pitch chain integration as "shipped to devnet, here's the explorer link" using a pre-recorded transaction.
- **Pre-record demo video at hour 11.** Single highest-ROI insurance policy.

---

## 12. Pre-flight checklist (do before writing any feature code)

- [ ] Devnet wallet created and funded (user wallet)
- [ ] Demo "Sleep Co" sponsor wallet created and funded (for pre-funding pools)
- [ ] Nonprofit recipient devnet wallet address chosen and recorded in `DECISIONS.md`
- [ ] Anchor + Solana CLI installed; `anchor build` succeeds on a hello-world program
- [ ] MWA signing flow understood from the official Expo template's example screen
- [ ] Supabase project created; URL and anon key copied to a `.env`
- [ ] Expo development build deploys to Seeker (or Android emulator) with hot reload working
- [ ] Official Solana Mobile Expo template scaffolded; MWA signing round-trip verified on Seeker (or RN test pattern)
- [ ] Anchor account schemas (section 7) written as Rust structs — no logic yet
- [ ] 4 wireframes sketched on paper, photographed
- [ ] 90-second pitch script drafted (with sponsor model framing)
- [ ] `DECISIONS.md` file created with: nonprofit wallet, Sleep Co wallet, fixed stake amount, target bedtime default, Anatoly/Satoshi/You demo pubkeys
- [ ] Three avatar PNG files placed in `assets/avatars/` (`anatoly.png`, `satoshi.png`, `you.png`) — square, ~256×256, transparent or solid background

---

## 13. The North Star

When in doubt:

1. Does it make the **WAKING → CONFIRMED Seed Vault moment** better? Build it.
2. Does it make the **3-friend tribe loop** better? Build it.
3. Does it make the **sponsor model story** more believable on the pitch? Build it.
4. Does it pad the feature list without making the demo more memorable? **Cut it.**

Judges will see 40 pitches. They will remember **the fingerprint signing the night**, and they will remember **the only sleep app with a real business model**. Build outward from those. Everything else is supporting cast.

---

*Find your tribe. Thrivv.*
