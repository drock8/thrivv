import { supabase } from "./supabase";
import { getCurrentWeekStart, getWeekStartForDate } from "./weekUtils";
import { nightZzzs, TARGET_HOURS } from "./zzzScoring";

export type SleepRecord = {
  id: string;
  pubkey: string;
  sleep_date: string;
  duration_ms: number;
  hours: number;
  zzzs: number;
  all_tribe_hit: boolean;
  tx_sig: string | null;
  is_seed: boolean;
  created_at: string;
  week_start: string;
};

export async function insertSleepRecord(params: {
  pubkey: string;
  durationMs: number;
  txSig: string | null;
  teamPda: string | null;
}): Promise<SleepRecord> {
  const { pubkey, durationMs, txSig, teamPda } = params;
  const hours = Math.round((durationMs / 3600000) * 100) / 100;
  const sleepDate = new Date().toISOString().split("T")[0];
  const weekStart = getWeekStartForDate(new Date());
  const zzzs = nightZzzs(hours, false);

  const { data, error } = await supabase
    .from("sleep_records")
    .upsert(
      {
        pubkey,
        sleep_date: sleepDate,
        duration_ms: durationMs,
        hours,
        zzzs,
        all_tribe_hit: false,
        tx_sig: txSig,
        is_seed: false,
        week_start: weekStart,
      },
      { onConflict: "pubkey,sleep_date" }
    )
    .select()
    .single();

  if (error) throw error;

  if (teamPda && hours >= TARGET_HOURS) {
    checkAndApplyTribeMultiplier(teamPda, sleepDate, weekStart).catch(() => {});
  }

  return data;
}

async function checkAndApplyTribeMultiplier(
  teamPda: string,
  sleepDate: string,
  weekStart: string
) {
  const { data: members } = await supabase
    .from("team_members")
    .select("pubkey")
    .eq("team_pda", teamPda);

  if (!members || members.length < 3) return;

  const pubkeys = members.map((m) => m.pubkey);

  const { data: records } = await supabase
    .from("sleep_records")
    .select("pubkey, hours")
    .in("pubkey", pubkeys)
    .eq("sleep_date", sleepDate);

  if (!records) return;

  const allHit =
    pubkeys.length === records.length &&
    records.every((r) => r.hours >= TARGET_HOURS);

  if (!allHit) return;

  for (const pk of pubkeys) {
    const rec = records.find((r) => r.pubkey === pk);
    if (!rec) continue;
    const newZzzs = nightZzzs(rec.hours, true);
    await supabase
      .from("sleep_records")
      .update({ all_tribe_hit: true, zzzs: newZzzs })
      .eq("pubkey", pk)
      .eq("sleep_date", sleepDate);
  }
}

export async function getMyWeeklySleep(pubkey: string): Promise<SleepRecord[]> {
  const weekStart = getCurrentWeekStart();
  const { data, error } = await supabase
    .from("sleep_records")
    .select("*")
    .eq("pubkey", pubkey)
    .eq("week_start", weekStart)
    .order("sleep_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export type TeamLeaderboardRow = {
  team_pda: string;
  team_name: string;
  team_avatar_url: string;
  is_seed: boolean;
  total_zzzs: number;
  total_hours: number;
};

export async function getWeeklyTeamLeaderboard(): Promise<TeamLeaderboardRow[]> {
  const weekStart = getCurrentWeekStart();

  const { data, error } = await supabase.rpc("get_team_leaderboard", {
    p_week_start: weekStart,
  });

  if (error) {
    return getWeeklyTeamLeaderboardFallback(weekStart);
  }
  return data ?? [];
}

async function getWeeklyTeamLeaderboardFallback(
  weekStart: string
): Promise<TeamLeaderboardRow[]> {
  const { data: teams } = await supabase
    .from("team_metadata")
    .select("team_pda, team_name, team_avatar_url, is_seed");

  if (!teams || teams.length === 0) return [];

  const results: TeamLeaderboardRow[] = [];

  for (const team of teams) {
    const { data: members } = await supabase
      .from("team_members")
      .select("pubkey")
      .eq("team_pda", team.team_pda);

    if (!members || members.length === 0) continue;

    const pubkeys = members.map((m) => m.pubkey);
    const { data: records } = await supabase
      .from("sleep_records")
      .select("hours, zzzs")
      .in("pubkey", pubkeys)
      .eq("week_start", weekStart);

    const totalZzzs = (records ?? []).reduce((sum, r) => sum + Number(r.zzzs), 0);
    const totalHours = (records ?? []).reduce((sum, r) => sum + Number(r.hours), 0);

    results.push({
      team_pda: team.team_pda,
      team_name: team.team_name ?? "Unnamed",
      team_avatar_url: team.team_avatar_url,
      is_seed: team.is_seed,
      total_zzzs: Math.round(totalZzzs * 100) / 100,
      total_hours: Math.round(totalHours * 100) / 100,
    });
  }

  results.sort((a, b) => b.total_zzzs - a.total_zzzs);
  return results;
}

export type IndividualLeaderboardRow = {
  pubkey: string;
  display_name: string;
  avatar_url: string | null;
  biometric_tier: string;
  is_seed: boolean;
  team_name: string | null;
  total_zzzs: number;
  total_hours: number;
};

export async function getWeeklyIndividualLeaderboard(): Promise<
  IndividualLeaderboardRow[]
> {
  const weekStart = getCurrentWeekStart();

  const { data: records, error } = await supabase
    .from("sleep_records")
    .select("pubkey, hours, zzzs")
    .eq("week_start", weekStart);

  if (error) throw error;
  if (!records || records.length === 0) return [];

  const byUser = new Map<string, { totalZzzs: number; totalHours: number }>();
  for (const r of records) {
    const existing = byUser.get(r.pubkey) ?? { totalZzzs: 0, totalHours: 0 };
    existing.totalZzzs += Number(r.zzzs);
    existing.totalHours += Number(r.hours);
    byUser.set(r.pubkey, existing);
  }

  const pubkeys = Array.from(byUser.keys());
  const { data: profiles } = await supabase
    .from("profiles")
    .select("pubkey, display_name, avatar_url, is_seed, biometric_tier")
    .in("pubkey", pubkeys);

  const { data: memberships } = await supabase
    .from("team_members")
    .select("pubkey, team_pda")
    .in("pubkey", pubkeys);

  const teamPdas = [
    ...new Set((memberships ?? []).map((m) => m.team_pda)),
  ];
  const { data: teamMetas } = await supabase
    .from("team_metadata")
    .select("team_pda, team_name")
    .in("team_pda", teamPdas.length > 0 ? teamPdas : ["__none__"]);

  const teamNameMap = new Map(
    (teamMetas ?? []).map((t) => [t.team_pda, t.team_name])
  );
  const userTeamMap = new Map(
    (memberships ?? []).map((m) => [m.pubkey, m.team_pda])
  );
  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.pubkey, p])
  );

  const results: IndividualLeaderboardRow[] = [];
  for (const [pubkey, stats] of byUser) {
    const profile = profileMap.get(pubkey);
    const teamPda = userTeamMap.get(pubkey);

    results.push({
      pubkey,
      display_name: profile?.display_name ?? pubkey.slice(0, 8),
      avatar_url: profile?.avatar_url ?? null,
      biometric_tier: profile?.biometric_tier ?? "none",
      is_seed: profile?.is_seed ?? false,
      team_name: teamPda ? teamNameMap.get(teamPda) ?? null : null,
      total_zzzs: Math.round(stats.totalZzzs * 100) / 100,
      total_hours: Math.round(stats.totalHours * 100) / 100,
    });
  }

  results.sort((a, b) => b.total_zzzs - a.total_zzzs);
  return results;
}

export async function getTotalActiveMembers(): Promise<number> {
  const weekStart = getCurrentWeekStart();
  const { count, error } = await supabase
    .from("sleep_records")
    .select("pubkey", { count: "exact", head: true })
    .eq("week_start", weekStart);

  if (error) return 0;
  return count ?? 0;
}
