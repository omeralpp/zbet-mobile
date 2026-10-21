import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth/AuthProvider";
import { AppLaunchScreen } from "@/src/components/AppLaunchScreen";
import { hasPlayedLaunch, markLaunchPlayed } from "@/src/components/launch-session";
import { BtbMascotOverlay } from "@/src/mascot/BtbMascotOverlay";
import { notifyMascotInteraction } from "@/src/mascot/interaction-activity";
import { DiscoveryProvider } from "@/src/mascot/DiscoveryProvider";
import { AndroidBackGuard } from "@/src/navigation/AndroidBackGuard";
import { AppProviders } from "@/src/providers/AppProviders";
import { useBrandFonts } from "@/src/theme/fonts";
import { applySystemTheme } from "@/src/theme/system-theme";
import { colors, themeMode } from "@/src/theme/theme";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";
import { TutorialProvider } from "@/src/tutorial/TutorialProvider";
import { AppShell } from "@/src/web/AppShell";
import { runtimeConfig } from "@/src/config/runtime";
import { designLabAvailable } from "@/src/design-lab/jinx-motion";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const auth = useAuth();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const fontsReady = useBrandFonts();
  const [skippedLaunch] = useState(hasPlayedLaunch);
  const [launchComplete, setLaunchComplete] = useState(skippedLaunch);
  const hasSession =
    auth.status === "authenticated" || auth.status === "preview";
  const handleLaunchComplete = useCallback(() => {
    markLaunchPlayed();
    setLaunchComplete(true);
  }, []);
  const handleLaunchLayout = useCallback(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  useEffect(() => {
    applySystemTheme(themeMode, colors.background);
  }, []);

  if (!launchComplete) {
    return (
      <>
        <StatusBar style={themeMode === "light" ? "dark" : "light"} />
        <AppLaunchScreen
          onComplete={handleLaunchComplete}
          onLayout={handleLaunchLayout}
          ready={auth.status !== "loading" && fontsReady}
        />
      </>
    );
  }
  // A skipped launch (web reload) must still wait for the auth answer, or the
  // guards below would bounce a deep link through the sign-in route. Only the
  // web build skips the launch, and its preview/edge modes never re-enter
  // "loading" after boot (only native OAuth sign-in does). It also waits for
  // the bundled faces, so a reload never paints in the fallback font first.
  if (skippedLaunch && (auth.status === "loading" || !fontsReady)) {
    return <View style={[styles.root, { backgroundColor: colors.background }]} />;
  }

  return (
    <>
      <StatusBar style={themeMode === "light" ? "dark" : "light"} />
      <AppShell>
      <Stack
        screenOptions={{
          animation: reduceMotion ? "none" : "slide_from_right",
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
            options={{ title: "Maç detayı" }}
          />
          <Stack.Screen
            name="super/[key]"
            options={{ title: "Super kararı" }}
          />
          <Stack.Screen
            name="toto/[gcNo]/[version]"
            options={{ title: "Toto programı" }}
          />
        </Stack.Protected>
        <Stack.Protected guard={hasSession && designLabAvailable(runtimeConfig)}>
          <Stack.Screen name="design-lab" options={{ title: "Tasarım atölyesi", headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!hasSession}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: "Bulunamadı" }} />
      </Stack>
      </AppShell>
      <AndroidBackGuard />
      {hasSession && pathname !== "/design-lab" ? <BtbMascotOverlay /> : null}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      onTouchStart={notifyMascotInteraction}
      style={styles.root}
    >
      <SafeAreaProvider>
        <AppProviders>
          <TutorialProvider>
            {/* Inside the tutorial so discovery can stand down while a guide
                step is on screen; the two never compete for Bibi. */}
            <DiscoveryProvider>
              <RootNavigator />
            </DiscoveryProvider>
          </TutorialProvider>
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
