# THRIVV

> *Activate your tribe. Thrivv.*

A peer-pressure group sleep accountability app for the Solana Seeker phone. Three friends commit to seven hours of sleep, stake SOL to keep their word, and prove every night with a biometric-signed transaction on Solana. Hit your 7-day streak, get your stake back. Miss, and your stake goes to sleep research. Top tribes win sponsor-funded prize pools each week and month.

Built for the Solana Mobile track at the EasyA hackathon.

---

## ⚠️ Read this first if you're starting the build

**The demo clock pattern in `docs/DEMO_MODE_SPEC.md` must be wired in during hour 0–1, before any UI component is built.** Every component that displays time (countdowns, the wind-down ring, "X minutes past bedtime" labels) must use the `useNow()` hook, not `Date.now()` or `new Date()`. Bolting this on later means refactoring every time-aware component, with high risk of bugs at the worst moment. **Read `docs/DEMO_MODE_SPEC.md` immediately after the build guide and before writing code.**

---

## Tech stack

- **Mobile:** React Native + Expo + TypeScript (NativeWind for styling)
- **On-chain:** Anchor (Rust) on Solana devnet
- **Wallet:** Mobile Wallet Adapter (MWA) → biometric via Seed Vault on Seeker
- **Off-chain:** Supabase (Postgres + Realtime)
- **Notifications:** Expo Notifications

## Repo structure

```
thrivv/
├── README.md                       ← you are here
├── DECISIONS.md                    ← runtime decisions, wallet addresses, etc.
├── docs/                           ← full specification (read these before coding)
│   ├── THRIVV_BUILD_GUIDE.md       ← architectural source of truth
│   ├── SCREEN_SPECS.md             ← screen-by-screen UX with locked color system
│   ├── DEMO_MODE_SPEC.md           ← the demo clock pattern (build from hour 0)
│   ├── DEMO_VIDEO_PLAN.md          ← 30-second product video shoot plan
│   └── CLAUDE_CODE_OPENING_PROMPT.md  ← paste this to start a Claude Code session
├── programs/
│   └── thrivv/
│       └── src/
│           └── lib.rs              ← Anchor program (paste from spec at hour 1)
├── app/                            ← Expo app code (TBD)
├── assets/
│   └── avatars/
│       ├── anatoly.png             ← demo tribe member
│       ├── satoshi.png             ← demo tribe member
│       └── you.png                 ← demo tribe member (founder)
└── ... (Expo, Anchor, package config)
```

## Where to start

If you (or Claude Code) are new to this repo:

1. Read `docs/THRIVV_BUILD_GUIDE.md` in full — it's the source of truth.
2. Read `docs/SCREEN_SPECS.md` for UX details and the locked color system.
3. **Read `docs/DEMO_MODE_SPEC.md` — non-negotiable. The demo clock pattern must be wired in during hour 0–1, before any UI is built. See callout above.**
4. Skim `docs/DEMO_VIDEO_PLAN.md` for context on what the final demo looks like.
5. Open `DECISIONS.md` to see runtime values (wallet addresses, invite codes, etc.).
6. Open `programs/thrivv/src/lib.rs` for the Anchor program.

If you're starting a Claude Code session, paste the contents of `docs/CLAUDE_CODE_OPENING_PROMPT.md` as your first message.

## The North Star

When in doubt:

1. Does it make the **wake-up biometric signing moment** better? Build it.
2. Does it make the **3-friend tribe loop** better? Build it.
3. Does it make the **sponsor model story** more believable? Build it.
4. Does it pad the feature list without making the demo more memorable? **Cut it.**

---

*Activate your tribe. Thrivv.*
