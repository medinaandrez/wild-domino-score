import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import { GameProvider } from "@/lib/GameContext";
import { SettingsProvider } from "@/lib/SettingsContext";
import { useSettings } from "@/lib/SettingsContext";
import { requestNotificationPermission } from "@/lib/notifications";
import { colors, useTheme } from "@/lib/theme";
import AnimatedSplash from "@/components/AnimatedSplash";

function AppNavigator() {
  const { isDark, t } = useTheme();
  const { s } = useSettings();

  useEffect(() => {
    requestNotificationPermission();
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
