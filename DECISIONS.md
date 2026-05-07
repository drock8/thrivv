# DECISIONS.md

> Living document. Update as you build. Claude Code reads this every session — keep it accurate.
> When you make a runtime decision (wallet address, invite code, etc.), add it here immediately.

**Last updated:** _[update this every time you edit]_

---

## 1. Wallets (devnet)

Generate with `solana-keygen new --outfile <name>.json`. Fund each with `solana airdrop 2 <pubkey> --url devnet`. **Never commit private keys to git.** Store the `.json` keypair files in a gitignored folder (e.g., `.keys/`).

| Role | Pubkey | Notes |
|---|---|---|
| Founder (you) | `DTk8mw34gGrQnZsYayV6mMeGxRZZ21zGEjfWg3dD6FYw` | Your real wallet — used in demo as "You" tribe member |
| Anatoly (demo teammate 1) | `CdaUXxFVhBwh6ZG1RSXqNmfgUCViQKkt9x8qMoSWT6w6` | Pre-seeded demo account |
| Satoshi (demo teammate 2) | `2sQ52uqzczgegggPohxLX2aG1kYQz9vbnBMF6re3wZ41` | Pre-seeded demo account |
| Slumbr (sponsor) | `GtQp6dRxDxuhR7pry4MPxc4xojbTfrSdb9q7MWM6ksuD` | Pre-funds weekly sponsor pools for demo |
| REM LABS (sponsor) | `3mExtWZvXvaQvUGmzdDKjnhmLU5a3dcm246MFzhvgM4e` | Pre-funds monthly sponsor pools for demo |
| The Sleep Foundation - Nonprofit recipient | `CnFXCJVpmt4TojLXNL2koUM9h3T7venhZtLK9wRz7YPo` | Receives forfeited weekly stakes |

---

## 2. Solana program

| Item | Value |
|---|---|
| Program ID (after `anchor keys sync`) | `_______` |
| RPC endpoint | `https://api.devnet.solana.com` |
| Cluster | `devnet` |

---

## 3. Locked product values

These come from `docs/THRIVV_BUILD_GUIDE.md` section 4. Keeping them here too for fast reference during build.

| Setting | Value |
|---|---|
| Team size | 3 |
| Sleep target | 7 hours |
| Hours cap for ZZZ calc | 9.0 |
| Target bonus | +1.0 ZZZ |
| Tribe multiplier (all 3 hit) | 3× |
| Mid-night tolerance | 10 min, 2× penalty |
| Fixed weekly stake | 0.1 SOL |
| 3-day streak bonus | +10 ZZZs |
| 5-day streak bonus | +25 ZZZs |
| 7-day streak bonus | 2× weekly multiplier + stake return |
| Solo 3-day streak bonus | +5 ZZZs |
| Solo 7-day streak bonus | +15 ZZZs |
| Weekly pool split | 50/30/20 to top 3 tribes |
| Monthly pool split | 50/30/20 to top 3 tribes |
| Default target bedtime | 11pm (1380 minutes since midnight) |
| Sleep window opens | 3 hours before target bedtime |

---

## 4. Demo tribe state (pre-seeded for filming + live demo)

| Item | Value |
|---|---|
| Demo tribe invite code | `_______` (6 chars, e.g., `THRIVV` or `A3B7K9`) |
| Demo team name | `_______` (e.g., "The Sleep Lions" — admin can rename) |
| Demo tribe streak going into "tonight" | 4 days |
| Demo tribe weekly leaderboard rank | #2 or #3 (intentional — top spot looks suspicious, low spots look boring) |
| Sleep Co weekly pool pre-fund amount | `_______` SOL (suggest 5 SOL) |
| Sleep Co monthly pool pre-fund amount | `_______` SOL (suggest 10 SOL) |

### Demo tribe member display names (Supabase `profiles` rows)

| Pubkey | display_name | avatar_url |
|---|---|---|
| (Anatoly pubkey above) | Anatoly | `anatoly.png` |
| (Satoshi pubkey above) | Satoshi | `satoshi.png` |
| (Founder pubkey above) | _______ (your real name) | `you.png` |

---

## 5. Demo timeline anchors

For the demo clock and seeded `NightAttestation` records.

| Anchor | Value |
|---|---|
| Demo "tonight" date | `_______` (the live demo day, in user's local timezone) |
| Pre-seeded prior nights | 4 nights immediately preceding demo "tonight" |
| Demo "target bedtime" used for video | 11pm |
| Sleep window opens (for filming Shot 1) | 8pm |
| Late nudge sent (for filming Shot 3) | 10:45pm |
| Going to bed tap (for filming Shot 4) | 11pm |
| Wake/confirm time (for filming Shot 6) | 6:30am next day |

---

## 6. Supabase

| Item | Value |
|---|---|
| Project URL | `_______` |
| Anon key (in `.env` only — never commit) | `_______` |
| Tables migrated v1 | `profiles`, `team_metadata`, `nudges` |
| Tables deferred to v2 | `join_intents`, `chat_messages` |

---

## 7. Demo assets

| Asset | Status | Location |
|---|---|---|
| `anatoly.png` (256×256) | _______ (pending / done) | `assets/avatars/` |
| `satoshi.png` (256×256) | _______ (pending / done) | `assets/avatars/` |
| `you.png` (256×256) | _______ (pending / done) | `assets/avatars/` |
| 30-second demo video (final cut) | _______ (pending / done) | YouTube unlisted: `_______` |
| Pitch deck (8 slides) | _______ (pending / done) | `_______` |
| Pitch script (90s + 30s versions) | _______ (pending / done) | `_______` |

---

## 8. Recruitment

For the live demo segment (per `docs/DEMO_VIDEO_PLAN.md` section 1, minute 1:00–2:15).

| Person | Has Android phone? | Has Seeker? | Confirmed for demo? |
|---|---|---|---|
| _______ | _______ | _______ | _______ |
| _______ | _______ | _______ | _______ |

Plan: recruit 2 from the smartwatch crowd at the hackathon. Send via WhatsApp/Signal:

> "Hey, working on a Solana Mobile hackathon project — 3-person sleep accountability app. Could you be one of my 2 demo teammates tomorrow? 5 min of your time during the pitch. I just need you to install the app, join my tribe via a code, and fire one notification when I cue you. You'll be on the leaderboard."

---

## 9. Stack-decision log (for posterity)

These are *settled* decisions — recorded so neither you nor Claude Code re-litigates them.

- **Mobile framework: React Native + Expo + TypeScript.** Settled at hour -10. Considered Kotlin/Compose; rejected because (a) RN env was already set up, (b) the Kotlin advantage was direct Seed Vault access which we no longer need (we use MWA), (c) official Solana Mobile Expo template handles MWA out of the box.
- **Wallet primitive: MWA, not direct Seed Vault SDK.** Settled at hour -10 after stack research. Rationale: Solana Mobile docs explicitly recommend MWA for dApps; Seed Vault is for wallet apps that custody keys. THRIVV is a dApp.
- **Off-chain backend: Supabase, not Firebase or Convex.** Settled in v1 spec.
- **Auth: wallet-only via Sign-in with Solana (SIWS).** No email/password. Pubkey is identity.
- **Avatar handling v1: bundled static assets for demo accounts; identicon fallback for everyone else.** No Supabase Storage in v1.
- **Leaderboards: computed at render time from on-chain data + Supabase profile join. Never cached.**
- **ZZZ math: lives only in `programs/thrivv/src/lib.rs`. Mobile never computes scores.**


- Anchor program: WRITTEN, NOT DEPLOYED for v1 demo. Rust toolchain
  incompatibility (Rust 1.95 too new for anchor-syn 0.30.1; Rust 1.79
  too old for edition2024 deps). Spec lib.rs preserved at
  thrivv_app/programs/thrivv_app/src/lib.rs. v1 demo uses MWA-signed
  memo transactions on devnet for the on-chain proof. Custom program
  deployment deferred to post-hackathon.

---

## 10. Open questions / TODOs

Add to this list as things come up. Cross out (or move to "settled") when resolved.

- [ ] _______
- [ ] _______
- [ ] _______

---

## 11. Hour-by-hour log (optional but useful)

Quick notes during the build. Helps you reorient after breaks.

| Hour | What was done | Blockers |
|---|---|---|
| 0–1 | MWA round-trip working: tap Test Sign → fakewallet → devnet → memo tx confirmed → explorer link verified | None — fakewallet good enough for v1 demo, can upgrade to Solflare for biometric polish at hour 7 |
| 0 | _______ | _______ |
| 1 | _______ | _______ |
| 2 | _______ | _______ |
| 3 | _______ | _______ |
| 4 | _______ | _______ |
| 5 | _______ | _______ |
| 6 | _______ | _______ |
| 7 | _______ | _______ |
| 8 | _______ | _______ |
| 9 | _______ | _______ |

---

*Activate your tribe. Thrivv.*
