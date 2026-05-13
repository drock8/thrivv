# Thrivv — Production Readiness Checklist

Items that MUST be completed before going to production. Each section describes what's needed, why, and current status.

## Changelog

### 2026-05-13
- **ActionZone live data** — replaced hardcoded stats (7h 42m, 7h 12m, 5 Nights, 87%) with real Supabase-backed sleep data via `useMyWeeklySleep`. Shows last night, weekly average, streak, and consistency from actual records.
- **Biometric tier Supabase sync** — `enrollBiometric()` and `revokeBiometric()` now write `biometric_tier` to the Supabase `profiles` table, so verified badges appear on leaderboards for other users (previously AsyncStorage-only).

### 2026-05-12
- Supabase data layer: profiles, team_metadata, team_members, sleep_records tables live with seed data
- HomeScreen + LeaderboardScreen wired to real Supabase queries
- Team create/join with invite codes
- Dual-write sleep logging: Supabase first, on-chain memo in background

---

## 1. Supabase JWT Bridge (Authentication)

**Status:** Code written, NOT deployed  
**Risk:** CRITICAL — without this, any user with the anon key can write data as any pubkey

**What exists:**
- `src/lib/supabaseAuth.ts` — `useSupabaseWithPrivy()` hook that exchanges a Privy access token for a Supabase JWT
- The hook creates an authenticated Supabase client with the JWT in the Authorization header

**What's missing:**
- **Supabase Edge Function** (`privy-jwt-exchange`) — needs to:
  1. Verify the Privy access token against Privy's JWKS endpoint
  2. Extract the user's identity (Solana pubkey)
  3. Sign a Supabase-compatible JWT using the project's JWT secret
  4. Return the JWT to the client
- **RLS policies** — tighten from `USING (true)` to `auth.uid() = pubkey` on all write operations
- **Client swap** — replace `supabase` (anon client) with `getAuthenticatedClient()` in all write paths

**Estimated effort:** 1-2 hours (edge function ~50-80 lines of Deno, RLS policy updates, client swap in write functions)

---

## 2. Remove Seed/Demo Data

**Status:** Will be seeded during development phase  
**Risk:** MEDIUM — demo data must not appear in production

**What will exist:**
- `is_seed = true` flag on all seed rows in `profiles`, `team_metadata`, `sleep_records`, `team_members`
- Seed data shows "DEMO" badge in the UI

**Before production:**
- Run: `DELETE FROM sleep_records WHERE is_seed = true;`
- Run: `DELETE FROM team_members WHERE pubkey IN (SELECT pubkey FROM profiles WHERE is_seed = true);`
- Run: `DELETE FROM team_metadata WHERE is_seed = true;`
- Run: `DELETE FROM profiles WHERE is_seed = true;`
- Or use a single migration script that cleans all `is_seed` rows

---

## 3. Rate Limiting & Abuse Prevention

**Status:** Not implemented  
**Risk:** MEDIUM

**Needed:**
- Rate limit sleep record submissions (max 1 per user per 24h)
- Validate sleep duration server-side (reject > 24h, < 0h)
- Prevent self-referential team joins (user can't join their own team twice)
- Supabase Edge Function or database trigger for validation

---

## 4. Solana Mainnet Migration

**Status:** Currently on devnet  
**Risk:** HIGH — attestations on devnet have no value

**Needed:**
- Switch cluster from devnet to mainnet-beta
- Update explorer URLs
- Ensure wallet has real SOL for transaction fees
- Test memo transaction flow on mainnet

---

## 5. Solana RPC Access in Restricted Regions

**Status:** Known issue — devnet blocked in China (and potentially other restricted regions)  
**Risk:** MEDIUM — users behind firewalls cannot submit on-chain attestations

**Current behavior:**
- Sleep logging writes to Supabase first (always works), then attempts on-chain memo in background
- On-chain attestation silently fails behind firewalls — sleep is still recorded

**Options for production:**
- Use a private RPC provider (Helius, QuickNode) with a custom endpoint — may not be blocked
- Proxy RPC calls through a Supabase Edge Function or backend server
- Accept that on-chain attestation is best-effort in restricted regions

---

## 6. Weekly Reset Automation

**Status:** Not implemented  
**Risk:** MEDIUM — leaderboard queries use `week_start` column, but no automated process resets streaks or finalizes payouts

**Needed:**
- Scheduled job (Supabase cron or external) that runs Monday 00:00 UTC:
  - Snapshot final leaderboard standings
  - Trigger payout distribution (when staking is live)
  - No data deletion needed — `week_start` naturally segments weeks

---

## 7. Staking & Payout System

**Status:** Not implemented (hardcoded `0.3 SOL` stake in leaderboard)  
**Risk:** LOW for launch (can launch without staking)

**Needed:**
- On-chain staking program (Anchor/Solana)
- Payout distribution logic
- Escrow for forfeited stakes
- "Sleep Research Foundation" donation flow

---

## 8. Attestation Verification Backend

**Status:** Not implemented  
**Risk:** LOW for initial launch, HIGH for competitive integrity

**Needed:**
- Server-side verification that Solana memo transactions are valid
- Cross-check that the `tx_sig` in `sleep_records` corresponds to a real on-chain transaction
- Periodic audit job to flag discrepancies

---

## 9. Push Notifications

**Status:** Not implemented  
**Risk:** LOW

**Needed:**
- Bedtime reminders based on user's target bedtime
- Team nudges when teammates log sleep
- Streak-at-risk warnings

---

## 10. Privacy & Compliance

**Status:** Not assessed  
**Risk:** MEDIUM

**Needed:**
- Privacy policy (sleep data is sensitive health data)
- Data retention policy
- Account deletion flow (GDPR/right to be forgotten)
- Terms of service

---

## 11. App Store Readiness

**Status:** Apple Developer account pending  
**Risk:** BLOCKING for iOS

**Needed:**
- Apple Developer account approval
- App Store listing assets (screenshots, description)
- Google Play listing
- EAS Build production configuration
- App signing keys secured
