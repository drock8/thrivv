import { View } from "react-native";
import { EmailLoginForm, OAuthButtons, Divider } from "./sign-in-ui";

export function SignInFeature() {
  return (
    <View style={{ width: "100%", gap: 16, paddingHorizontal: 8 }}>
      <OAuthButtons />
      <Divider />
      <EmailLoginForm />
    </View>
  );
}
