import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GameProvider } from "@/lib/GameContext";
import { useColorScheme } from "react-native";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  const isDark = useColorScheme() === "dark";
  const t = isDark ? colors.dark : colors.light;

  return (
    <GameProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: colors.amber,
          headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Spinner Scorekeeper" }} />
        <Stack.Screen name="new-game" options={{ title: "Nueva partida" }} />
        <Stack.Screen name="game/index" options={{ title: "Marcador", headerBackVisible: false }} />
        <Stack.Screen name="game/enter-scores" options={{ title: "Ingresar puntos" }} />
        <Stack.Screen name="results" options={{ title: "Resultados finales", headerBackVisible: false }} />
        <Stack.Screen name="history" options={{ title: "Historial" }} />
        <Stack.Screen name="rules" options={{ title: "Reglas del juego" }} />
      </Stack>
    </GameProvider>
  );
}
