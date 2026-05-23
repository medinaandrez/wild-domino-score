import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from "@/lib/GameContext";
import { useSettings } from "@/lib/SettingsContext";
import { isGameOver } from "@/lib/gameLogic";
import { colors, useTheme } from "@/lib/theme";

export default function HomeScreen() {
  const { game, loading } = useGame();
  const { t } = useTheme();
  const { s } = useSettings();

  if (loading) {
    return (
      <View style={[st.center, { backgroundColor: t.bg }]}>
        <Text style={{ color: colors.amber, fontSize: 22, fontWeight: "600" }}>
          {s.loading}
        </Text>
      </View>
    );
  }

  return (
    <View style={[st.container, { backgroundColor: t.bg }]}>
      <View style={st.logoBlock}>
        <Text style={st.logoEmoji}>🎲</Text>
        <Text style={[st.logoTitle, { color: colors.amber }]}>Wild Domino</Text>
        <Text style={[st.logoSub, { color: t.muted }]}>Game Score</Text>
        <Text style={[st.logoTag, { color: t.muted }]}>Texas Wild Domino Game</Text>
      </View>

      <View style={st.buttons}>
        <TouchableOpacity style={st.btnPrimary} onPress={() => router.push("/new-game")} activeOpacity={0.8}>
          <Text style={st.btnPrimaryText}>{s.newGame}</Text>
        </TouchableOpacity>

        {game && !isGameOver(game) && (
          <TouchableOpacity style={[st.btnSecondary, { backgroundColor: colors.cyan }]} onPress={() => router.push("/game")} activeOpacity={0.8}>
            <Text style={[st.btnSecondaryText, { color: "#fff" }]}>{s.continueGame}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[st.btnOutline, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => router.push("/history")} activeOpacity={0.75}>
          <Text style={[st.btnOutlineText, { color: t.text }]}>{s.history}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[st.btnOutline, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => router.push("/rules")} activeOpacity={0.75}>
          <Text style={[st.btnOutlineText, { color: t.text }]}>{s.rulesTitle}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
  logoBlock: { alignItems: "center", marginBottom: 24 },
  logoEmoji: { fontSize: 56, marginBottom: 4 },
  logoTitle: { fontSize: 48, fontWeight: "900", letterSpacing: -1 },
  logoSub: { fontSize: 20, fontWeight: "600", marginTop: 2 },
  logoTag: { fontSize: 13, marginTop: 4, opacity: 0.7 },
  buttons: { width: "100%", gap: 14 },
  btnPrimary: { backgroundColor: colors.amber, borderRadius: 18, paddingVertical: 18, alignItems: "center" },
  btnPrimaryText: { color: colors.onAmber, fontSize: 20, fontWeight: "700" },
  btnSecondary: { borderRadius: 18, paddingVertical: 18, alignItems: "center" },
  btnSecondaryText: { fontSize: 20, fontWeight: "700" },
  btnOutline: { borderRadius: 18, borderWidth: 1.5, paddingVertical: 18, alignItems: "center" },
  btnOutlineText: { fontSize: 20, fontWeight: "600" },
});
