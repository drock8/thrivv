import { usePrivy } from "@privy-io/expo";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";

export type Account = Readonly<{
  address: string;
  publicKey: PublicKey;
}>;

export function useAuth() {
  const { isReady, user, logout } = usePrivy();
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];

  const selectedAccount: Account | null = useMemo(() => {
    if (!wallet?.address) return null;
    return {
      address: wallet.address,
      publicKey: new PublicKey(wallet.address),
    };
  }, [wallet?.address]);

  return useMemo(
    () => ({
      isReady,
      authenticated: !!user,
      user,
      selectedAccount,
      wallet,
      logout,
    }),
    [isReady, user, selectedAccount, wallet, logout]
  );
}
