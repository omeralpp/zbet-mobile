import { useCallback, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth/AuthProvider";
import { AppLaunchScreen } from "@/src/components/AppLaunchScreen";
import { BtbMascotOverlay } from "@/src/mascot/BtbMascotOverlay";
import { MascotActionsProvider } from "@/src/mascot/MascotActions";
import { AndroidBackGuard } from "@/src/navigation/AndroidBackGuard";
import { AppProviders } from "@/src/providers/AppProviders";
import { colors } from "@/src/theme/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const auth = useAuth();
  const [launchComplete, setLaunchComplete] = useState(false);
  const hasSession =
    auth.status === "authenticated" || auth.status === "preview";
  const handleLaunchComplete = useCallback(() => {
    setLaunchComplete(true);
  }, []);
  const handleLaunchLayout = useCallback(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  if (!launchComplete) {
    return (
      <>
        <StatusBar style="light" />
        <AppLaunchScreen
          onComplete={handleLaunchComplete}
          onLayout={handleLaunchLayout}
          ready={auth.status !== "loading"}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AndroidBackGuard />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.backgroundElevated },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerBackTitle: "Geri"
        }}
      >
        <Stack.Protected guard={hasSession}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="match/[key]"
            options={{ title: "Maç Detayı" }}
          />
          <Stack.Screen
            name="toto/[gcNo]/[version]"
            options={{ title: "Toto Programı" }}
          />
          <Stack.Screen
            name="fiori"
            options={{ headerShown: false }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!hasSession}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="+not-found" options={{ title: "Bulunamadı" }} />
      </Stack>
      {hasSession ? <BtbMascotOverlay /> : null}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <MascotActionsProvider>
          <RootNavigator />
        </MascotActionsProvider>
      </AppProviders>
    </SafeAreaProvider>
  );
}
