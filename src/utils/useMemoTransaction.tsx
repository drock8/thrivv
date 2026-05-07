import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useConnection } from "./ConnectionProvider";
import { useMobileWallet } from "./useMobileWallet";
import { useAuthorization } from "./useAuthorization";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export function useMemoTransaction() {
  const { connection } = useConnection();
  const { selectedAccount } = useAuthorization();
  const wallet = useMobileWallet();
  const client = useQueryClient();

  return useMutation({
    mutationKey: ["send-memo"],
    mutationFn: async (memoText: string) => {
      if (!selectedAccount) {
        throw new Error("Wallet not connected");
      }

      const pubkey = selectedAccount.publicKey;

      const {
        context: { slot: minContextSlot },
        value: latestBlockhash,
      } = await connection.getLatestBlockhashAndContext();

      const memoInstruction = new TransactionInstruction({
        programId: MEMO_PROGRAM_ID,
        keys: [{ pubkey, isSigner: true, isWritable: false }],
        data: Buffer.from(memoText, "utf-8"),
      });

      const message = new TransactionMessage({
        payerKey: pubkey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [memoInstruction],
      }).compileToLegacyMessage();

      const transaction = new VersionedTransaction(message);

      const signature = await wallet.signAndSendTransaction(
        transaction,
        minContextSlot
      );

      await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed"
      );

      return signature;
    },
    onSuccess: () => {
      if (!selectedAccount) return;
      return Promise.all([
        client.invalidateQueries({
          queryKey: [
            "get-balance",
            {
              endpoint: connection.rpcEndpoint,
              address: selectedAccount.publicKey,
            },
          ],
        }),
        client.invalidateQueries({
          queryKey: [
            "get-signatures",
            {
              endpoint: connection.rpcEndpoint,
              address: selectedAccount.publicKey,
            },
          ],
        }),
      ]);
    },
  });
}
