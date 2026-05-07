# THRIVV — Screen Specs

> **Living document.** UX details that will shift as the app gets built.
> Architectural decisions live in `THRIVV_BUILD_GUIDE.md` — this file is for screen-level UX only.
> When this file conflicts with the build guide, the build guide wins.

**Version:** 1.2 (wind-down ring color spec + bedtime setting locked)

---

## Screen inventory

Core screens for v1 (in build order):

1. **Onboarding / Sign-in** — first-launch wallet sign-in
2. **Tribe Setup** — create tribe OR join via code OR find tribe
3. **Home / Tonight** — the everyday surface (also drives solo widget state)
4. **Confirm Night** — THE demo moment
5. **Tribe / Team** — tribe view + nudge controls (also drives tribe widget)
6. **Leaderboard** — five toggleable views
7. **Settings** — bedtime, notifications, leave tribe

Stretch:
- **Chat thread** — Supabase Realtime, hour 10+ only
- **Share invite** — modal sheet over Tribe Setup or Tribe screen

---

## 1. Onboarding / Sign-in

**Purpose:** Get the user into the app via wallet-only auth (Sign-in with Solana).

**Flow:**
1. Big logo + tagline: "Find your tribe. Thrivv."
2. Single primary button: **"Sign in with Solana"**
3. Tap → Mobile Wallet Adapter prompt → wallet app opens → biometric (Seed Vault on Seeker) → SIWS challenge signed
4. On success: check if user has a `UserAccount` PDA
   - Yes → go to Home
   - No → go to Tribe Setup (first-time user)
5. Below the button, smaller link: *"What is Solana?"* (opens external explainer for non-crypto users — v2 polish)

**Visual notes:**
- Dark mode default. THRIVV is a sleep app — bright UI is hostile at 10pm.
- One color accent (deep teal or muted purple) on the primary button only.
- No fields, no email, no password. The simplicity is the message.

**Empty/error states:**
- User declines wallet sign → "We need your wallet to track your sleep on-chain. Try again?"
- Wallet not detected → instruction to install Solana Mobile wallet (rare on Seeker — it's pre-installed)

---

## 2. Tribe Setup

**Purpose:** First-time users land here. Three paths to a tribe.

**Header:** *"Build your tribe"* — bold, no subhead

**Three buttons stacked, each with a one-line description:**

1. **Create a tribe** — *"Start one. We'll generate a code your friends can use to join."*
2. **Join with a code** — *"Got an invite from a friend? Paste the code or tap a link."*
3. **Find a tribe** — *"We'll match you with people looking for teammates."*

### 2a. Create a tribe path

- Auto-generates a 6-char code (server-side or local randomness, not user-pickable)
- Prompts for **target bedtime** (default 11pm; clock picker)
- Calls `create_team(invite_code, target_bedtime_local_minutes)` — signed via MWA (wallet biometric)
- Lands on **post-creation screen:**
  - Big share card showing: tribe name (default = "Tribe A3B7K9"; admin can rename later), invite code, QR code, deep link
  - Primary button: **"Invite friends"** → opens Android native share sheet with prefilled message: *"Join my THRIVV tribe → thrivv://join/A3B7K9"*
  - Secondary: **"Skip — I'll do this later"** (lands them on Home in solo state)
  - Status indicator at bottom: *"1 of 3 members. Waiting for 2 more."*

### 2b. Join with a code path

- Single text field with auto-uppercase, 6-char limit
- Below: *"Or paste a thrivv://join/ link"*
- Submit → validates code, shows team preview (existing members' avatars + names) → **"Join this tribe"** confirmation → `join_team()` signed via MWA
- Lands on Tribe screen (tribe is now full or 2/3)

### 2c. Find a tribe path

- Loads the **discovery list** — top 20 users without a team, ranked by lifetime ZZZs
- Each row shows:
  - Avatar + display name (or pubkey short form)
  - Status pills: 🟢 Staking · 👥 On a team · ✋ Available
  - Lifetime stat: *"45 ZZZ avg · 12-night streak personal best"*
  - Tap row → sends a `join_intent` to that user (Supabase write)
- Empty state: *"No solo players right now. Check back soon, or create your own tribe."*
- When 3 mutual intents form a triangle → push notification to all 3 → first to confirm becomes admin via `create_team`, other two `join_team`

**Visual notes:**
- The three top-level buttons are equally weighted. Don't preference one with bigger styling — the app shouldn't push you toward "Find a tribe" if you came in with a friend's code.

---

## 3. Home / Tonight

**Purpose:** The daily surface. State machine driver. What the user sees most.

### 3.1 The wind-down ring (the centerpiece)

This is the visual hero of the home screen and also drives the solo widget. **It is the single most-glanced-at element of the entire app.** Get it right.

**Behavior:** A circular ring that depletes as bedtime approaches. The ring is *full* at 3 hours before target bedtime; it *empties* progressively until 0 at target bedtime; then it inverts and fills with a "lateness" indicator past bedtime.

**The 3-hour wind-down window opens 3 hours before the user's `target_bedtime_local_minutes` (set in Settings).**

### 3.2 Color states

Three color states, hard transitions at the boundaries:

| Window | Time remaining until bedtime | Ring color | Hex (starting palette — tweak in build) | Center copy |
|---|---|---|---|---|
| Wind-down phase | 3:00 → 1:00 | **Teal-blue** (calm, prepare) | `#4A90E2` | *"🌙 2h until bedtime"* (or whatever's accurate) |
| Get-ready phase | 1:00 → 0:00 | **Warm amber** (urgent, wrap up) | `#F5A623` | *"⏰ 47m — wrap it up"* |
| Past bedtime | 0:00 → +∞ | **Muted brick red** (gentle scold) | `#D0021B` desaturated to ~70% | *"⚠️ 12 min late"* |

**Important design notes:**
- Past bedtime, the red lateness indicator should be visible but **not aggressive.** This is a sleep app — it scolds gently, not punitively. No flashing, no animations, no urgency beyond the color.
- The transitions between colors are **hard, not gradient.** A user crossing from 1:01 to 1:00 should *see* the change. That's the behavioral nudge.
- Reserve green entirely for **success states** elsewhere in the app (the ✅ confirmed-night check, the streak +1 flash). Green should never appear in the wind-down ring. This makes success feel rare and earned.

### 3.3 Ring states outside the wind-down window

The ring has work to do at other times of day:

- **Daytime IDLE (more than 3 hours before bedtime):** ring is dim/inactive, shows last night's ZZZ score in the center. Dark gray fill, not blue.
- **COMMITTED → ASLEEP (phone face-down, sleeping):** ring shows elapsed sleep time in **deep purple**. Animated subtle breathing pulse — slow, like sleeping.
- **WAKING (just woke up):** ring is **bright white/silver** — clean, fresh. Center text: *"You slept 7h 12m. Confirm to lock it in."*
- **CONFIRMED (terminal — last night successfully signed):** ring flashes **success green** for ~1 second, then settles to a muted gold. *"Locked in. 26.1 ZZZs."*
- **FAILED (terminal — last night missed):** ring is the muted red, no animation. Center: *"Tribe streak reset."* No more emotion needed; the message is the punishment.

### 3.4 Layout (top to bottom)

1. **Status header strip** (always visible)
   - Current state pill: IDLE / COMMITTED / ASLEEP / WAKING / etc.
   - Tonight's earnable ZZZs preview: *"Hit 7h tonight → earn 24 ZZZs (with tribe)"*
   - Tiny: stake status (✓ Staked this week / ⚠️ Not staked yet)

2. **The wind-down ring** (centerpiece — see 3.1–3.3 above)

3. **Primary state-driven button** (below the ring)
   - IDLE in sleep window: **"Going to bed"** (full-width, primary)
   - INTERRUPTED: **"Returning to sleep"**
   - WAKING: **"Confirm last night"** (this routes to screen 4 — the demo moment)
   - IDLE in daytime: small ghost button: *"View tonight's plan"*

4. **Tribe status row**
   - 3 avatars in a horizontal row
   - Each shows last night's icon: ✅ confirmed / ❌ missed / ⏳ pending
   - Tap row → goes to Tribe screen

5. **Stats footer**
   - Two columns:
     - Left: *"Last night · 7h 42m · 26.1 ZZZs"*
     - Right: *"Streak · 5 nights 🔥"*

**Visual notes:**
- The ring is the hero. Everything else is small.
- The button under the ring is the only thing the user should ever need to tap on this screen during a normal night.
- Color choice anchors the whole app's brand: **cool tones default, warm tones for urgency, success green reserved for victories.**

---

## 4. Confirm Night

**Purpose:** THE demo moment. Sign the night via MWA — which on Seeker triggers the wallet app's biometric prompt (Seed Vault under the hood).

**Layout:**

1. **Hero text** (top): *"You slept 7h 42m"*
2. **Subhead:** *"Earning 26.1 ZZZs (8.7 × 3 tribe bonus)"*
3. **Tribe status preview:** *"Your tribe: 2/3 confirmed so far"* with avatars
4. **Big fingerprint icon** (centered, animated breathing pulse)
5. **Primary button:** **"Sign to lock it in"**
6. **Tiny text below:** *"Your wallet will sign this attestation to Solana devnet. This proves the night was real."*

**Tap flow (technical):**
1. Tap "Sign to lock it in"
2. App constructs the `submit_night` transaction (recent blockhash, accounts, args)
3. App calls MWA `transact()` with `signTransactions`
4. **Seeker's wallet app pops up** with biometric prompt — the user's fingerprint authorizes Seed Vault to sign
5. MWA returns signed bytes to THRIVV
6. App submits to devnet, waits for confirmation
7. Visible transaction hash slides in from bottom: *"Tx: 5x7K...9pZ → confirmed on devnet"*
8. Ring on Home screen flips to green; state moves to CONFIRMED
9. Confetti animation (subtle, 1 second max — not Mardi Gras)
10. Auto-routes back to Home after 3 seconds

**Demo polish requirements (this is THE moment):**
- The wallet biometric pop-up IS the ceremonial moment — no extra animation needed before it fires
- Audible ✓ chime when tx confirms (subtle)
- Hash visibly appears — gives judges something to point at and say "look, real tx on devnet"
- Total elapsed time, tap to home: **≤ 4 seconds** (excluding network confirmation, which can run async with optimistic UI)

**Failure states:**
- User declines wallet prompt → "We need your signature to record the night. Try again?" with retry button
- Biometric fails inside wallet → wallet app handles its own retry / PIN fallback; THRIVV just receives the eventual error or success
- Network error after signing → "We'll retry submission. Your signed attestation is saved locally." (graceful — re-broadcast on next launch)

---

## 5. Tribe / Team

**Purpose:** See your tribe, send nudges, see standings.

**Layout (top to bottom):**

1. **Tribe name + admin controls**
   - Centered name ("The Sleep Lions" or default "Tribe A3B7K9")
   - If you're admin: tiny pencil icon → rename modal
   - Tiny invite icon (top right) → opens share sheet again

2. **Three big member cards** (vertical stack or 3-column grid)
   - Avatar + display name + pubkey short form
   - Live status icon: 🌙 / 🛏️ / 😴 / ✅ / ⚠️
   - Personal stats: current solo streak, this week's ZZZs
   - **Tap card → send nudge** (push notification fires, system message in chat)
   - **Long-press card → canned message picker** ("Don't break our streak!", "GO TO BED", custom)
   - Nudge rate-limit indicator if hit: *"Nudged 12 min ago"*

3. **Tribe stats panel**
   - Current tribe streak: *"🔥 5 days"*
   - This week's collective ZZZs: *"387 ZZZs · ranked #4 this week"*
   - Weekly sponsor pool prize value: *"#1 wins 2.5 SOL (sponsored by SLEEP CO)"*
   - Monthly rank: *"Monthly: #7 of 84 tribes"*

4. **Stake status banner**
   - All 3 staked → green: *"All in. 0.3 SOL on the line this week."*
   - Some not staked → amber: *"Marcus hasn't staked yet — tribe not eligible for prize pool"*

5. **Chat thread** *(stretch only, hour 10+)*
   - Below stake banner if shipped
   - Otherwise: omit entirely (don't even show "coming soon")

**Visual notes:**
- This is the most "social" screen. Slightly warmer color palette than Home.
- Live status updates via Supabase Realtime subscription on tribe member status (or polling every 30s for hackathon).

---

## 6. Leaderboard

**Purpose:** Status, competition, sponsor-pool prize visibility.

**Layout:**

1. **Toggle bar at top** (segmented control)
   - 5 views: Indiv ZZZs · Indiv Streak · Tribe ZZZs · Tribe Streak · Monthly Pool
   - Default landing: Tribe ZZZs (this week)

2. **Period subhead** (below toggle)
   - Tribe ZZZs view: *"This week · ends Sun 11:59pm"*
   - Monthly Pool view: *"This month · ends [last day of month]"*

3. **Top 3 hero cards** (only on tribe ZZZs and Monthly Pool views)
   - Visually emphasized — gold/silver/bronze rim
   - Show tribe name, collective ZZZs, **prize amount** prominently
   - Sponsor logo small below: *"Sponsored by SLEEP CO"*

4. **Ranked list** (rows 4+)
   - Rank · avatar(s) · name · primary metric · current streak
   - Your tribe (or you) row visually highlighted no matter where in the list

5. **Your standing footer** (sticky bottom)
   - *"Your tribe is #14 of 84. Need 47 more ZZZs to enter top 10."*
   - Ghost button: *"How to climb"* → opens explainer modal (v2)

**Visual notes:**
- Top 3 should look like prizes. The product's economic story lives on this screen — don't bury it.

---

## 7. Settings

**Purpose:** Adjust target bedtime, manage tribe, see wallet info.

**Sections (each collapsible or stacked):**

1. **My sleep**
   - **Target bedtime** (clock picker, calls `set_bedtime` instruction) — **this is the most important setting in the app.** Drives the wind-down ring's 3-hour window, the widget countdown, the lateness indicator, and the tribe widget's status icons. Default 11pm. User can change anytime; takes effect immediately.
   - Daily reminder time (push notification — Supabase or local schedule)
   - Privacy: *"My location is logged at sleep start (coarse only)"* — toggle if user wants to opt out

2. **My tribe**
   - Current tribe name + invite code (with re-share button)
   - **Leave tribe** (admin: triggers dissolution + refunds; non-admin: just leaves)
   - **Rename tribe** (admin only)

3. **My wallet**
   - Pubkey (with copy button)
   - "View on devnet explorer" link
   - Lifetime stats: total hours, total ZZZs, nights tracked
   - Stakes settled (history list — v2)

4. **About**
   - Version, link to pitch deck (v2), credits

**First-run flow:** When a user signs up and creates their `UserAccount`, **bedtime selection is mandatory.** Don't let them skip it — without a target bedtime, the widget has no reference point. Default to 11pm but require a tap to confirm.

**Visual notes:**
- Settings is a utility screen. Don't over-design. Standard list item rows.
- The bedtime picker should feel weighted — slightly larger touch target, brief explainer beneath: *"We'll start your wind-down 3 hours before this."*

---

## Widgets (separate from main app screens, but specced here)

### Solo widget (1×1 home screen)

Minimum surface, maximum signal. **Mirrors the home screen ring's color logic** (see section 3.2).

- **Tiny ring at top of widget** — same color states as the home screen ring:
  - Teal-blue during wind-down (3:00–1:00 to bedtime)
  - Amber during get-ready (1:00–0:00)
  - Muted red past bedtime
  - Deep purple while ASLEEP
  - Bright white/silver in WAKING
- **Primary button** (state-driven, takes most of the widget space):
  - `IDLE` → "Going to bed" (during/after sleep window)
  - `INTERRUPTED` → "Returning to sleep"
  - `WAKING` → "Confirm last night"
- **One line below button** — shows ONE of the following depending on time of day:
  - During sleep window: countdown ("⏰ 47m until bedtime")
  - After confirm: last night's ZZZ score ("💤 26.1 ZZZs last night")
  - Idle in daytime: current streak ("🔥 5-day streak")

Resist adding anything else. At 1×1, less is more. The color of the ring carries 80% of the information at a glance.

### Tribe widget (4×1 horizontal or 2×2)

Already specced in build guide section 6. Restated:

- 3 avatars with live status
- Tap avatar → nudge
- Long-press → canned message picker
- Bottom strip: tribe streak + this week's collective ZZZs + sponsor pool rank

---

## Empty states (consolidated)

Empty states are easy to forget and brutal when missed in demos.

| Screen | Empty state | Copy |
|---|---|---|
| Tribe Setup → Find a tribe | No solo players found | *"No solo players right now. Check back soon, or create your own tribe."* |
| Tribe screen | Members 2/3 | *"Waiting for one more. Share your invite code."* + share button |
| Tribe screen | Members 1/3 | *"Just you so far. Send your code to two friends."* + share button |
| Leaderboard | Fewer than 3 tribes total | *"Be the first tribe to top this board. Streak now."* |
| Home | Never tracked a night | *"Tonight is night one. Tap below when you're heading to bed."* |
| Chat (stretch) | No messages | *"Be the first to trash-talk."* |

---

## Accessibility & inclusivity (don't skip)

- Minimum tap target 44dp (Android default)
- All status icons paired with text labels (don't rely on color alone)
- Confirm Night biometric has a PIN fallback (handled by the Seeker wallet app, which uses Seed Vault's built-in fallback)
- Dark mode default; light mode in v2

---

## What's NOT in v1 (cut list, for sanity)

- Onboarding tutorial / coach marks
- User profile editing beyond display name
- Notification settings granularity (single on/off in v1)
- Search within leaderboard
- Filtering on discovery list
- Tribe history / past streaks beyond current
- Settings → "Help & Support"
- Settings → "Account deletion" (wallet-based: just stop using the app — v2 adds explicit data wipe)

---

*Find your tribe. Thrivv.*
