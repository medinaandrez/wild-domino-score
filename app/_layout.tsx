import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, Linking, TouchableOpacity, Text } from "react-native";
import { GameProvider } from "@/lib/GameContext";
import { SettingsProvider } from "@/lib/SettingsContext";
import { useSettings } from "@/lib/SettingsContext";
import { requestNotificationPermission } from "@/lib/notifications";
import { colors, useTheme } from "@/lib/theme";
import AnimatedSplash from "@/components/AnimatedSplash";
import { importFromURL } from "@/lib/transferHistory";

function AppNavigator() {
  const { isDark, t } = useTheme();
  const { s } = useSettings();

  async function handleIncomingURL(url: string) {
    if (!url) return;
    // Only handle file:// and content:// URLs (not our own deep links)
    if (!url.startsWith("file://") && !url.startsWith("content://")) return;
    try {
      const { added, skipped } = await importFromURL(url);
      router.push("/history");
      Alert.alert("✅", added > 0
        ? `Se importaron ${added} partida${added !== 1 ? "s" : ""}${skipped > 0 ? ` (${skipped} ya existía${skipped !== 1 ? "n" : ""})` : ""}.`
        : "Todas las partidas ya estaban en el historial.");
    } catch {
      Alert.alert("Error", "No se pudo importar el archivo.");
    }
  }

  useEffect(() => {
    requestNotificationPermission();
    // Handle file opened while app was closed
    Linking.getInitialURL().then((url) => { if (url) handleIncomingURL(url); });
    // Handle file opened while app is running
    const sub = Linking.addEventListener("url", ({ url }) => handleIncomingURL(url));
    return () => sub.remove();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: colors.amber,
          headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: s.navHome,
            headerRight: () => (
              <TouchableOpacity onPress={() => router.push("/settings")} style={{ marginRight: 4, padding: 4 }}>
                <Text style={{ fontSize: 22 }}>⚙️</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen name="new-game" options={{ title: s.navNewGame }} />
        <Stack.Screen name="game/index" options={{ title: s.navScoreboard, headerBackVisible: false }} />
        <Stack.Screen name="game/enter-scores" options={{ title: s.navEnterScores }} />
        <Stack.Screen name="results" options={{ title: s.navResults, headerBackVisible: false }} />
        <Stack.Screen name="history" options={{ title: s.navHistory }} />
        <Stack.Screen name="rules" options={{ title: s.navRules }} />
        <Stack.Screen name="settings" options={{ title: s.navSettings }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <SettingsProvider>
      <GameProvider>
        <AppNavigator />
        {!splashDone && <AnimatedSplash onDone={() => setSplashDone(true)} />}
      </GameProvider>
    </SettingsProvider>
  );
}
