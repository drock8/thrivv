# CHANGELOG

## 2026-05-07

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

**Status:** Confirmed working on Seeker. Demo clock ticks every second on HomeScreen. Temporary debug `<Text>` renders `useNow().toLocaleTimeString()` — will remove after Step 3.
