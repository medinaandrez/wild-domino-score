import { router } from "expo-router";
import { useEffect } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from "@/lib/GameContext";
import { useSettings } from "@/lib/SettingsContext";
import {
  getDoubleOpener, getLeader,
  getScoreForRound, getTotalScore, isGameOver,
} from "@/lib/gameLogic";
import { colors, useTheme } from "@/lib/theme";

export default function ScoreboardScreen() {
  const { game, undoLastRound, finishGame, abandonGame } = useGame();
  const { isDark, t } = useTheme();
  const { s } = useSettings();

  useEffect(() => {
    if (game && isGameOver(game)) router.replace("/results");
    else if (!game) router.replace("/");
  }, [game]);

  if (!game) return null;

  const leader = getLeader(game);
  const rounds = Array.from({ length: game.totalRounds }, (_, i) => i + 1);

  const sortedPlayers = game.rounds.length > 0
    ? [...game.players].sort((a, b) => getTotalScore(game, a.id) - getTotalScore(game, b.id))
    : game.players;

  function confirmUndo() {
    const lastRound = game.rounds[game.rounds.length - 1];
    if (!lastRound) return;
    Alert.alert(s.confirmUndoTitle, s.confirmUndoMsg(lastRound.roundNumber), [
      { text: s.cancel, style: "cancel" },
      { text: s.undo, style: "destructive", onPress: async () => { await undoLastRound(); } },
    ]);
  }

  function confirmFinish() {
    Alert.alert(s.confirmFinishTitle, s.confirmFinishMsg, [
      { text: s.cancel, style: "cancel" },
      { text: s.finish, style: "destructive", onPress: async () => { await finishGame(); } },
    ]);
  }

  function confirmAbandon() {
    Alert.alert(s.confirmAbandonTitle, s.confirmAbandonMsg, [
      { text: s.cancel, style: "cancel" },
      { text: s.exit, style: "destructive", onPress: async () => { await abandonGame(); router.replace("/"); } },
    ]);
  }

  const currentLabel = s.roundLabel(game.currentRound, getDoubleOpener(game.currentRound));

  return (
    <View style={[st.flex, { backgroundColor: t.bg }]}>
      {/* Round header */}
      <View style={st.roundHeader}>
        <Text style={st.roundTitle}>{currentLabel}</Text>
        <Text style={st.roundSub}>{s.roundOf(game.currentRound, game.totalRounds)}</Text>
      </View>

      {/* Leader banner */}
      {leader && (
        <View style={st.leaderBanner}>
          <Text style={{ color: colors.green, fontSize: 15, fontWeight: "600" }}>
            {s.leading(leader.name, getTotalScore(game, leader.id))}
          </Text>
        </View>
      )}

      {/* Table */}
      <ScrollView horizontal style={st.flex}>
        <ScrollView>
          <View>
            {/* Header row */}
            <View style={st.tableRow}>
              <View style={[st.nameCell, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
                <Text style={[st.colLabel, { color: t.muted }]}>{s.playerCol}</Text>
              </View>
              {rounds.map((r) => {
                const isCurrent = r === game.currentRound;
                return (
                  <View key={r} style={[st.roundCell, { backgroundColor: isCurrent ? colors.amberLight : t.cardAlt, borderColor: t.border }]}>
                    <Text style={[st.colLabel, { color: isCurrent ? colors.amber : t.muted }]}>R{r}</Text>
                    <Text style={[st.colSub, { color: t.muted }]}>D{game.totalRounds - r}</Text>
                  </View>
                );
              })}
              <View style={[st.totalCell, { backgroundColor: colors.amberLight, borderColor: t.border }]}>
                <Text style={[st.colLabel, { color: colors.amber }]}>{s.total}</Text>
              </View>
            </View>

            {/* Player rows */}
            {sortedPlayers.map((player) => {
              const total = getTotalScore(game, player.id);
              const isLeading = leader?.id === player.id;
              return (
                <View key={player.id} style={[st.tableRow, { backgroundColor: isLeading ? colors.greenLight : "transparent", borderBottomColor: t.border, borderBottomWidth: 1 }]}>
                  <View style={[st.nameCell, { borderColor: t.border }]}>
                    <Text style={[st.playerName, { color: t.text }]} numberOfLines={1}>
                      {isLeading ? "🏆 " : ""}{player.name}
                    </Text>
                  </View>
                  {rounds.map((r) => {
                    const round = game.rounds.find((cr) => cr.roundNumber === r);
                    const pts = round ? getScoreForRound(round, player.id) : undefined;
                    const isCurrent = r === game.currentRound;
                    return (
                      <View key={r} style={[st.roundCell, { backgroundColor: isCurrent ? colors.amberLight : "transparent", borderColor: t.border }]}>
                        {pts !== undefined
                          ? <Text style={[st.scoreText, { color: pts === 0 ? colors.green : t.text }]}>{pts}</Text>
                          : <Text style={{ color: t.muted }}>—</Text>}
                      </View>
                    );
                  })}
                  <View style={[st.totalCell, { backgroundColor: colors.amberLight }]}>
                    <Text style={[st.totalText, { color: colors.amber }]}>{total}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Actions */}
      <View style={[st.footer, { backgroundColor: t.card, borderTopColor: t.border }]}>
        <TouchableOpacity style={st.enterBtn} onPress={() => router.push("/game/enter-scores")} activeOpacity={0.8}>
          <Text style={st.enterBtnText}>{s.enterScoresBtn(currentLabel)}</Text>
        </TouchableOpacity>
        {game.rounds.length > 0 && (
          <TouchableOpacity style={st.undoBtn} onPress={confirmUndo} activeOpacity={0.8}>
            <Text style={{ color: t.muted, fontSize: 15 }}>{s.undoRoundBtn(game.rounds[game.rounds.length - 1].roundNumber)}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={st.finishBtn} onPress={confirmFinish} activeOpacity={0.8}>
          <Text style={{ color: colors.green, fontSize: 15, fontWeight: "600" }}>{s.finishGame}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.abandonBtn} onPress={confirmAbandon}>
          <Text style={{ color: colors.red, fontSize: 15 }}>{s.abandonGame}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  roundHeader: { backgroundColor: colors.amber, paddingHorizontal: 20, paddingVertical: 16, alignItems: "center" },
  roundTitle: { color: "#1e293b", fontSize: 22, fontWeight: "900" },
  roundSub: { color: "#334155", fontSize: 13, marginTop: 2, opacity: 0.8 },
  leaderBanner: { backgroundColor: colors.greenLight, paddingHorizontal: 20, paddingVertical: 10, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(34,197,94,0.2)" },
  tableRow: { flexDirection: "row" },
  nameCell: { width: 130, paddingHorizontal: 12, paddingVertical: 14, borderRightWidth: 1, justifyContent: "center" },
  roundCell: { width: 64, paddingHorizontal: 8, paddingVertical: 12, borderRightWidth: 1, alignItems: "center", justifyContent: "center" },
  totalCell: { width: 72, paddingHorizontal: 8, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  colLabel: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  colSub: { fontSize: 11, opacity: 0.6, textAlign: "center" },
  playerName: { fontSize: 15, fontWeight: "600" },
  scoreText: { fontSize: 15, fontWeight: "600" },
  totalText: { fontSize: 18, fontWeight: "900" },
  footer: { padding: 20, gap: 10, borderTopWidth: 1 },
  enterBtn: { backgroundColor: colors.amber, borderRadius: 18, paddingVertical: 18, alignItems: "center" },
  enterBtnText: { color: "#1e293b", fontSize: 17, fontWeight: "700" },
  undoBtn: { alignItems: "center", paddingVertical: 10 },
  finishBtn: { alignItems: "center", paddingVertical: 10 },
  abandonBtn: { alignItems: "center", paddingVertical: 10 },
});
