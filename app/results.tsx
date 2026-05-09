import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from "@/lib/GameContext";
import { getRanking } from "@/lib/gameLogic";
import { saveGameToHistory } from "@/lib/storage";
import { colors, useTheme } from "@/lib/theme";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function ResultsScreen() {
  const { game, abandonGame } = useGame();
  const { t } = useTheme();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!game) router.replace("/");
  }, [game]);

  if (!game) return null;

  const ranking = getRanking(game);
  const winner = ranking[0];

  async function handleSave() {
    if (saved) return;
    await saveGameToHistory(game!);
    setSaved(true);
    Alert.alert("Guardado", "La partida se guardó en el historial.");
  }

  async function handleNewGame() { await abandonGame(); router.replace("/new-game"); }
  async function handleHome() { await abandonGame(); router.replace("/"); }

  return (
    <View style={[s.flex, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Winner banner */}
        <View style={s.winnerBanner}>
          <Text style={{ fontSize: 52, marginBottom: 6 }}>🏆</Text>
          <Text style={s.winnerName}>{winner.player.name}</Text>
          <Text style={s.winnerLabel}>¡Ganó la partida!</Text>
          <Text style={s.winnerScore}>{winner.total} pts</Text>
        </View>

        <Text style={[s.sectionTitle, { color: t.text }]}>Clasificación final</Text>

        {ranking.map((item, i) => (
          <View key={item.player.id} style={[s.rankCard, { backgroundColor: t.card }]}>
            <View style={s.rankLeft}>
              <Text style={s.medal}>{MEDALS[i] ?? `${i + 1}.`}</Text>
              <Text style={[s.rankName, { color: t.text }]}>{item.player.name}</Text>
            </View>
            <Text style={[s.rankScore, { color: i === 0 ? colors.amber : t.muted }]}>{item.total}</Text>
          </View>
        ))}

        <View style={s.actions}>
          {!saved ? (
            <TouchableOpacity style={[s.btn, { backgroundColor: colors.cyan }]} onPress={handleSave} activeOpacity={0.8}>
              <Text style={[s.btnText, { color: "#fff" }]}>Guardar en historial</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.savedBadge}>
              <Text style={{ color: colors.green, fontSize: 17, fontWeight: "600" }}>✓ Guardado en historial</Text>
            </View>
          )}

          <TouchableOpacity style={[s.btn, { backgroundColor: colors.amber }]} onPress={handleNewGame} activeOpacity={0.8}>
            <Text style={[s.btnText, { color: "#1e293b" }]}>Nueva partida</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.btn, { backgroundColor: t.card, borderWidth: 1.5, borderColor: t.border }]} onPress={handleHome} activeOpacity={0.75}>
            <Text style={[s.btnText, { color: t.text }]}>Ir al inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },
  winnerBanner: { backgroundColor: colors.amber, borderRadius: 24, padding: 28, alignItems: "center", marginBottom: 8 },
  winnerName: { color: "#1e293b", fontSize: 30, fontWeight: "900" },
  winnerLabel: { color: "#334155", fontSize: 17, fontWeight: "600", marginTop: 4 },
  winnerScore: { color: "#1e293b", fontSize: 40, fontWeight: "900", marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginTop: 4 },
  rankCard: { borderRadius: 18, paddingHorizontal: 20, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rankLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  medal: { fontSize: 30, width: 40, textAlign: "center" },
  rankName: { fontSize: 20, fontWeight: "700" },
  rankScore: { fontSize: 22, fontWeight: "900" },
  actions: { gap: 12, marginTop: 8 },
  btn: { borderRadius: 18, paddingVertical: 18, alignItems: "center" },
  btnText: { fontSize: 20, fontWeight: "700" },
  savedBadge: { backgroundColor: colors.greenLight, borderWidth: 1, borderColor: "rgba(34,197,94,0.3)", borderRadius: 18, paddingVertical: 16, alignItems: "center" },
});
