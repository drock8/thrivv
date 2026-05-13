import { TARGET_HOURS } from "./zzzScoring";

export type SleepRecordForStreak = {
  sleep_date: string;
  hours: number;
};

export function calculateStreak(records: SleepRecordForStreak[]): number {
  if (records.length === 0) return 0;

  const sorted = [...records].sort(
    (a, b) => new Date(b.sleep_date).getTime() - new Date(a.sleep_date).getTime()
  );

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setUTCDate(today.getUTCDate() - 1);

  let streak = 0;
  let expectedDate = today;

  const firstRecordDate = new Date(sorted[0].sleep_date + "T00:00:00Z");
  if (firstRecordDate < yesterday) return 0;

  if (firstRecordDate.getTime() === yesterday.getTime()) {
    expectedDate = yesterday;
  }

  for (const record of sorted) {
    const recordDate = new Date(record.sleep_date + "T00:00:00Z");

    if (recordDate.getTime() !== expectedDate.getTime()) break;
    if (record.hours < TARGET_HOURS) break;

    streak++;
    expectedDate = new Date(expectedDate);
    expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
  }

  return streak;
}
