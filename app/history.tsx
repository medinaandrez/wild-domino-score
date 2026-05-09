import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SavedGame } from "@/lib/types";
import { clearHistory, loadHistory } from "@/lib/storage";
import { colors, useTheme } from "@/lib/theme";

const MEDALS = ["🥇", "🥈", "🥉"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function HistoryScreen() {
  const { t } = useTheme();
  const [history, setHistory] = useState<SavedGame[]>([]);

  useEffect(() => { loadHistory().then(setHistory); }, []);

  function confirmClear() {
    Alert.alert("Borrar historial", "¿Eliminar todas las partidas guardadas?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Borrar todo", style: "destructive", onPress: async () => { await clearHistory(); setHistory([]); } },
    ]);
  }

  if (history.length === 0) {
    return (
      <View style={[s.flex, s.center, { backgroundColor: t.bg }]}>
        <Text style={{ fontSize: 52, marginBottom: 14 }}>📭</Text>
        <Text style={[s.emptyTitle, { color: t.text }]}>Sin partidas guardadas</Text>
        <Text style={[s.emptySub, { color: t.muted }]}>Las partidas terminadas aparecerán aquí</Text>
      </View>
    );
  }

  return (
    <View style={[s.flex, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={[s.sectionTitle, { color: t.text }]}>
          {history.length} partida{history.length !== 1 ? "s" : ""}
        </Text>

        {history.map((game) => (
          <View key={game.id} style={[s.card, { backgroundColor: t.card }]}>
            <View style={s.cardHeader}>
              <Text style={[s.dateText, { color: t.muted }]}>{formatDate(game.date)}</Text>
              <View style={s.winnerBadge}>
                <Text style={{ color: colors.amber, fontSize: 13, fontWeight: "700" }}>🏆 {game.winner}</Text>
              </View>
            </View>

            <Text style={[s.rankLabel, { color: t.muted }]}>Clasificación</Text>
            {game.finalScores.map((score, i) => (
              <View key={i} style={s.scoreRow}>
                <Text style={[s.scorePlayer, { color: t.text }]}>
                  {MEDALS[i] ?? `${i + 1}.`} {score.name}
                </Text>
                <Text style={[s.scorePoints, { color: i === 0 ? colors.amber : t.muted }]}>
                  {score.total} pts
                </Text>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={[s.clearBtn, { borderColor: colors.red }]} onPress={confirmClear}>
          <Text style={{ color: colors.red, fontSize: 15, fontWeight: "600" }}>Borrar historial</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "600" },
  emptySub: { fontSize: 15, marginTop: 6, textAlign: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  card: { borderRadius: 18, padding: 18 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  dateText: { fontSize: 13 },
  winnerBadge: { backgroundColor: colors.amberLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  rankLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  scorePlayer: { fontSize: 15 },
  scorePoints: { fontSize: 15, fontWeight: "700" },
  clearBtn: { borderWidth: 1, borderRadius: 18, paddingVertical: 16, alignItems: "center", marginTop: 8 },
});
