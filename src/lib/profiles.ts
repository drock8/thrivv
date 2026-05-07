import { supabase } from "./supabase";

export type Profile = {
  pubkey: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export async function getProfile(pubkey: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("pubkey", pubkey)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // row not found
    throw error;
  }
  return data;
}

export async function upsertProfile(profile: {
  pubkey: string;
  display_name?: string;
  avatar_url?: string;
}): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "pubkey" })
    .select()
    .single();

  if (error) throw error;
  return data;
}
