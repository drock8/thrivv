import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLoginWithEmail, useLoginWithOAuth } from "@privy-io/expo";

export function EmailLoginForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { sendCode, loginWithCode, state } = useLoginWithEmail({
    onSendCodeSuccess() {
      console.log("[Privy] OTP code sent successfully");
      setErrorMsg("");
    },
    onLoginSuccess(user) {
      console.log("[Privy] Login success:", user.id);
      setErrorMsg("");
    },
    onError(err) {
      console.error("[Privy] Auth error:", JSON.stringify(err));
      setErrorMsg(err?.message || JSON.stringify(err));
    },
  });

  const awaitingCode =
    state.status === "awaiting-code-input" ||
    state.status === "submitting-code";

  const handleSendCode = async () => {
    if (!email.trim()) return;
    setErrorMsg("");
    try {
      await sendCode({ email: email.trim() });
    } catch (e: any) {
      console.error("[Privy] sendCode error:", e);
      setErrorMsg(e?.message || String(e));
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return;
    setErrorMsg("");
    try {
      await loginWithCode({ code: code.trim(), email: email.trim() });
    } catch (e: any) {
      console.error("[Privy] loginWithCode error:", e);
      setErrorMsg(e?.message || String(e));
    }
  };

  return (
    <View style={{ width: "100%", gap: 12 }}>
      {!awaitingCode ? (
        <>
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#6B6760"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              backgroundColor: "#171717",
              borderRadius: 12,
              padding: 16,
              color: "#F5F2EA",
              fontSize: 16,
              borderWidth: 1,
              borderColor: "#2A2A2A",
            }}
          />
          <TouchableOpacity
            onPress={handleSendCode}
            disabled={
              state.status === "sending-code" || !email.trim()
            }
            activeOpacity={0.8}
            style={{
              backgroundColor:
                state.status === "sending-code" || !email.trim()
                  ? "#2A2A2A"
                  : "#5EBFB5",
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
            }}
          >
            {state.status === "sending-code" ? (
              <ActivityIndicator color="#F5F2EA" />
            ) : (
              <Text
                style={{ color: "#0A0A0A", fontSize: 16, fontWeight: "600" }}
              >
                Continue with Email
              </Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text
            style={{
              color: "#6B6760",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Enter the code sent to {email}
          </Text>
          <TextInput
            placeholder="000000"
            placeholderTextColor="#6B6760"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoFocus
            style={{
              backgroundColor: "#171717",
              borderRadius: 12,
              padding: 16,
              color: "#F5F2EA",
              fontSize: 24,
              fontWeight: "600",
              textAlign: "center",
              letterSpacing: 8,
              borderWidth: 1,
              borderColor: "#5EBFB5",
            }}
          />
          <TouchableOpacity
            onPress={handleVerify}
            disabled={
              state.status === "submitting-code" || !code.trim()
            }
            activeOpacity={0.8}
            style={{
              backgroundColor:
                state.status === "submitting-code" || !code.trim()
                  ? "#2A2A2A"
                  : "#5EBFB5",
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
            }}
          >
            {state.status === "submitting-code" ? (
              <ActivityIndicator color="#F5F2EA" />
            ) : (
              <Text
                style={{ color: "#0A0A0A", fontSize: 16, fontWeight: "600" }}
              >
                Verify Code
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSendCode}
            style={{ alignItems: "center", paddingTop: 4 }}
          >
            <Text style={{ color: "#5EBFB5", fontSize: 14 }}>Resend code</Text>
          </TouchableOpacity>
        </>
      )}

      {(state.status === "error" || errorMsg) && (
        <Text
          style={{
            color: "#C45A3D",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          {errorMsg || "Something went wrong. Please try again."}
        </Text>
      )}
    </View>
  );
}

export function OAuthButtons() {
  const { login, state } = useLoginWithOAuth();
  const loading = state.status === "loading";

  return (
    <View style={{ width: "100%", gap: 10 }}>
      <TouchableOpacity
        onPress={() => login({ provider: "google" })}
        disabled={loading}
        activeOpacity={0.8}
        style={{
          backgroundColor: "#171717",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#2A2A2A",
          flexDirection: "row",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 18 }}>G</Text>
        <Text style={{ color: "#F5F2EA", fontSize: 16, fontWeight: "500" }}>
          Continue with Google
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <TouchableOpacity
          onPress={() => login({ provider: "apple" })}
          disabled={loading}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#F5F2EA",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 18 }}></Text>
          <Text style={{ color: "#0A0A0A", fontSize: 16, fontWeight: "500" }}>
            Continue with Apple
          </Text>
        </TouchableOpacity>
      )}

      {loading && (
        <ActivityIndicator
          color="#5EBFB5"
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
}

export function Divider() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        width: "100%",
        paddingVertical: 4,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: "#2A2A2A" }} />
      <Text style={{ color: "#6B6760", fontSize: 13 }}>or</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: "#2A2A2A" }} />
    </View>
  );
}
