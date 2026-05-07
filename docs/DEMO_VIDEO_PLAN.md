# THRIVV — Demo Video Shoot Plan

> **The 30-second product video for the hackathon pitch.**
> Filmed the morning of the demo. Combined with live action and pre-seeded state, this is your demo backbone.

**Version:** 1.0

---

## 0. Why this video exists

A live demo can't show a full night's sleep cycle in 90 seconds. This video does. It compresses the THRIVV experience — wind-down, sleep, biometric confirmation, tribe win — into a 30-second story that judges can grasp instantly.

**The video covers what live demos can't.** Live action covers what video can't (real notifications firing on real phones). Pre-seeded data covers what neither can (history, leaderboards, prize values).

**This is not a "nice to have." It is non-negotiable demo insurance.** WiFi dies, bugs appear, hands shake. The video plays no matter what.

---

## 1. The 3-minute pitch structure (where this video sits)

To orient: this video is one element of a 3-minute pitch. The full structure:

| Time | Segment |
|---|---|
| 0:00 – 0:30 | Pitch + framing (you talking, slide on screen) |
| **0:30 – 1:00** | **THIS VIDEO (30 seconds)** |
| 1:00 – 2:15 | Live action with two recruited teammates (real nudge fires, biometric signing on Seeker) |
| 2:15 – 3:00 | Sponsor model + close |

The video sets up the live segment by showing the full loop. The live segment then proves "and here's it firing in real time."

---

## 2. The shot list (what you're filming)

**Total runtime: 31 seconds. 7 shots.**

### Shot 1 — Wind-down (8pm scene) — 5 seconds

- **Demo clock:** Set to 8pm, target bedtime 11pm
- **Frame:** Phone on a desk or nightstand. Soft warm light if possible. Maybe a book or mug in shallow background.
- **On screen:** Home screen with wind-down ring active. Text reads *"🌙 2h until ideal bedtime"*. Ring is calm blue.
- **Action:** Static shot. Maybe a slight slow zoom in. Hand visible but not touching screen.
- **Voiceover:** *"At 8pm, your tribe starts winding down."*

### Shot 2 — Tribe widget, Sarah goes to bed — 4 seconds

- **Demo clock:** Set to 10:15pm
- **Frame:** Close-up on the tribe widget (4×1 layout). Three avatars visible.
- **On screen:** Widget shows three avatars. One avatar status icon flips from 🌙 (winding down) to 🛏️ (in bed) in a small animation.
- **Action:** Static. The animation does the work.
- **Voiceover:** *"Sarah goes to bed first."*

### Shot 3 — The live nudge — 5 seconds

- **Demo clock:** Set to 10:45pm
- **Frame:** Your phone's lock screen, held in your hand
- **On screen:** A push notification slides in: *"Marcus is reminding you to go to bed 💤"*
- **Action:** Real notification fires. **Teammate triggers it from their device while you film.** This is a real moment captured live.
- **Voiceover:** *"Marcus reminds you it's almost time."*

### Shot 4 — Going to bed — 4 seconds

- **Demo clock:** Set to 11pm
- **Frame:** Phone in your hand, then desk view
- **On screen:** Home screen with primary button "Going to bed". You tap it. Screen shifts to "🛏️ Goodnight" or similar confirmation state.
- **Action:** Tap the button. Place phone face down on a pillow (or framed-as-pillow surface).
- **Voiceover:** *"Tap once. The phone watches the night."*

### Shot 5 — Cut to morning — 3 seconds

- **Frame:** Black or fade transition. Optional subtitle: *"7 hours later"*
- **Action:** Hard cut or soft fade. Lighting shifts to brighter (cool morning if possible, otherwise just brighter).
- **Voiceover:** None. Let the silence breathe.

### Shot 6 — The biometric moment (THE shot) — 6 seconds

- **Demo clock:** Set to 6:30am tomorrow
- **State machine:** Force to WAKING
- **Frame:** Close-up on phone in hand. This is the hero shot of the video.
- **On screen:**
  - Wake-up screen: *"You slept 7h 30m. Earning 25.5 ZZZs."* with the fingerprint icon
  - Tap "Sign to lock it in"
  - Wallet app pops up with biometric prompt
  - **Real fingerprint touch on the Seeker** — film this part close
  - Transaction hash slides in: *"Tx: 5x7K…9pZ → confirmed on devnet"*
  - Green check
- **Action:** Tap, fingerprint, watch the hash appear. **This is the only fully real, non-demo-clock-faked part of the video.** The signing is genuine; the transaction lands on devnet for real.
- **Voiceover:** *"Your fingerprint signs the night to Solana. Unfakeable. On-chain."*

### Shot 7 — Tribe wins — 3 seconds

- **State:** All three tribe members CONFIRMED for the date (pre-seeded)
- **Frame:** Tribe screen
- **On screen:** Three green checks across the avatars. *"5-day streak 🔥"* lights up. Sponsor pool rank visible: *"Tribe ranked #2 this week — 2.5 SOL on the line"*
- **Action:** Static. Optional subtle confetti.
- **Voiceover:** *"Your tribe just earned tonight. Activate your tribe."*

### End card — 1 second

- THRIVV logo + tagline: *"Activate your tribe."*

---

## 3. The voiceover script (full read)

Recorded as a single continuous take, then synced to visuals. Length: ~28 seconds at conversational pace.

> "At 8pm, your tribe starts winding down. Sarah goes to bed first. Marcus reminds you it's almost time. Tap once — the phone watches the night. **\[7-hour cut\]** Your fingerprint signs the night to Solana. Unfakeable. On-chain. Your tribe just earned tonight. Activate your tribe."

**Read it like you mean it.** Lower register, confident, slightly slower than your nervous instinct. Pause before "Unfakeable. On-chain." — those two words carry the whole pitch.

---

## 4. Pre-flight checklist (do these BEFORE filming)

If any of these aren't done, **don't start filming yet.**

### App-side prep

- [ ] Demo clock implementation working (per `DEMO_MODE_SPEC.md`) — 5-tap gesture opens Demo Settings, time can be set, state machine can be forced
- [ ] Pre-seeded tribe state on devnet:
  - [ ] Demo tribe created with you + 2 demo accounts
  - [ ] 4 prior nights of `NightAttestation` records (real on-chain) showing tribe streak of 4
  - [ ] All 3 members staked for current week
  - [ ] Sleep Co sponsor wallet has pre-funded 5 SOL into weekly sponsor pool
  - [ ] Tribe shows ranked #2 or #3 on weekly leaderboard
- [ ] Tribe widget installed and visible on Seeker home screen (if widget shipped) — OR the tribe screen looks polished enough to substitute
- [ ] Push notification system working — teammate's tap on your avatar lands as a notification on your phone
- [ ] Wallet biometric flow works — `submit_night` actually signs and lands on devnet via MWA

### Physical prep

- [ ] Seeker phone fully charged
- [ ] Teammate's Android phone with THRIVV installed (for triggering the nudge in Shot 3)
- [ ] Filming surface: nightstand or desk that can pass for both "evening" and "morning" with lighting changes
- [ ] Optional: book, mug, or other prop for "8pm" warmth
- [ ] Camera (your laptop, a teammate's iPhone, or your Seeker if you have a second device — pick whatever has the best camera that isn't the Seeker you're filming)
- [ ] Voice recording device (phone's Voice Memos is fine)

### Software prep

- [ ] CapCut installed (mobile or desktop) — OR iMovie if on Mac
- [ ] Empty CapCut project ready to receive clips
- [ ] Voiceover script printed or on a second device for reading

---

## 5. The filming session (continuous, 30-45 minutes)

Film all visuals in one session, manipulating the demo clock between shots. Don't break for meals, don't switch locations, don't film over multiple sessions — continuity will break.

### Step-by-step

1. **Boot Seeker. 5-tap logo. Open Demo Settings.**
2. **Tap "Set to 8pm tonight."** Verify home screen shows wind-down state, ring is blue, "🌙 2h until bedtime" visible.
3. **Roll camera. Film Shot 1.** Two takes minimum. Hold the static shot for 6+ seconds so you have headroom in editing.
4. **Set demo clock to 10:15pm.** Verify tribe widget is reachable.
5. **Film Shot 2.** Trigger the avatar status flip if your app has that animation; otherwise just film the widget state and add the transition in CapCut.
6. **Set demo clock to 10:45pm.**
7. **Coordinate with teammate.** Phone in your hand, lock screen visible.
8. **Teammate fires the nudge from their phone.** Film Shot 3 capturing the notification arriving. Two takes — get one where the notification lands cleanly without being cut off.
9. **Set demo clock to 11pm.** Film Shot 4 — tap "Going to bed," place phone face down.
10. **Cut. Reposition for Shot 5/6.** Brighter lighting if possible. Open curtains, turn on overhead light, whatever achieves the morning shift.
11. **Force state machine to WAKING. Set demo clock to 6:30am tomorrow.**
12. **Film Shot 5+6 as a continuous take.** Phone face-down on pillow → flip up → tap "Confirm" → biometric → transaction hash → green check. **This take is real signing. Do not interrupt mid-take.** If it fails, reset the night attestation (you may need to delete the night PDA on devnet and retry) and refilm.
13. **Force state to CONFIRMED for all three tribe members.** Cut to tribe screen.
14. **Film Shot 7.** Three green checks visible.
15. **Optional: film an additional safety take of every shot.** Cheap insurance.

### Total time: 30-45 minutes filming

### Then: 30 minutes editing in CapCut

- Drop clips into timeline in shot order
- Trim each to target duration
- Add the morning transition between Shot 4 and Shot 5 (fade to black + "7 hours later" subtitle)
- Drop voiceover audio onto a separate track
- Sync voiceover to visuals — voiceover drives the pacing, not the other way around
- Add THRIVV logo end card
- Export at 1080p, MP4

---

## 6. Lighting cheat (read this before filming)

You can't authentically film 8pm warm and 6:30am cool in the same room at 9am unless you actively manipulate light. Two paths:

### The lazy path (recommended)

Don't try to differentiate evening from morning in the room itself. Let the **app's UI color shifts** carry the time-of-day story:
- Ring is blue at 8pm (Shot 1)
- Ring is amber at 11pm (Shot 4)
- Ring is green/bright at 6:30am (Shot 6)

The audience reads the app, not the room. As long as the app shows the right state, the room can be lit however it's lit when you start.

### The cheap path (if you have 10 extra minutes)

- Shot 1 (8pm): pull curtains partially closed, desk lamp on, warm tones
- Shot 5/6 (morning): pull curtains fully open, desk lamp off, cool natural light

Same room, just adjust the curtains and a single lamp. Don't overthink this.

### The expensive path (skip)

Multiple light sources, color gels, scene staging. **You don't have time. Don't.**

---

## 7. Voiceover recording

### Script (repeated for clarity)

> "At 8pm, your tribe starts winding down. Sarah goes to bed first. Marcus reminds you it's almost time. Tap once — the phone watches the night. **\[pause for visual transition\]** Your fingerprint signs the night to Solana. Unfakeable. On-chain. Your tribe just earned tonight. Activate your tribe."

### How to record

- Find the quietest room available. Bathroom is good (soft surfaces dampen echo).
- Phone close to mouth — 6 inches, not 12
- Read the entire script in one continuous take
- Record 3-5 takes, pick the best
- Don't try for radio-perfect quality. **Confident and clear beats studio.**

### What to avoid

- Reading too fast (your nervous default — slow down deliberately)
- Smiling or upspeak (this isn't a YouTube vlog)
- Whispering (lean into your normal speaking volume)
- Rerecording in different environments — keep all audio in one acoustic space

---

## 8. Editing in CapCut (15-30 minutes)

CapCut is the hackathon-friendly choice: free, mobile or desktop, intuitive timeline.

### Workflow

1. Create new project, 16:9 vertical OR horizontal — match your visuals
2. Drop all 7 clips into the timeline in order
3. Trim each to target duration:
   - Shot 1: 5s · Shot 2: 4s · Shot 3: 5s · Shot 4: 4s · Shot 5: 3s · Shot 6: 6s · Shot 7: 3s · End card: 1s
4. Add transitions between shots — keep them simple. Hard cuts work fine. The Shot 4 → Shot 5 transition is the only one worth a soft fade.
5. Drop voiceover on a separate audio track. Adjust visual clip lengths to match voiceover pacing.
6. Add subtitle text overlays at key moments:
   - "8pm" subtle in corner of Shot 1
   - "10:45pm" in corner of Shot 3
   - "7 hours later" full-screen in Shot 5
   - "6:30am" in corner of Shot 6
7. Add THRIVV logo as the end card
8. Export at 1080p, H.264, MP4

### What to NOT do

- Don't add background music. Voiceover carries the audio. Music distracts from "Unfakeable. On-chain."
- Don't add fancy transitions (whip pans, glitch effects). They look amateur.
- Don't add a watermark. Trust the brand.
- Don't go above 30 seconds. Strict ceiling.

---

## 9. Backup plans (in priority order)

### Plan A: All shots filmed and edited as planned
The dream. Execute section 5.

### Plan B: Can't recruit a teammate for Shot 3 (live nudge)
Replace with a self-nudge: have a second device (your laptop running an emulator, or a friend's phone) trigger the nudge. The notification arrival on your hero phone is what matters, not who triggered it.

### Plan C: Biometric flow not working at film time
Replace Shot 6 with a screen recording of the biometric flow that you've previously captured working. Lose the cinematic close-up of the fingerprint. The transaction hash and green check still go on screen. This is uglier but functional.

### Plan D: Demo clock not working at film time
Build the video without the time-of-day variations. Show all states (wind-down, going to bed, confirm, tribe wins) without the "8pm... 11pm... 6:30am" framing. Voiceover compensates: *"During the evening... at bedtime... in the morning..."* This is the worst version but still demo-able.

### Plan E: Nothing on the app works
Use AI image generation or stock footage for everything except the biometric. Voice over generic visuals. **You're not at this point — but if you are, you have bigger problems than the video.**

---

## 10. Filming order & timing — the morning of demo

This whole production needs to happen before your pitch slot. Recommended schedule:

| Time | Task |
|---|---|
| **8:00 – 8:30am** | Final app polish, ensure Demo Settings + biometric flow are stable |
| **8:30 – 9:00am** | Pre-seed tribe state on devnet (run the seed script per `DEMO_MODE_SPEC.md`) |
| **9:00 – 9:15am** | Recruit 2 teammates (smartwatch crowd from yesterday) |
| **9:15 – 9:35am** | Film all visual shots (sections 5 above) |
| **9:35 – 9:45am** | Record voiceover takes |
| **9:45 – 10:15am** | Edit in CapCut |
| **10:15 – 10:30am** | Review video, run the live demo segment with teammates one full rehearsal |
| **10:30am+** | Whatever your pitch slot is. Demo. |

**Total demo prep: ~2 hours separate from your build time.** Plan accordingly.

---

## 11. The "judges expectations" reality check

Judges at a hackathon understand:
- A 30-second video can't be filmed in real time
- Demo data is seeded, not organically grown
- Live demos break, so videos are insurance
- "Mocked" doesn't mean "deceptive" — it means "demonstrated"

What they're evaluating:
- Does the product, as shown, actually work?
- Can these founders ship?
- Is the on-chain piece real or vibes?

Your video does NOT need to "feel real" in some authenticity sense. It needs to be **clear, well-paced, and accurately represent what the product does.** The single moment that signals "this is real" is the on-chain transaction hash in Shot 6. Everything else can be cinematically reconstructed.

---

## 12. After filming — distribution

- Upload finished video to YouTube as **unlisted** (not public, not private — unlisted means link-share only)
- Note the URL in `DECISIONS.md`
- Have a local MP4 backup on your Seeker AND your laptop AND a USB drive
- Test playback on the projector setup at the venue if possible — projector audio especially fails in surprising ways
- Have the video queued up in a tab/window before your pitch slot, ready to play with one click

---

*Activate your tribe. Thrivv.*
