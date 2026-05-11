import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { usePrivy } from "@privy-io/expo";
import { useCallback, useRef } from "react";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

async function exchangePrivyToken(privyAccessToken: string): Promise<string> {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/privy-jwt-exchange`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${privyAccessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`JWT exchange failed: ${res.status}`);
  }

  const { token } = await res.json();
  return token;
}

export function useSupabaseWithPrivy() {
  const { getAccessToken } = usePrivy();
  const clientRef = useRef<SupabaseClient | null>(null);

  const getAuthenticatedClient = useCallback(async (): Promise<SupabaseClient> => {
    const privyToken = await getAccessToken();
    if (!privyToken) throw new Error("Not authenticated with Privy");

    const supabaseToken = await exchangePrivyToken(privyToken);

    clientRef.current = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
        },
      },
    });

    return clientRef.current;
  }, [getAccessToken]);

  return { getAuthenticatedClient };
}
