# Thrivv — Brand & Design Spec
*Sleep mastery for recovery · Hackathon build · v0.3 (with Apple HIG guidance)*

---

## 1. Brand foundations

**What:** A sleep mastery app. Track your sleep, hit your window consistently, earn your wolf.

**Positioning line:** *Sleep is the method. Recovery is what shows up.*

**Why no score:** Every other sleep app reduces your night to a number. Thrivv treats sleep as a craft you practice. The wolf coat is the only "score" — and it takes weeks to shift, not minutes.

**Feel:** Morning air. Cold plunge. The first deep breath of a day that started right.

**Anti-patterns:**
- Sleep scoring apps (Oura, Whoop) — we don't grade nights, we count them
- Sleep aids (Calm, Headspace) — we're not therapeutic, we're disciplinary
- Yoga / wellness aesthetic — we're for athletes and operators, not patients

**North star:** A craft tool. Less Oura, more Leica.

**Voice:** Direct, calm, knowing. Talks to people who already take sleep seriously.

**Brand-platform alignment:** Thrivv's restraint maps cleanly onto Apple HIG's three principles — *Clarity, Deference, Depth.* The minimal palette, generous whitespace, and lack of dashboards are HIG-native by default.

---

## 2. Color tokens

### Primary palette

| Token | Hex | Role |
|---|---|---|
| `--primary` (Glacier) | `#5EBFB5` | **Brand primary.** CTAs, accents, "inside your window" indicator |
| `--background` (Mist) | `#F5F2EA` | App canvas, default surface |
| `--surface` (Cloud) | `#FFFFFF` | Cards, raised elements |
| `--foreground` (Obsidian) | `#0A0A0A` | Primary text, V mark, wolves |
| `--muted` (Graphite) | `#6B6760` | Secondary text, captions |
| `--border` (Bone) | `#E5E0D5` | Dividers, hairlines |
| `--accent` (Eucalyptus) | `#B8D4C9` | Optional secondary, wind-down moments |

### Semantic

| Token | Hex | Use |
|---|---|---|
| `--success` | `#5EBFB5` | Inside window, streak active, tier shift |
| `--warning` | `#E89B7E` | Window missed, streak paused |
| `--danger` | `#C45A3D` | Sustained drift, used very sparingly |

### CSS variables block

```css
:root {
  --primary:    #5EBFB5;
  --background: #F5F2EA;
  --surface:    #FFFFFF;
  --foreground: #0A0A0A;
  --muted:      #6B6760;
  --border:     #E5E0D5;
  --accent:     #B8D4C9;
  --warning:    #E89B7E;
  --danger:     #C45A3D;
}
```

### Tailwind config

```js
theme: {
  extend: {
    colors: {
      primary:    '#5EBFB5',
      background: '#F5F2EA',
      surface:    '#FFFFFF',
      foreground: '#0A0A0A',
      muted:      '#6B6760',
      border:     '#E5E0D5',
      accent:     '#B8D4C9',
    }
  }
}
```

### iOS / SwiftUI Color extension

For native iOS builds, define semantic colors that auto-adapt to dark mode (when added in v0.2 of the app).

```swift
extension Color {
    static let thrivvPrimary    = Color(hex: 0x5EBFB5)
    static let thrivvBackground = Color(hex: 0xF5F2EA)
    static let thrivvSurface    = Color(hex: 0xFFFFFF)
    static let thrivvForeground = Color(hex: 0x0A0A0A)
    static let thrivvMuted      = Color(hex: 0x6B6760)
    static let thrivvBorder     = Color(hex: 0xE5E0D5)
    static let thrivvAccent     = Color(hex: 0xB8D4C9)
}
```

For colors that should respect system appearance, define them in the asset catalog with `Any Appearance` and `Dark` variants. Apple HIG recommends letting brand colors *coexist* with system grays — never replace `Color.primary` for body text labels you want to support Dynamic Type and accessibility cleanly.

### Usage ratio

- 70% mist + cloud (background, surfaces)
- 20% obsidian + graphite (text, marks, wolves)
- 8% glacier (CTAs, key moments, "inside" indicator)
- 2% eucalyptus (secondary states)

---

## 3. Typography

### Cross-platform default: Inter

Inter (Google Fonts), system fallback `-apple-system, BlinkMacSystemFont, sans-serif`. Use this for web, marketing, and any non-iOS surfaces.

### iOS native: SF Pro (recommended)

For iOS builds, use **SF Pro** — it ships free, supports Dynamic Type natively, includes optical sizing, and feels native instantly. SF Pro Text for body, SF Pro Display for 20pt+.

**Why this matters:** SF Pro's metrics are tuned for iOS rendering. Substituting Inter on iOS works visually but loses Dynamic Type and accessibility scaling. If you ship native, ship SF Pro.

### Weights

400 regular, 500 medium. Never 600 or 700. SF Pro's "Medium" weight maps to 500.

### Scale (cross-platform)

| Role | Size | SwiftUI equivalent | Weight | Line-height |
|---|---|---|---|---|
| Display | 48px | `.system(size: 48)` | medium | 1.0 |
| H1 | 28px | `.title` (28pt) | medium | 1.2 |
| H2 | 22px | `.title2` (22pt) | medium | 1.3 |
| H3 | 18px | `.title3` (20pt — close enough) | medium | 1.4 |
| Body | 15px | `.subheadline` (15pt) | regular | 1.6 |
| Caption | 13px | `.footnote` (13pt) | regular | 1.5 |
| Micro | 11px | `.caption2` (11pt) | medium | 1.4, +0.5px tracking, uppercase |

**Rules:**
- Sentence case everywhere except micro labels
- Time strings (`7h 42m`, `22:48`) use tabular figures: SwiftUI `.monospacedDigit()`, web `font-variant-numeric: tabular-nums`
- Numbers in stats use weight 500

### Dynamic Type

For iOS, every text element should support Dynamic Type. Use SwiftUI text styles (`.title`, `.body`, `.caption`) rather than fixed point sizes wherever possible. The hero sleep duration is the one exception — it can scale with `.dynamicTypeSize(.large ... .accessibility2)` to prevent it from breaking the card layout at largest sizes.

---

## 4. Logo, mark & app icon

### V mark and wordmark

V mark above wordmark, centered, gap = 0.5× wordmark cap height.

- On `--background`: V and wordmark in `--foreground`
- On `--foreground`: V and wordmark in `--background`
- Never tint the V glacier

Min sizes: V mark ≥24px tall, wordmark ≥14px tall.

### App icon (iOS)

Apple's icon grid: 1024×1024px master, with content fitting inside the standard 824pt safe zone. Corners are clipped to the rounded squircle by iOS — don't pre-round.

**Recommended approach:**
- Solid `--foreground` (#0A0A0A) background
- White V mark, centered, ~40% of icon width
- No wordmark on the icon — the V is the symbol
- No gradient, no shadow, no border

**Why obsidian background, not mist:** Sleep apps appear on the home screen *most often at night*. A black-background icon visually disappears into a dark home screen wallpaper, signaling night-mode/quiet. Mist-background reads more "morning" and pops harder during the day, which is the wrong cue.

**Variants to ship:**
- 1024×1024 marketing (App Store)
- All required iOS sizes via Xcode asset catalog
- Apple Watch complication icon (V mark on transparent — system handles bg)
- Notification icon (white V on transparent, follows system tint)

---

## 5. Wolf tier system

Five tiers. Coat color carries the progression — no badges, no level numbers.

| Tier | Name | Coat hex | Trigger |
|---|---|---|---|
| 1 | Charcoal cub | `#2A2A2A` | Nights 0–14 of tracked sleep |
| 2 | Ash hunter | `#4F4F4F` | 15–60 nights inside window |
| 3 | Silver tracker | `#8A8A8A` | 61–180 nights inside window |
| 4 | Moonlight pack lead | `#C8C5BC` | 181–365 nights inside window |
| 5 | Spirit alpha | `#FFFFFF` | 365+ nights inside window |

**"Inside window":**
- Bedtime within ±30 min of target
- Slept ≥6.5 hours
- Wake within ±45 min of target

Missing a night pauses progression but doesn't reset.

**Illustration brief:**
- Side profile or 3/4, simple geometric shapes
- Solid coat fill, no gradient, no shading
- Eye color: `--primary` (only color besides coat)
- Calm, alert, dignified posture
- Same silhouette across all 5 tiers
- Reference: Scandinavian folk symbol × Apple Memoji minimalism

**Tier-shift moment (iOS):**
When a user crosses into a new tier, fire a `UINotificationFeedbackGenerator.notificationOccurred(.success)` haptic, present a sheet with the new wolf, and write a `HealthKit` workout-adjacent metadata entry (optional). This is a once-every-few-months event — make it feel earned.

---

## 6. Components

### Last night card (hero)

The morning screen. No score, just what happened.

- Surface bg, 0.5px border, radius 16px, padding 24px
- Sleep duration in 48px display (`7h 42m`)
- Bed-to-wake strip below in 13px graphite (`22:48 → 06:30`)
- "Inside your window" pill in glacier, OR "Outside your window" in warm coral
- Sleep stages bar (deep / light / REM / awake)
- Three metric row: Deep · REM · Efficiency
- Streak row at bottom with current wolf coat dot

### Tonight's window card

Wind-down planner, shown afternoon onward.

- Mist bg, 0.5px border
- Target bedtime range (`22:30–23:00`)
- Time-until-window countdown (drives Live Activity — see §7)
- Wind-down checklist (3 items, customizable)
- Primary CTA: "Tonight's plan"

### Primary CTA

- Glacier bg, text `#0A3A35`
- Pill (radius 999px), padding 14px 24px, weight 500
- iOS minimum hit target: **44×44pt** — pad invisibly if visual size is smaller

### Secondary CTA

- Transparent bg, 0.5px obsidian border, obsidian text
- Same shape as primary

### Spacing & radius tokens

```css
--space-1: 4px;  --space-2: 8px;  --space-3: 12px;
--space-4: 16px; --space-6: 24px; --space-8: 32px;
--radius-sm: 8px;  --radius-md: 12px;
--radius-lg: 16px; --radius-pill: 999px;
```

iOS-aligned: 8pt grid. Apple HIG recommends 8pt vertical rhythm, so the spacing scale above maps cleanly.

---

## 7. Apple platform guidance

This section covers iOS-specific recommendations for native builds. Skip if you're shipping web-only for the hackathon.

### 7.1 HIG principles applied to Thrivv

| HIG Principle | Thrivv application |
|---|---|
| **Clarity** | Single hero number per screen. No competing data points. The 48pt sleep duration is *the* answer; everything else is supporting context. |
| **Deference** | Mist and cloud backgrounds defer to content. Glacier appears only on interactive or status elements — never decorative. |
| **Depth** | iOS sheets for "Tonight's plan." Tier-shift moments use full-screen presentation. Otherwise, flat cards on a flat canvas. |

### 7.2 Navigation structure

**Recommended: Tab bar (3 tabs)**

| Tab | Icon (SF Symbol) | Purpose |
|---|---|---|
| Today | `moon.zzz.fill` | Last night card + tonight's window |
| History | `chart.line.uptrend.xyaxis` | Streak calendar, past nights |
| You | `pawprint.fill` | Wolf tier, profile, settings |

Three tabs maximizes screen space and matches Thrivv's "minimal craft tool" positioning. Five tabs would feel bloated for a single-purpose app.

**Avoid:** Hamburger menus (anti-HIG), bottom sheets as primary navigation, side drawers.

### 7.3 SF Symbols mapping

Use SF Symbols throughout for system consistency, free Dynamic Type scaling, and zero asset overhead. Custom-draw icons only where SF Symbols genuinely don't fit.

| Use | Symbol |
|---|---|
| Sleep / night | `moon.zzz.fill` |
| Wind-down | `moon.stars` |
| Morning / wake | `sunrise.fill` |
| Streak / inside window | `checkmark.seal.fill` |
| Drift / missed window | `exclamationmark.triangle` |
| Wolf / pack | `pawprint.fill` |
| Stats | `chart.line.uptrend.xyaxis` |
| Settings | `gearshape` |
| HealthKit source | `heart.text.square` |
| Window timer | `clock` |

Tint with `--foreground` by default, `--primary` for active/selected states.

### 7.4 HealthKit integration

**This is the data source.** Don't build a custom sleep tracker — read from HealthKit.

```swift
// Required entitlements: NSHealthShareUsageDescription
// Read scopes:
HKObjectType.categoryType(forIdentifier: .sleepAnalysis)
HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN)
HKObjectType.quantityType(forIdentifier: .restingHeartRate)
```

- **Read-only** in v0.1 — never write back unless the user manually logs a nap or bedtime
- Respect HealthKit's source priority (Apple Watch > iPhone > third-party rings)
- If multiple sources, prefer most recent and surface the source in a footer ("via Apple Watch")

**Privacy copy for the permission prompt:**
> "Thrivv reads your sleep data from Health to track your window streak. Your data stays on your device and is never sent to our servers."

### 7.5 Sleep Focus integration

A sleep app that ignores Sleep Focus is a broken sleep app.

- **Respect the user's Sleep Focus schedule** — match Thrivv's wind-down notifications to it
- **Suppress all notifications during Sleep Focus** except a single "Window opens now" cue if user has opted in
- **Read the user's Wake Up alarm** via Health (where available) and offer to sync targets — "Your iPhone wake time is 06:30. Use this as your Thrivv target?"

### 7.6 Live Activities & Dynamic Island

The wind-down countdown is the perfect Live Activity use case.

**Activity content:**
- Compact leading: V mark
- Compact trailing: Time until window (`28m`)
- Expanded: V mark, "Wind-down begins in 28 min", current wolf tier dot, glacier progress arc
- Lock screen: Same expanded layout, Mist bg

**Update cadence:** Once per minute during wind-down (12 updates over 12 minutes is fine — stay under ActivityKit's update budget).

**End condition:** Activity ends when bedtime is logged or 30 min after target wake.

### 7.7 Widgets

| Size | Content |
|---|---|
| Small | Last night duration + "Inside / outside window" pill |
| Medium | Last night duration + 7-night streak dots + current wolf tier |
| Large | Skip for v0.1 — adds little over medium |
| Lock screen circular | Wolf coat dot + streak count |
| Lock screen rectangular | "12 nights · Moonlight" |

Refresh on `WidgetCenter.shared.reloadAllTimelines()` after each morning's HealthKit sync.

### 7.8 Apple Watch app

Skip for hackathon, but plan for v0.2. Watch app is the bedside companion.

**Two surfaces:**
- **Face complication:** Wolf coat dot or "12n" streak number
- **App:** Dimmed dark interface (low light), large `7h 42m` morning summary, tap-to-dismiss

Wake-up haptic should be a gentle sequence (not the standard alarm) — pair with `WKHapticType.notification`.

### 7.9 Haptics

| Moment | Haptic |
|---|---|
| Streak day added | `UIImpactFeedbackGenerator(style: .light)` |
| Inside-window confirmed | `UIImpactFeedbackGenerator(style: .medium)` |
| Tier shift | `UINotificationFeedbackGenerator.notificationOccurred(.success)` (twice, 200ms apart) |
| Drift / missed window | `UINotificationFeedbackGenerator.notificationOccurred(.warning)` |
| Tab switch | None — let iOS handle |

**Never** play haptic feedback during the user's Sleep Focus schedule.

### 7.10 Notifications

**Notification categories:**
- `WIND_DOWN` — 30 min before target bedtime
- `WINDOW_OPEN` — at target bedtime
- `MORNING_SUMMARY` — 5 min after Health detects wake
- `TIER_SHIFT` — when wolf coat changes
- `DRIFT_ALERT` — only after 3+ consecutive missed windows

**All notifications respect Sleep Focus.** Use `.timeSensitive` interruption level *only* for the morning summary if the user has opted in. Wind-down nudges are `.active` (default).

### 7.11 Touch targets, safe areas, density

- All tappable elements: minimum 44×44pt (HIG hard requirement)
- Respect safe areas: notch, Dynamic Island, home indicator
- Use `.safeAreaInset(edge: .bottom)` for the tab bar's content overlap
- Honor `traitCollection.preferredContentSizeCategory` everywhere
- Test at AX1–AX5 Dynamic Type sizes; the hero card should reflow gracefully

### 7.12 Information density (HIG-aligned)

Apple HIG calls this "deference to content." Thrivv's anti-score positioning aligns naturally:

- One hero metric per screen. The sleep duration *is* the screen.
- Resist the urge to add subordinate metrics. If something can live on a detail screen, it should.
- The sleep stages bar is the most data-dense element allowed on the hero — and even that is a single horizontal bar, not a chart.
- Charts live in History tab only.

---

## 8. Mock data

### Users

```json
[
  { "id": "u_001", "name": "Maya Chen",    "tier": "moonlight", "tier_nights": 247, "target_bedtime": "22:45", "target_wake": "06:30" },
  { "id": "u_002", "name": "Derrick S.",   "tier": "silver",    "tier_nights": 94,  "target_bedtime": "23:00", "target_wake": "06:45" },
  { "id": "u_003", "name": "Jules Okafor", "tier": "spirit",    "tier_nights": 412, "target_bedtime": "22:00", "target_wake": "05:30" },
  { "id": "u_004", "name": "Sam Reyes",    "tier": "ash",       "tier_nights": 32,  "target_bedtime": "23:30", "target_wake": "07:00" },
  { "id": "u_005", "name": "Priya Nair",   "tier": "charcoal",  "tier_nights": 6,   "target_bedtime": "22:30", "target_wake": "06:00" }
]
```

### Last night — Maya

```json
{
  "date": "2026-05-05",
  "bedtime": "22:48",
  "wake": "06:30",
  "duration_min": 462,
  "stages_min": { "deep": 95, "light": 310, "rem": 57, "awake": 12 },
  "efficiency_pct": 92,
  "inside_window": true,
  "streak_nights": 12
}
```

### Last 7 nights — Maya

```json
[
  { "date": "2026-04-30", "bedtime": "22:51", "wake": "06:28", "duration_min": 457, "inside_window": true },
  { "date": "2026-05-01", "bedtime": "22:42", "wake": "06:35", "duration_min": 473, "inside_window": true },
  { "date": "2026-05-02", "bedtime": "23:18", "wake": "06:45", "duration_min": 447, "inside_window": false },
  { "date": "2026-05-03", "bedtime": "23:02", "wake": "06:25", "duration_min": 443, "inside_window": true },
  { "date": "2026-05-04", "bedtime": "22:39", "wake": "06:20", "duration_min": 461, "inside_window": true },
  { "date": "2026-05-05", "bedtime": "22:48", "wake": "06:30", "duration_min": 462, "inside_window": true }
]
```

### Tonight's window — Maya

```json
{
  "target_bedtime_range": "22:30–23:00",
  "wind_down_starts": "22:00",
  "wind_down_checklist": [
    { "item": "Lights to warm tone", "done": false },
    { "item": "Phone in another room", "done": false },
    { "item": "Magnesium + water", "done": false }
  ]
}
```

### Insight strings

**Inside window, solid sleep:**
- "Twelve nights inside your window. The coat is shifting."
- "Deep sleep at 21%. Right where you want it."
- "Hit your wake target within seven minutes — your rhythm is locked in."

**Inside window, mediocre stages:**
- "Inside your window, but REM was light. Watch caffeine timing tomorrow."
- "Duration's there. Quality drifted — check ambient noise tonight."

**Outside window, recoverable:**
- "Twenty-three minutes late to bed. Pull it back tonight, the streak holds."
- "Slept long but past your window. Sleep timing matters more than total hours."

**Outside window, multiple nights:**
- "Three drifts this week. Reset tonight — the pack waits."

### Notification copy

- **Wind-down nudge:** "Wind-down window opens in 30 min."
- **Window opening:** "Your sleep window is open. Lights low."
- **Morning summary:** "Seven hours, forty-two minutes. Inside your window."
- **Streak milestone:** "Twelve nights. The coat just shifted."
- **Tier unlock:** "You've reached Silver. You're reading your own rhythms now."
- **Drift alert:** "Tracking thirty minutes later than your window. Reset tonight."

### Empty states

- **No data yet:** "Connect Health, or set your target window to begin tracking."
- **Wolf locked:** "Stay consistent. Your coat shifts at fifteen nights."
- **Streak paused:** "The streak is paused, not lost. Tonight resumes it."

---

## 9. Accessibility

### General

- Min text contrast 4.5:1. Graphite on Mist passes (5.1:1).
- Glacier on white passes large-text only — never use for body copy.
- "Inside / outside window" must always pair with text label, not color alone.
- Wolf tier always labeled with name, not coat color alone.

### Apple-specific

- **VoiceOver labels** required on every interactive element. The wolf coat dot needs `.accessibilityLabel("Moonlight tier, 247 nights")`.
- **Dynamic Type** supported on every text element. Test at AX1–AX5.
- **Reduce Motion** — disable any tier-shift animations and the Live Activity arc animation when the system flag is set.
- **Reduce Transparency** — replace any glass/blur effects with solid Mist or Cloud surfaces.
- **Increase Contrast** — Graphite shifts to a darker `#4A4641` to maintain hierarchy.

---

## 10. Out of scope for v0.1

- Dark mode (plan for v0.2 — palette already includes obsidian, will need cool-shifted darks for surfaces)
- Animation specs (default 200ms ease-out)
- Apple Watch app
- Live Activities (stretch goal if time permits)
- Custom icon set (use SF Symbols)
- Onboarding flow
- Premium tier visual treatment
- Social / pack features

---

## 11. References

- Apple HIG: https://developer.apple.com/design/human-interface-guidelines
- SF Symbols: https://developer.apple.com/sf-symbols
- HealthKit sleep analysis: https://developer.apple.com/documentation/healthkit/hkcategorytypeidentifier/1615291-sleepanalysis
- Live Activities (ActivityKit): https://developer.apple.com/documentation/activitykit
- Sleep Focus & Focus filters: https://developer.apple.com/documentation/extensionkit

---

*End of spec. Increment version on every change.*
