// Polyfills
import "./src/polyfills";
import "./global.css";

import { StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrivyProvider } from "@privy-io/expo";
import { ConnectionProvider } from "./src/utils/ConnectionProvider";
import { DemoClockProvider } from "./src/lib/demoClock";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import {
  PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from "react-native-paper";
import { AppNavigator } from "./src/navigators/AppNavigator";
import { ClusterProvider } from "./src/components/cluster/cluster-data-access";

const queryClient = new QueryClient();

export default function App() {
  const colorScheme = useColorScheme();
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

  const CombinedDefaultTheme = {
    ...MD3LightTheme,
    ...LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      ...LightTheme.colors,
    },
  };
  const CombinedDarkTheme = {
    ...MD3DarkTheme,
    ...DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      ...DarkTheme.colors,
    },
  };
  return (
    <PrivyProvider
      appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID!}
      config={{
        embedded: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <DemoClockProvider>
        <QueryClientProvider client={queryClient}>
          <ClusterProvider>
            <ConnectionProvider config={{ commitment: "processed" }}>
              <SafeAreaView
                style={[
                  styles.shell,
                  { backgroundColor: '#0A0A0A' },
                ]}
              >
                <PaperProvider
                  theme={
                    colorScheme === "dark"
                      ? CombinedDarkTheme
                      : CombinedDefaultTheme
                  }
                >
                  <AppNavigator />
                </PaperProvider>
              </SafeAreaView>
            </ConnectionProvider>
          </ClusterProvider>
        </QueryClientProvider>
      </DemoClockProvider>
    </PrivyProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
});
