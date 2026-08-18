import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Appearance } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth/AuthProvider";
import { AppLaunchScreen } from "@/src/components/AppLaunchScreen";
import { BtbMascotOverlay } from "@/src/mascot/BtbMascotOverlay";
import { DiscoveryProvider } from "@/src/mascot/DiscoveryProvider";
import { MascotActionsProvider } from "@/src/mascot/MascotActions";
import { AndroidBackGuard } from "@/src/navigation/AndroidBackGuard";
import { AppProviders } from "@/src/providers/AppProviders";
import { colors, themeMode } from "@/src/theme/theme";
import { TutorialProvider } from "@/src/tutorial/TutorialProvider";
import { syncWidgetTheme } from "@/src/widgets/btb-widget";

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

  useEffect(() => {
    Appearance.setColorScheme(themeMode);
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
    syncWidgetTheme(themeMode).catch(() => undefined);
  }, []);

  if (!launchComplete) {
    return (
      <>
        <StatusBar style={themeMode === "light" ? "dark" : "light"} />
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
      <StatusBar style={themeMode === "light" ? "dark" : "light"} />
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
            name="super/[key]"
            options={{ title: "Super Kararı Detayı" }}
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
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: "Bulunamadı" }} />
      </Stack>
      <AndroidBackGuard />
      {hasSession ? <BtbMascotOverlay /> : null}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <MascotActionsProvider>
          <TutorialProvider>
            {/* Inside the tutorial so discovery can stand down while a guide
                step is on screen; the two never compete for Bibi. */}
            <DiscoveryProvider>
              <RootNavigator />
            </DiscoveryProvider>
          </TutorialProvider>
        </MascotActionsProvider>
      </AppProviders>
    </SafeAreaProvider>
  );
}
