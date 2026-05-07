# THRIVV — Opening Claude Code Prompt (v2)

> Paste the section labeled **"The prompt"** to Claude Code at the start of your build session.
> The notes below the prompt are for you, not for Claude.

**Version:** 2.0 (post-Anchor-pivot, accounting for existing Expo project, locked brand palette)

---

## The prompt

I'm building **THRIVV**, a peer-pressure group sleep accountability app for the Solana Seeker phone, for the Solana Mobile track at the EasyA hackathon. I have ~8 hours to ship a working demo. I am **not** an experienced React Native or Solana developer — I'm directing you through this build. I need you to be the senior engineer; I'll be the product owner who reviews your work and tests on hardware.

### Critical context: the project state RIGHT NOW

This is NOT a fresh project. Several important pieces of state:

1. **An Expo + React Native + TypeScript project already exists** in this directory. Check `package.json` — it has `expo`, `@solana-mobile/mobile-wallet-adapter-protocol-web3js@2.2.2`, React Navigation, and other dependencies pre-installed. Do NOT run `expo init` or scaffold a new project. Build on what's here.

2. **An Anchor program (`thrivv_app/programs/thrivv_app/src/lib.rs`) is in the repo but NOT being deployed for v1.** Rust toolchain incompatibility blocked compilation. The lib.rs is preserved as a v2 artifact. For the demo, **do NOT try to compile or deploy it**. The on-chain proof for v1 comes from MWA-signed memo transactions on devnet (using the standard Solana memo program — no custom code).

3. **A locked brand palette already exists in `docs/SCREEN_SPECS.md` Section 0.** Use the Glacier/Mist/Cloud/Obsidian/Eucalyptus token system. Do NOT pick colors outside this palette.

4. **Three demo avatars are bundled** in `assets/avatars/`: `anatoly.png`, `satoshi.png`, `you.png`. Use these for the three demo tribe members. Other users get deterministic identicons.

### Read these files in full before generating any code

In order:

1. `docs/THRIVV_BUILD_GUIDE.md` — architectural source of truth. Tech stack, scope, locked decisions, on-chain schema (informational), build plan, operator rules.
2. `docs/SCREEN_SPECS.md` — screen-by-screen UX. Section 0 has the locked brand palette and typography. Section 3 has the home screen with the wind-down ring color states.
3. `docs/DEMO_MODE_SPEC.md` — the demo clock pattern that must be wired in from hour 0.
4. `docs/DEMO_VIDEO_PLAN.md` — context only (what the final demo will look like).
5. `DECISIONS.md` — runtime values: wallet pubkeys, sponsor brand names, locked product values.
6. `thrivv_app/programs/thrivv_app/src/lib.rs` — informational only. Reference for what the on-chain logic SHOULD be once toolchain stabilizes. **DO NOT compile or modify.**

After reading, summarize back to me in 5 bullets max:
- The tech stack
- The demo moment
- The scoring formula
- What's IN v1 vs OUT
- The build order for hour 0–1

Once I confirm the summary, we begin.

### Hard rules for this session

These come from the spec files but I'm restating because they're easy to drift on:

1. **Demo clock from hour 0.** Every UI component that shows time must use `useNow()` from `src/lib/demoClock.tsx`, not `Date.now()` or `new Date()`. Transactions use real `Date.now()`. If you write a component that displays time, ask yourself: is this UI or transaction data? UI uses the hook; transactions use the real clock. No exceptions.

2. **MWA signs MEMO transactions, not custom Anchor instructions.** For v1, every "on-chain attestation" (start_night, submit_night, stake_week, etc.) is implemented as a **Solana memo program** transaction signed via MWA. The memo payload encodes the data: e.g., `"thrivv:submit_night:user={pubkey}:date=2026-05-07:hours=7.7:zzzs=26.1"`. This produces a real devnet transaction with a real explorer link, while deferring the custom program to v2.

3. **MWA pattern: use `transact()` from `@solana-mobile/mobile-wallet-adapter-protocol-web3js`.** The biometric UX still happens — Seeker's wallet app uses Seed Vault under the hood. The official Solana Mobile Expo template's MWA pattern is canonical; reference it, do not improvise.

4. **Brand palette is locked.** Use the tokens from `docs/SCREEN_SPECS.md` Section 0:
   - Primary: Glacier `#5EBFB5`
   - Background: Mist `#F5F2EA`
   - Surface: Cloud `#FFFFFF`
   - Foreground: Obsidian `#0A0A0A`
   - Muted: Graphite `#6B6760`
   - Border: Bone `#E5E0D5`
   - Accent: Eucalyptus `#B8D4C9`
   - Warning: `#E89B7E` Coral
   - Danger: `#C45A3D` Brick
   - Wind-down ring: Eucalyptus → Coral → Brick (per Section 3.2)
   - Use NativeWind classes that map to these tokens.

5. **Brand names are locked.** Use these in all UI copy and seeded data:
   - **REM Labs** — weekly prize pool sponsor
   - **Slumbr** — monthly prize pool sponsor (mattresses)
   - **Sleep Research Foundation** — nonprofit + forfeit recipient
   - **Anatoly** + **Satoshi** + the user themselves — the demo tribe

6. **Scope is locked.** If something isn't in `docs/THRIVV_BUILD_GUIDE.md` section 3 IN-list, don't build it without my explicit go-ahead. Especially: no chat, no real sleep verification, no extra features. Speed comes from focus.

7. **Ugly code that works > beautiful code that doesn't.** No refactoring unless I ask. No restructuring "for clarity." We ship.

8. **Confirm before destructive operations.** Before you delete files, run migrations, modify shared config, or touch the existing Expo setup, ask me first.

9. **Show me actual file paths in every response.** When you create or edit a file, say exactly where it lives.

### The hour 0–1 deliverable

By the end of hour 1 we need:

1. **DemoClockProvider wired into the app tree.** Per `docs/DEMO_MODE_SPEC.md` section 3. `useNow()` hook available throughout the app. Wraps the existing `App.tsx` root.
2. **MWA round-trip working: tap a button → wallet prompts → biometric → memo transaction lands on devnet → tx hash shown on screen.** This is the hour-1 milestone. The memo payload is `"thrivv:hello:" + userPubkey`. If this works, every other on-chain operation is just constructing different memo payloads through the same MWA call.
3. **Supabase project created** with these three tables migrated: `profiles`, `team_metadata`, `nudges`. (`join_intents` and `chat_messages` deferred.)
4. **Avatar bundle assets in place.** `assets/avatars/anatoly.png`, `satoshi.png`, `you.png` are already in the repo. Wire up the `AVATAR_BUNDLE` map (per build guide section 4.5) so other code can `require()` them.
5. **NativeWind / Tailwind config updated** with the locked color palette (per SCREEN_SPECS.md Section 0). So we can use `bg-primary`, `text-foreground`, etc.

We do these steps **in this order, one at a time, with me confirming each step works before moving on.** Don't try to do them in parallel.

### Start here

Begin by:
1. Confirming you've read all six items in the file list above (especially the build guide, screen specs Section 0, and demo mode spec).
2. Giving me the 5-bullet summary above.
3. Running `ls` and `cat package.json` to inspect what already exists in the project. Tell me what you see.

Wait for my confirmation before writing any code.

---

## Notes for you (not part of the prompt)

### Watch for these specific drift points

When Claude responds with the 5-bullet summary, check for:

- Claude trying to scaffold a new Expo project (it shouldn't — yours exists)
- Claude trying to deploy or compile the Anchor program (deferred to v2)
- Claude listing direct Seed Vault calls (should be MWA + memo)
- Claude planning to skip the demo clock (it's hour 0–1, not stretch)
- Claude using arbitrary colors instead of the locked palette tokens
- Claude suggesting features outside the IN scope (politely say no)

Common one I'd specifically watch for: Claude may instinctively write the ZZZ math in TypeScript "for now since we're not deploying Anchor." That's actually fine for v1 since the on-chain layer is mocked via memo — but make sure it's centralized in one TS file (`src/lib/zzzScoring.ts`) so when you deploy the Anchor program in v2, you can switch the math from client-computed to chain-read with one swap. Same constants, same logic, just sourced differently.

### When you reach the hour 0–1 milestone

You should have, on your phone screen:
1. A button labeled "Test Sign"
2. Tapping it triggers the wallet biometric prompt
3. After fingerprint, a real memo transaction lands on devnet
4. The tx hash is displayed in your app, with a link to Solana Explorer
5. The `useNow()` hook is wired and the demo clock provider is in the tree
6. The screen uses the locked palette (Mist background, Glacier CTA, Obsidian text)

Once you see that signature land, take a 5-minute break. Then start hour 1–3 (vertical slice of the actual user flow).

### If you fall behind

Reference `docs/THRIVV_BUILD_GUIDE.md` section 10 — the cut order. It tells you what to drop first if you're behind, and what you NEVER cut. Use it.

### Memo program reference (give Claude this if it asks)

The Solana memo program ID is: `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`

Constructing a memo transaction (TS):
```typescript
import { Transaction, TransactionInstruction, PublicKey } from '@solana/web3.js';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

function buildMemoTx(memoText: string, payerPubkey: PublicKey, recentBlockhash: string): Transaction {
  const tx = new Transaction({ feePayer: payerPubkey, recentBlockhash });
  tx.add(new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoText, 'utf-8'),
  }));
  return tx;
}
```

This is the foundation of every "on-chain" THRIVV transaction in v1. Different memo strings encode different events.

### Adding deferred features later

If you finish ahead of schedule (you won't, but if), priority order:
1. Push notifications via Expo Notifications (the nudge system) — most demo-impactful
2. Tribe widget on the home screen — second most demo-impactful
3. Anchor program deployment — fix Rust toolchain, deploy the existing `lib.rs`, swap memo transactions for real instructions
4. `chat_messages` table + Supabase Realtime chat — last priority

---

*Find your tribe. Thrivv.*
