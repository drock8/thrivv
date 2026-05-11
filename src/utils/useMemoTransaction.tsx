import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useConnection } from "./ConnectionProvider";
import { usePrivyWallet } from "./usePrivyWallet";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export function useMemoTransaction() {
  const { connection } = useConnection();
  const { publicKey, signAndSendTransaction } = usePrivyWallet();
  const client = useQueryClient();

  return useMutation({
    mutationKey: ["send-memo"],
    mutationFn: async (memoText: string) => {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      const { value: latestBlockhash } =
        await connection.getLatestBlockhashAndContext();

      const memoInstruction = new TransactionInstruction({
        programId: MEMO_PROGRAM_ID,
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
        data: Buffer.from(memoText, "utf-8"),
      });

      const message = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [memoInstruction],
      }).compileToLegacyMessage();

      const transaction = new VersionedTransaction(message);

      const signature = await signAndSendTransaction(transaction);

      await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed"
      );

      return signature;
    },
    onSuccess: () => {
      if (!publicKey) return;
      return Promise.all([
        client.invalidateQueries({
          queryKey: [
            "get-balance",
            { endpoint: connection.rpcEndpoint, address: publicKey },
          ],
        }),
        client.invalidateQueries({
          queryKey: [
            "get-signatures",
            { endpoint: connection.rpcEndpoint, address: publicKey },
          ],
        }),
      ]);
    },
  });
}
