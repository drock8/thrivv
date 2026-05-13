import { supabase } from "./supabase";

export type TeamMetadata = {
  team_pda: string;
  team_name: string | null;
  team_avatar_url: string;
  updated_at: string;
  is_seed: boolean;
  join_code: string | null;
  created_by: string | null;
  created_at: string;
};

export function teamAvatarUrl(teamName: string): string {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(teamName)}`;
}

export async function getTeamMetadata(
  teamPda: string
): Promise<TeamMetadata | null> {
  const { data, error } = await supabase
    .from("team_metadata")
    .select("*")
    .eq("team_pda", teamPda)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function upsertTeamMetadata(meta: {
  team_pda: string;
  team_name?: string;
  team_avatar_url?: string;
}): Promise<TeamMetadata> {
  const { data, error } = await supabase
    .from("team_metadata")
    .upsert(
      { ...meta, updated_at: new Date().toISOString() },
      { onConflict: "team_pda" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
