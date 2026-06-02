import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SavedGame } from "@/lib/types";
import { clearHistory, loadHistory } from "@/lib/storage";
import { exportAllGames, exportSingleGame, importGamesFromFile } from "@/lib/transferHistory";
import { useSettings } from "@/lib/SettingsContext";
import { colors, useTheme } from "@/lib/theme";
import { MEDALS } from "@/lib/constants";

function computeStats(history: SavedGame[]) {
  const winCount: Record<string, number> = {};
  let totalWinnerScore = 0;

  for (const game of history) {
    const winner = game.winner;
    winCount[winner] = (winCount[winner] ?? 0) + 1;
    totalWinnerScore += game.finalScores[0]?.total ?? 0;
  }

  const topWinner = Object.entries(winCount).sort((a, b) => b[1] - a[1])[0];

  return {
    totalGames: history.length,
    topWinnerName: topWinner?.[0] ?? "—",
    topWinnerCount: topWinner?.[1] ?? 0,
    avgWinnerScore: Math.round(totalWinnerScore / history.length),
  };
}

export default function HistoryScreen() {
  const { t } = useTheme();
  const { s } = useSettings();
  const [history, setHistory] = useState<SavedGame[]>([]);

  useEffect(() => { loadHistory().then(setHistory); }, []);

  const formatDate = useCallback((iso: string): string => {
    return new Date(iso).toLocaleDateString(s.dateLocale, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }, [s.dateLocale]);

  function confirmClear() {
    Alert.alert(s.confirmClearTitle, s.confirmClearMsg, [
      { text: s.cancel, style: "cancel" },
      { text: s.clearAll, style: "destructive", onPress: async () => { await clearHistory(); setHistory([]); } },
    ]);
  }

  async function handleExportAll() {
    try {
      await exportAllGames();
    } catch (err: any) {
      if (err?.message === "cancelado") return;
      if (err?.message === "sin_partidas") return;
      Alert.alert("Error", s.exportError);
    }
  }

  async function handleExportOne(game: SavedGame) {
    try {
      await exportSingleGame(game);
    } catch (err: any) {
      if (err?.message === "cancelado") return;
      Alert.alert("Error", s.exportError);
    }
  }

  async function handleImport() {
    try {
      const { added, skipped } = await importGamesFromFile();
      const fresh = await loadHistory();
      setHistory(fresh);
      Alert.alert("✅", s.importSuccess(added, skipped));
    } catch (err: any) {
      if (err?.message === "cancelado") return;
      Alert.alert("Error detalle", String(err?.message ?? err));
    }
  }

  const stats = useMemo(() => computeStats(history), [history]);

  if (history.length === 0) {
    return (
      <View style={[st.flex, st.center, { backgroundColor: t.bg }]}>
        <Text style={{ fontSize: 52, marginBottom: 14 }}>📭</Text>
        <Text style={[st.emptyTitle, { color: t.text }]}>{s.noGames}</Text>
        <Text style={[st.emptySub, { color: t.muted }]}>{s.noGamesHint}</Text>
        <TouchableOpacity
          style={[st.importEmptyBtn, { backgroundColor: t.card, borderColor: t.border }]}
          onPress={handleImport}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20 }}>📥</Text>
          <Text style={[{ fontSize: 15, fontWeight: "600" }, { color: t.text }]}>{s.importGames}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[st.flex, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={st.scroll}>

        {/* Stats panel */}
        <View style={[st.statsCard, { backgroundColor: t.card }]}>
          <Text style={[st.statsTitle, { color: t.text }]}>{s.statsTitle}</Text>
          <View style={st.statsRow}>

            <View style={st.statItem}>
              <Text style={st.statEmoji}>🎮</Text>
              <Text style={[st.statValue, { color: t.text }]}>{stats.totalGames}</Text>
              <Text style={[st.statLabel, { color: t.muted }]}>{s.statGames}</Text>
            </View>

            <View style={[st.statDivider, { backgroundColor: t.border }]} />

            <View style={st.statItem}>
              <Text style={st.statEmoji}>🏆</Text>
              <Text style={[st.statValue, { color: colors.amber }]} numberOfLines={1}>{stats.topWinnerName}</Text>
              <Text style={[st.statLabel, { color: t.muted }]}>{s.statWins(stats.topWinnerCount)}</Text>
            </View>

            <View style={[st.statDivider, { backgroundColor: t.border }]} />

            <View style={st.statItem}>
              <Text style={st.statEmoji}>📊</Text>
              <Text style={[st.statValue, { color: t.text }]}>{stats.avgWinnerScore}</Text>
              <Text style={[st.statLabel, { color: t.muted }]}>{s.statAvgScore}</Text>
            </View>

          </View>
        </View>

        {/* Export / Import row */}
        <View style={st.transferRow}>
          <TouchableOpacity style={[st.transferBtn, { backgroundColor: t.card, borderColor: t.border }]} onPress={handleExportAll} activeOpacity={0.7}>
            <Text style={st.transferIcon}>📤</Text>
            <Text style={[st.transferLabel, { color: t.text }]}>{s.exportAll}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.transferBtn, { backgroundColor: t.card, borderColor: t.border }]} onPress={handleImport} activeOpacity={0.7}>
            <Text style={st.transferIcon}>📥</Text>
            <Text style={[st.transferLabel, { color: t.text }]}>{s.importGames}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[st.sectionTitle, { color: t.text }]}>{s.gameCount(history.length)}</Text>

        {history.map((game) => (
          <View key={game.id} style={[st.card, { backgroundColor: t.card }]}>
            <View style={st.cardHeader}>
              <Text style={[st.dateText, { color: t.muted }]}>{formatDate(game.date)}</Text>
              <View style={st.cardHeaderRight}>
                <View style={st.winnerBadge}>
                  <Text style={{ color: colors.amber, fontSize: 13, fontWeight: "700" }}>🏆 {game.winner}</Text>
                </View>
                <TouchableOpacity onPress={() => handleExportOne(game)} activeOpacity={0.7} style={st.exportOneBtn}>
                  <Text style={{ fontSize: 16 }}>📤</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[st.rankLabel, { color: t.muted }]}>{s.rankingLabel.toUpperCase()}</Text>
            {game.finalScores.map((score, i) => (
              <View key={i} style={st.scoreRow}>
                <Text style={[st.scorePlayer, { color: t.text }]}>
                  {MEDALS[i] ?? `${i + 1}.`} {score.name}
                </Text>
                <Text style={[st.scorePoints, { color: i === 0 ? colors.amber : t.muted }]}>
                  {score.total} {s.pts}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={[st.clearBtn, { borderColor: colors.red }]} onPress={confirmClear}>
          <Text style={{ color: colors.red, fontSize: 15, fontWeight: "600" }}>{s.clearHistory}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  // Stats
  statsCard: { borderRadius: 18, padding: 18 },
  statsTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: 18, fontWeight: "900", textAlign: "center" },
  statLabel: { fontSize: 12, textAlign: "center" },
  statDivider: { width: 1, height: 48, marginHorizontal: 8 },
  // List
  emptyTitle: { fontSize: 20, fontWeight: "600" },
  emptySub: { fontSize: 15, marginTop: 6, textAlign: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  card: { borderRadius: 18, padding: 18 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  dateText: { fontSize: 13 },
  winnerBadge: { backgroundColor: colors.amberLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  rankLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  scorePlayer: { fontSize: 15 },
  scorePoints: { fontSize: 15, fontWeight: "700" },
  clearBtn: { borderWidth: 1, borderRadius: 18, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  importEmptyBtn: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 28, marginTop: 24 },
  // Transfer
  transferRow: { flexDirection: "row", gap: 10 },
  transferBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 14 },
  transferIcon: { fontSize: 18 },
  transferLabel: { fontSize: 14, fontWeight: "600" },
  cardHeaderRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  exportOneBtn: { padding: 4 },
});
