import { supabase } from "./supabase";
import { teamAvatarUrl } from "./teams";
import type { Profile } from "./profiles";
import type { TeamMetadata } from "./teams";

export type MyTeamData = {
  team: TeamMetadata;
  members: (Profile & { biometric_tier: string })[];
};

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createTeam(params: {
  creatorPubkey: string;
  teamName: string;
}): Promise<{ team: TeamMetadata; joinCode: string }> {
  const { creatorPubkey, teamName } = params;
  const teamPda = `team_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const joinCode = generateJoinCode();

  const { data: team, error: teamError } = await supabase
    .from("team_metadata")
    .insert({
      team_pda: teamPda,
      team_name: teamName,
      team_avatar_url: teamAvatarUrl(teamName),
      join_code: joinCode,
      created_by: creatorPubkey,
      is_seed: false,
    })
    .select()
    .single();

  if (teamError) throw teamError;

  const { error: memberError } = await supabase
    .from("team_members")
    .insert({ team_pda: teamPda, pubkey: creatorPubkey });

  if (memberError) {
    await supabase.from("team_metadata").delete().eq("team_pda", teamPda);
    throw memberError;
  }

  return { team, joinCode };
}

export async function joinTeam(params: {
  pubkey: string;
  joinCode: string;
}): Promise<MyTeamData> {
  const { pubkey, joinCode } = params;

  const { data: team, error: lookupError } = await supabase
    .from("team_metadata")
    .select("*")
    .eq("join_code", joinCode.toUpperCase())
    .single();

  if (lookupError || !team) throw new Error("Invalid join code");

  const { count } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_pda", team.team_pda);

  if ((count ?? 0) >= 3) throw new Error("Team is full (max 3 members)");

  const { error: existingError } = await supabase
    .from("team_members")
    .select("id")
    .eq("pubkey", pubkey)
    .single();

  if (!existingError) throw new Error("You are already on a team");

  const { error: joinError } = await supabase
    .from("team_members")
    .insert({ team_pda: team.team_pda, pubkey });

  if (joinError) throw joinError;

  return getMyTeam(pubkey) as Promise<MyTeamData>;
}

export async function leaveTeam(params: {
  pubkey: string;
  teamPda: string;
}): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("pubkey", params.pubkey)
    .eq("team_pda", params.teamPda);

  if (error) throw error;
}

export async function getMyTeam(
  pubkey: string
): Promise<MyTeamData | null> {
  const { data: membership, error: memError } = await supabase
    .from("team_members")
    .select("team_pda")
    .eq("pubkey", pubkey)
    .limit(1)
    .single();

  if (memError || !membership) return null;

  const { data: team, error: teamError } = await supabase
    .from("team_metadata")
    .select("*")
    .eq("team_pda", membership.team_pda)
    .single();

  if (teamError || !team) return null;

  const { data: memberRows } = await supabase
    .from("team_members")
    .select("pubkey")
    .eq("team_pda", membership.team_pda);

  const memberPubkeys = (memberRows ?? []).map((m) => m.pubkey);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("pubkey, display_name, avatar_url, created_at, is_seed, biometric_tier")
    .in("pubkey", memberPubkeys);

  return {
    team,
    members: (profiles as (Profile & { biometric_tier: string })[]) ?? [],
  };
}

export async function ensureProfile(pubkey: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { pubkey, is_seed: false, biometric_tier: "none" },
      { onConflict: "pubkey" }
    )
    .select()
    .single();

  if (error && error.code !== "23505") throw error;
}
