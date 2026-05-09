import { router } from "expo-router";
import { useEffect } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from "@/lib/GameContext";
import {
  TOTAL_ROUNDS, getLeader, getRoundLabel,
  getScoreForRound, getTotalScore, isGameOver,
} from "@/lib/gameLogic";
import { colors, useTheme } from "@/lib/theme";

export default function ScoreboardScreen() {
  const { game, finishGame, abandonGame } = useGame();
  const { isDark, t } = useTheme();

  useEffect(() => {
    if (game && isGameOver(game)) router.replace("/results");
    else if (!game) router.replace("/");
  }, [game]);

  if (!game) return null;

  const leader = getLeader(game);
  const rounds = Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1);

  // Sort by accumulated score once at least one round is played; original order otherwise
  const sortedPlayers = game.rounds.length > 0
    ? [...game.players].sort((a, b) => getTotalScore(game, a.id) - getTotalScore(game, b.id))
    : game.players;

  function confirmFinish() {
    Alert.alert("Finalizar partida", "¿Finalizar la partida ahora con las rondas jugadas hasta aquí?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Finalizar", style: "destructive", onPress: async () => { await finishGame(); } },
    ]);
  }

  function confirmAbandon() {
    Alert.alert("Abandonar partida", "¿Seguro que quieres salir? Se perderá la partida actual.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: async () => { await abandonGame(); router.replace("/"); } },
    ]);
  }

  return (
    <View style={[s.flex, { backgroundColor: t.bg }]}>
      {/* Round header */}
      <View style={s.roundHeader}>
        <Text style={s.roundTitle}>{getRoundLabel(game.currentRound)}</Text>
        <Text style={s.roundSub}>{game.currentRound} de {TOTAL_ROUNDS} rondas</Text>
      </View>

      {/* Leader banner */}
      {leader && (
        <View style={s.leaderBanner}>
          <Text style={{ color: colors.green, fontSize: 15, fontWeight: "600" }}>
            🏆 Va ganando: {leader.name} ({getTotalScore(game, leader.id)} pts)
          </Text>
        </View>
      )}

      {/* Table */}
      <ScrollView horizontal style={s.flex}>
        <ScrollView>
          <View>
            {/* Header row */}
            <View style={s.tableRow}>
              <View style={[s.nameCell, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
                <Text style={[s.colLabel, { color: t.muted }]}>Jugador</Text>
              </View>
              {rounds.map((r) => {
                const isCurrent = r === game.currentRound;
                return (
                  <View key={r} style={[s.roundCell, { backgroundColor: isCurrent ? colors.amberLight : t.cardAlt, borderColor: t.border }]}>
                    <Text style={[s.colLabel, { color: isCurrent ? colors.amber : t.muted }]}>R{r}</Text>
                    <Text style={[s.colSub, { color: t.muted }]}>D{TOTAL_ROUNDS - r}</Text>
                  </View>
                );
              })}
              <View style={[s.totalCell, { backgroundColor: colors.amberLight, borderColor: t.border }]}>
                <Text style={[s.colLabel, { color: colors.amber }]}>TOTAL</Text>
              </View>
            </View>

            {/* Player rows — sorted by score once rounds have been played */}
            {sortedPlayers.map((player) => {
              const total = getTotalScore(game, player.id);
              const isLeading = leader?.id === player.id;
              return (
                <View key={player.id} style={[s.tableRow, { backgroundColor: isLeading ? colors.greenLight : "transparent", borderBottomColor: t.border, borderBottomWidth: 1 }]}>
                  <View style={[s.nameCell, { borderColor: t.border }]}>
                    <Text style={[s.playerName, { color: t.text }]} numberOfLines={1}>
                      {isLeading ? "🏆 " : ""}{player.name}
                    </Text>
                  </View>
                  {rounds.map((r) => {
                    const round = game.rounds.find((cr) => cr.roundNumber === r);
                    const pts = round ? getScoreForRound(round, player.id) : undefined;
                    const isCurrent = r === game.currentRound;
                    return (
                      <View key={r} style={[s.roundCell, { backgroundColor: isCurrent ? colors.amberLight : "transparent", borderColor: t.border }]}>
                        {pts !== undefined
                          ? <Text style={[s.scoreText, { color: pts === 0 ? colors.green : t.text }]}>{pts}</Text>
                          : <Text style={{ color: t.muted }}>—</Text>}
                      </View>
                    );
                  })}
                  <View style={[s.totalCell, { backgroundColor: colors.amberLight }]}>
                    <Text style={[s.totalText, { color: colors.amber }]}>{total}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Actions */}
      <View style={[s.footer, { backgroundColor: t.card, borderTopColor: t.border }]}>
        <TouchableOpacity style={s.enterBtn} onPress={() => router.push("/game/enter-scores")} activeOpacity={0.8}>
          <Text style={s.enterBtnText}>Ingresar puntos — {getRoundLabel(game.currentRound)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.finishBtn} onPress={confirmFinish} activeOpacity={0.8}>
          <Text style={{ color: colors.green, fontSize: 15, fontWeight: "600" }}>Finalizar partida</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.abandonBtn} onPress={confirmAbandon}>
          <Text style={{ color: colors.red, fontSize: 15 }}>Abandonar partida</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
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
  finishBtn: { alignItems: "center", paddingVertical: 10 },
  abandonBtn: { alignItems: "center", paddingVertical: 10 },
});
