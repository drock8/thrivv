export const TARGET_HOURS = 7.0;
export const HOURS_CAP = 7.0;
export const TARGET_BONUS = 1.0;
export const TRIBE_MULTIPLIER = 3;
export const STREAK_3_BONUS = 10;
export const STREAK_5_BONUS = 25;
export const STREAK_7_NIGHT_MULTIPLIER = 2;

export const MAX_HOURS_PER_WEEK_INDIVIDUAL = 49;
export const MAX_HOURS_PER_WEEK_TEAM = 147;
export const MAX_ZZZS_PER_WEEK_INDIVIDUAL = 550;
export const MAX_ZZZS_PER_WEEK_TEAM = 1650;

// Cumulative max ZZZs by nights completed (index 0 = 0 nights, 1 = 1 night, etc.)
// Streak bonuses: +10 at 3 nights, +25 at 5 nights
// 7-night streak: 2x multiplier + 4 bonus → 550 individual, ×3 → 1650 team
const CUMULATIVE_MAX_INDIVIDUAL_ZZZS = [0, 24, 48, 102, 126, 225, 249, 550];
const CUMULATIVE_MAX_TEAM_ZZZS = [0, 72, 144, 306, 378, 675, 747, 1650];

export function getMaxIndividualZzzs(nightsCompleted: number): number {
  const n = Math.max(0, Math.min(nightsCompleted, 7));
  return CUMULATIVE_MAX_INDIVIDUAL_ZZZS[n];
}

export function getMaxTeamZzzs(nightsCompleted: number): number {
  const n = Math.max(0, Math.min(nightsCompleted, 7));
  return CUMULATIVE_MAX_TEAM_ZZZS[n];
}

export function getMaxIndividualHours(nightsCompleted: number): number {
  return HOURS_CAP * Math.max(0, Math.min(nightsCompleted, 7));
}

export function getMaxTeamHours(nightsCompleted: number): number {
  return HOURS_CAP * Math.max(0, Math.min(nightsCompleted, 7)) * 3;
}

export function nightZzzs(actualHours: number, allTribeHit: boolean) {
  const capped = Math.min(actualHours, HOURS_CAP);
  const bonus = actualHours >= TARGET_HOURS ? TARGET_BONUS : 0;
  const tribe = allTribeHit ? TRIBE_MULTIPLIER : 1;
  return (capped + bonus) * tribe;
}
