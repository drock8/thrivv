import { useState } from "react";
import { View, Linking } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuth } from "../../utils/useAuth";
import { useMemoTransaction } from "../../utils/useMemoTransaction";
import { alertAndLog } from "../../utils/alertAndLog";

export function MemoTestButton() {
  const { selectedAccount } = useAuth();
  const sendMemo = useMemoTransaction();
  const [lastSignature, setLastSignature] = useState<string | null>(null);

  if (!selectedAccount) return null;

  const handlePress = async () => {
    try {
      const memoText = `thrivv:hello:${selectedAccount.publicKey.toBase58()}`;
      const signature = await sendMemo.mutateAsync(memoText);
      if (signature) {
        setLastSignature(signature);
      }
    } catch (err: any) {
      alertAndLog(
        "Memo transaction failed",
        err instanceof Error ? err.message : err
      );
    }
  };

  const explorerUrl = lastSignature
    ? `https://explorer.solana.com/tx/${lastSignature}?cluster=devnet`
    : null;

  return (
    <View style={{ marginTop: 24 }}>
      <Button
        mode="contained"
        onPress={handlePress}
        loading={sendMemo.isPending}
        disabled={sendMemo.isPending}
      >
        Test Sign (Memo)
      </Button>

      {lastSignature && (
        <View style={{ marginTop: 12 }}>
          <Text variant="labelSmall" style={{ opacity: 0.6 }}>
            Tx confirmed:
          </Text>
          <Text
            variant="bodySmall"
            style={{ fontFamily: "monospace", marginTop: 4 }}
            selectable
          >
            {lastSignature}
          </Text>
          <Button
            mode="text"
            compact
            onPress={() => {
              if (explorerUrl) Linking.openURL(explorerUrl);
            }}
            style={{ marginTop: 4, alignSelf: "flex-start" }}
          >
            View on Solana Explorer
          </Button>
        </View>
      )}
    </View>
  );
}
