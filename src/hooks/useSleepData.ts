import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageSourcePropType } from "react-native";
import { supabase } from "../lib/supabase";
import { getCurrentWeekStart } from "../lib/weekUtils";
import {
  insertSleepRecord,
  getMyWeeklySleep,
  getWeeklyTeamLeaderboard,
  getWeeklyIndividualLeaderboard,
  getTotalActiveMembers,
  type SleepRecord,
  type TeamLeaderboardRow,
  type IndividualLeaderboardRow,
} from "../lib/sleepRecords";
import {
  createTeam,
  joinTeam,
  leaveTeam,
  getMyTeam,
  ensureProfile,
  type MyTeamData,
} from "../lib/teamMembers";
import { calculateStreak } from "../lib/streaks";
import { getAvatar } from "../lib/avatars";
import type { BiometricTier } from "../lib/biometricStore";

// --- Query hooks ---

export function useMyTeam(pubkey: string | undefined) {
  return useQuery({
    queryKey: ["my-team", pubkey],
    queryFn: () => getMyTeam(pubkey!),
    enabled: !!pubkey,
    staleTime: 30_000,
  });
}

export function useMyWeeklySleep(pubkey: string | undefined) {
  return useQuery({
    queryKey: ["weekly-sleep", pubkey],
    queryFn: () => getMyWeeklySleep(pubkey!),
    enabled: !!pubkey,
    staleTime: 60_000,
  });
}

export function useTeamLeaderboard() {
  return useQuery({
    queryKey: ["team-leaderboard"],
    queryFn: getWeeklyTeamLeaderboard,
    staleTime: 60_000,
  });
}

export function useIndividualLeaderboard() {
  return useQuery({
    queryKey: ["individual-leaderboard"],
    queryFn: getWeeklyIndividualLeaderboard,
    staleTime: 60_000,
  });
}

export function useTotalMembers() {
  return useQuery({
    queryKey: ["total-members"],
    queryFn: getTotalActiveMembers,
    staleTime: 120_000,
  });
}

// --- Mutation hooks ---

export function useLogSleep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: insertSleepRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-sleep"] });
      queryClient.invalidateQueries({ queryKey: ["team-leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["individual-leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["total-members"] });
    },
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-team"] });
    },
  });
}

export function useJoinTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-team"] });
    },
  });
}

export function useLeaveTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-team"] });
    },
  });
}

export function useEnsureProfile() {
  return useMutation({
    mutationFn: ensureProfile,
  });
}

// --- Derived data hooks ---

export type HomeScreenTeamData = {
  teamName: string;
  teamAvatar: ImageSourcePropType;
  teamZzzs: number;
  teamHours: number;
  streakNights: number;
  filledDays: number;
  teamPda: string;
  joinCode: string | null;
};

export type HomeScreenTeammateData = {
  name: string;
  avatar: ImageSourcePropType;
  hours: number;
  zzzs: number;
  streak: number;
  isYou: boolean;
  verified?: BiometricTier;
};

export function useHomeScreenData(pubkey: string | undefined) {
  const teamQuery = useMyTeam(pubkey);
  const sleepQuery = useMyWeeklySleep(pubkey);

  const teamData = teamQuery.data;
  const myRecords = sleepQuery.data ?? [];

  const memberPubkeys = teamData?.members.map((m) => m.pubkey) ?? [];
  const allRecordsQuery = useTeamWeeklySleepInline(memberPubkeys);
  const allRecords = allRecordsQuery.data ?? [];

  if (!teamData || !pubkey) {
    return {
      team: null,
      teammates: [] as HomeScreenTeammateData[],
      noTeam: !teamQuery.isLoading && !teamData,
      isLoading: teamQuery.isLoading,
      teamPda: null as string | null,
    };
  }

  const myStreak = calculateStreak(myRecords);
  const myHours = myRecords.reduce((s, r) => s + Number(r.hours), 0);
  const myZzzs = myRecords.reduce((s, r) => s + Number(r.zzzs), 0);

  const teammates: HomeScreenTeammateData[] = teamData.members.map((member) => {
    const isYou = member.pubkey === pubkey;
    const memberRecords = allRecords.filter((r) => r.pubkey === member.pubkey);
    const hours = isYou
      ? myHours
      : memberRecords.reduce((s, r) => s + Number(r.hours), 0);
    const zzzs = isYou
      ? myZzzs
      : memberRecords.reduce((s, r) => s + Number(r.zzzs), 0);
    const streak = isYou
      ? myStreak
      : calculateStreak(memberRecords);

    const name = isYou ? "You" : member.display_name ?? member.pubkey.slice(0, 8);
    const bundled = getAvatar(name);
    const avatar: ImageSourcePropType = bundled
      ?? (member.avatar_url
        ? { uri: member.avatar_url }
        : { uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${member.pubkey}` });

    return {
      name,
      avatar,
      hours: Math.round(hours * 100) / 100,
      zzzs: Math.round(zzzs * 100) / 100,
      streak,
      isYou,
      verified: member.biometric_tier as BiometricTier,
    };
  });

  const teamZzzs = teammates.reduce((s, t) => s + t.zzzs, 0);
  const teamHours = teammates.reduce((s, t) => s + t.hours, 0);
  const teamStreak = Math.min(...teammates.map((t) => t.streak));
  const filledDays = myRecords.length;

  const team: HomeScreenTeamData = {
    teamName: teamData.team.team_name ?? "Unnamed Team",
    teamAvatar: { uri: teamData.team.team_avatar_url.replace('/svg?', '/png?') },
    teamZzzs: Math.round(teamZzzs * 100) / 100,
    teamHours: Math.round(teamHours * 100) / 100,
    streakNights: teamStreak,
    filledDays,
    teamPda: teamData.team.team_pda,
    joinCode: teamData.team.join_code,
  };

  return {
    team,
    teammates,
    noTeam: false,
    isLoading: teamQuery.isLoading || sleepQuery.isLoading,
    teamPda: teamData.team.team_pda,
  };
}

function useTeamWeeklySleepInline(pubkeys: string[]) {
  return useQuery({
    queryKey: ["team-weekly-sleep", pubkeys.sort().join(",")],
    queryFn: async () => {
      if (pubkeys.length === 0) return [];
      const weekStart = getCurrentWeekStart();
      const { data, error } = await supabase
        .from("sleep_records")
        .select("*")
        .in("pubkey", pubkeys)
        .eq("week_start", weekStart)
        .order("sleep_date", { ascending: true });
      if (error) throw error;
      return (data as SleepRecord[]) ?? [];
    },
    enabled: pubkeys.length > 0,
    staleTime: 60_000,
  });
}

// --- Leaderboard derived data ---

export type LeaderboardTeamZzzsRow = {
  rank: number;
  name: string;
  zzzs: number;
  payout: string | null;
  stake: string;
  isYou: boolean;
  isSeed: boolean;
};

export type LeaderboardTeamHoursRow = {
  rank: number;
  name: string;
  hours: number;
  isYou: boolean;
  isSeed: boolean;
};

export type LeaderboardIndividualRow = {
  rank: number;
  name: string;
  zzzs?: number;
  hours?: number;
  tribe: string;
  verified?: BiometricTier;
  isYou: boolean;
  isTeammate: boolean;
  isSeed: boolean;
};

export function useLeaderboardData(pubkey: string | undefined) {
  const teamLbQuery = useTeamLeaderboard();
  const indivLbQuery = useIndividualLeaderboard();
  const myTeamQuery = useMyTeam(pubkey);
  const totalMembersQuery = useTotalMembers();

  const teamLb = teamLbQuery.data ?? [];
  const indivLb = indivLbQuery.data ?? [];
  const myTeamPda = myTeamQuery.data?.team?.team_pda;
  const myTeammatePubkeys = new Set(
    (myTeamQuery.data?.members ?? []).map((m) => m.pubkey)
  );

  const payoutTiers: Record<number, string> = { 1: "2.5 SOL", 2: "1.5 SOL", 3: "1.0 SOL" };

  const teamZzzs: LeaderboardTeamZzzsRow[] = [...teamLb]
    .sort((a, b) => b.total_zzzs - a.total_zzzs)
    .map((row, i) => ({
      rank: i + 1,
      name: row.team_name,
      zzzs: Math.round(row.total_zzzs),
      payout: payoutTiers[i + 1] ?? null,
      stake: "0.3 SOL",
      isYou: row.team_pda === myTeamPda,
      isSeed: row.is_seed,
    }));

  const teamHours: LeaderboardTeamHoursRow[] = [...teamLb]
    .sort((a, b) => b.total_hours - a.total_hours)
    .map((row, i) => ({
      rank: i + 1,
      name: row.team_name,
      hours: Math.round(row.total_hours),
      isYou: row.team_pda === myTeamPda,
      isSeed: row.is_seed,
    }));

  const individualZzzsAll: LeaderboardIndividualRow[] = indivLb.map((row, i) => ({
    rank: i + 1,
    name: row.pubkey === pubkey ? "You" : row.display_name,
    zzzs: Math.round(row.total_zzzs),
    tribe: row.team_name ?? "No team",
    verified: row.biometric_tier as BiometricTier,
    isYou: row.pubkey === pubkey,
    isTeammate: myTeammatePubkeys.has(row.pubkey),
    isSeed: row.is_seed,
  }));

  const individualZzzsTop = individualZzzsAll.filter((r) => !r.isYou).slice(0, 12);
  const individualZzzsYou = individualZzzsAll.find((r) => r.isYou) ?? null;

  const indivByHours = [...indivLb].sort((a, b) => b.total_hours - a.total_hours);
  const individualHoursAll: LeaderboardIndividualRow[] = indivByHours.map(
    (row, i) => ({
      rank: i + 1,
      name: row.pubkey === pubkey ? "You" : row.display_name,
      hours: Math.round(row.total_hours),
      tribe: row.team_name ?? "No team",
      verified: row.biometric_tier as BiometricTier,
      isYou: row.pubkey === pubkey,
      isTeammate: myTeammatePubkeys.has(row.pubkey),
      isSeed: row.is_seed,
    })
  );

  const individualHoursTop = individualHoursAll.filter((r) => !r.isYou).slice(0, 12);
  const individualHoursYou = individualHoursAll.find((r) => r.isYou) ?? null;

  return {
    teamZzzs,
    teamHours,
    individualZzzsTop,
    individualZzzsYou,
    individualHoursTop,
    individualHoursYou,
    totalMembers: totalMembersQuery.data ?? 0,
    isLoading:
      teamLbQuery.isLoading || indivLbQuery.isLoading || myTeamQuery.isLoading,
  };
}
