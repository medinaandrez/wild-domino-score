import { router, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from "@/lib/GameContext";
import { isGameOver } from "@/lib/gameLogic";
import { colors, useTheme } from "@/lib/theme";

export default function HomeScreen() {
  const { game, loading } = useGame();
  const { isDark, t } = useTheme();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return; // navigator not ready yet
    if (!loading && game && !isGameOver(game)) {
      router.replace("/game");
    }
  }, [loading, game, navState?.key]);

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: t.bg }]}>
        <Text style={{ color: colors.amber, fontSize: 22, fontWeight: "600" }}>
          🎲 Cargando…
        </Text>
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: t.bg }]}>
      <View style={s.logoBlock}>
        <Text style={s.logoEmoji}>🎲</Text>
        <Text style={[s.logoTitle, { color: colors.amber }]}>Spinner</Text>
        <Text style={[s.logoSub, { color: t.muted }]}>Scorekeeper</Text>
        <Text style={[s.logoTag, { color: t.muted }]}>Texas Wild Domino Game</Text>
      </View>

      <View style={s.buttons}>
        <TouchableOpacity style={s.btnPrimary} onPress={() => router.push("/new-game")} activeOpacity={0.8}>
          <Text style={s.btnPrimaryText}>Nueva partida</Text>
        </TouchableOpacity>

        {game && !isGameOver(game) && (
          <TouchableOpacity style={[s.btnSecondary, { backgroundColor: colors.cyan }]} onPress={() => router.push("/game")} activeOpacity={0.8}>
            <Text style={[s.btnSecondaryText, { color: "#fff" }]}>Continuar partida</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[s.btnOutline, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => router.push("/history")} activeOpacity={0.75}>
          <Text style={[s.btnOutlineText, { color: t.text }]}>Historial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btnOutline, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => router.push("/rules")} activeOpacity={0.75}>
          <Text style={[s.btnOutlineText, { color: t.text }]}>Reglas del juego</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
  logoBlock: { alignItems: "center", marginBottom: 24 },
  logoEmoji: { fontSize: 56, marginBottom: 4 },
  logoTitle: { fontSize: 48, fontWeight: "900", letterSpacing: -1 },
  logoSub: { fontSize: 20, fontWeight: "600", marginTop: 2 },
  logoTag: { fontSize: 13, marginTop: 4, opacity: 0.7 },
  buttons: { width: "100%", gap: 14 },
  btnPrimary: { backgroundColor: colors.amber, borderRadius: 18, paddingVertical: 18, alignItems: "center" },
  btnPrimaryText: { color: "#1e293b", fontSize: 20, fontWeight: "700" },
  btnSecondary: { borderRadius: 18, paddingVertical: 18, alignItems: "center" },
  btnSecondaryText: { fontSize: 20, fontWeight: "700" },
  btnOutline: { borderRadius: 18, borderWidth: 1.5, paddingVertical: 18, alignItems: "center" },
  btnOutlineText: { fontSize: 20, fontWeight: "600" },
});
