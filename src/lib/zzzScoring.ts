export const TARGET_HOURS = 7.0;
export const HOURS_CAP = 7.0;
export const TARGET_BONUS = 1.0;
export const TRIBE_MULTIPLIER = 3;
export const STREAK_3_BONUS = 10;
export const STREAK_5_BONUS = 25;
export const STREAK_7_NIGHT_MULTIPLIER = 2;

export const MAX_HOURS_PER_WEEK_INDIVIDUAL = 49;
export const MAX_HOURS_PER_WEEK_TEAM = 147;
export const MAX_ZZZS_PER_WEEK_INDIVIDUAL = 225;
export const MAX_ZZZS_PER_WEEK_TEAM = 675;

export function nightZzzs(actualHours: number, allTribeHit: boolean) {
  const capped = Math.min(actualHours, HOURS_CAP);
  const bonus = actualHours >= TARGET_HOURS ? TARGET_BONUS : 0;
  const tribe = allTribeHit ? TRIBE_MULTIPLIER : 1;
  return (capped + bonus) * tribe;
}
