import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { useConnection } from "./ConnectionProvider";
import { Transaction, VersionedTransaction, PublicKey } from "@solana/web3.js";
import { useCallback, useMemo } from "react";

export function usePrivyWallet() {
  const { wallets } = useEmbeddedSolanaWallet();
  const { connection } = useConnection();
  const wallet = wallets?.[0];

  const publicKey = useMemo(
    () => (wallet?.address ? new PublicKey(wallet.address) : null),
    [wallet?.address]
  );

  const signAndSendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction
    ): Promise<string> => {
      if (!wallet) throw new Error("Wallet not connected");
      const provider = await wallet.getProvider();
      const { signature } = await provider.request({
        method: "signAndSendTransaction",
        params: { transaction, connection },
      });
      return signature;
    },
    [wallet, connection]
  );

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<string> => {
      if (!wallet) throw new Error("Wallet not connected");
      const provider = await wallet.getProvider();
      const { signature } = await provider.request({
        method: "signMessage",
        params: { message: Buffer.from(message).toString("base64") },
      });
      return signature;
    },
    [wallet]
  );

  return useMemo(
    () => ({ wallet, publicKey, signAndSendTransaction, signMessage }),
    [wallet, publicKey, signAndSendTransaction, signMessage]
  );
}
