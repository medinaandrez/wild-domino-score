import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from "@/lib/GameContext";
import { useSettings } from "@/lib/SettingsContext";
import {
  getDoubleOpener,
  getRanking, getScoreForRound, isGameOver,
} from "@/lib/gameLogic";
import { colors, useTheme } from "@/lib/theme";
import WebConfirmDialog from "@/components/WebConfirmDialog";
import EditScoreModal from "@/components/EditScoreModal";
import EditPlayerNameModal from "@/components/EditPlayerNameModal";

type PendingConfirm = { message: string; onConfirm: () => void; label: string } | null;
type EditTarget = { roundNumber: number; playerId: string; playerName: string; currentPoints: number } | null;
type EditNameTarget = { playerId: string; currentName: string } | null;

export default function ScoreboardScreen() {
  const { game, undoLastRound, editRoundScore, editPlayerName, finishGame, abandonGame } = useGame();
  const { t } = useTheme();
  const { s } = useSettings();
  const [pending, setPending] = useState<PendingConfirm>(null);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [editValue, setEditValue] = useState("");
  const [editNameTarget, setEditNameTarget] = useState<EditNameTarget>(null);
  const [editNameValue, setEditNameValue] = useState("");

  useEffect(() => {
    if (game && isGameOver(game)) router.replace("/results");
    else if (!game) router.replace("/");
  }, [game]);

  const ranking = useMemo(() => (game ? getRanking(game) : []), [game]);

  if (!game) return null;

  const leader = ranking.length > 0 ? ranking[0].player : null;
  const rounds = Array.from({ length: game.currentRound }, (_, i) => i + 1);

  const sortedPlayers = game.rounds.length > 0
    ? ranking.map((r) => r.player)
    : game.players;

  function webConfirm(message: string, label: string, onConfirm: () => void) {
    setPending({ message, onConfirm, label });
  }

  function confirmUndo() {
    const lastRound = game.rounds[game.rounds.length - 1];
    if (!lastRound) return;
    if (Platform.OS === "web") {
      webConfirm(s.confirmUndoMsg(lastRound.roundNumber), s.undo, () => undoLastRound());
      return;
    }
    Alert.alert(s.confirmUndoTitle, s.confirmUndoMsg(lastRound.roundNumber), [
      { text: s.cancel, style: "cancel" },
      { text: s.undo, style: "destructive", onPress: async () => { await undoLastRound(); } },
    ]);
  }

  function confirmFinish() {
    if (Platform.OS === "web") {
      webConfirm(s.confirmFinishMsg, s.finish, () => finishGame());
      return;
    }
    Alert.alert(s.confirmFinishTitle, s.confirmFinishMsg, [
      { text: s.cancel, style: "cancel" },
      { text: s.finish, style: "destructive", onPress: async () => { await finishGame(); } },
    ]);
  }

  function confirmAbandon() {
    if (Platform.OS === "web") {
      webConfirm(s.confirmAbandonMsg, s.exit, () => { abandonGame(); router.replace("/"); });
      return;
    }
    Alert.alert(s.confirmAbandonTitle, s.confirmAbandonMsg, [
      { text: s.cancel, style: "cancel" },
      { text: s.exit, style: "destructive", onPress: async () => { await abandonGame(); router.replace("/"); } },
    ]);
  }

  const currentLabel = s.roundLabel(game.currentRound, getDoubleOpener(game.currentRound));

  return (
    <View style={[st.flex, { backgroundColor: t.bg }]}>

      {/* Custom web confirm dialog */}
      <WebConfirmDialog
        visible={!!pending}
        message={pending?.message ?? ""}
        confirmLabel={pending?.label ?? ""}
        cancelLabel={s.cancel}
        onConfirm={() => { pending?.onConfirm(); setPending(null); }}
        onCancel={() => setPending(null)}
        t={t}
      />

      {/* Edit score modal */}
      <EditScoreModal
        visible={!!editTarget}
        roundNumber={editTarget?.roundNumber ?? 0}
        playerName={editTarget?.playerName ?? ""}
        value={editValue}
        onChangeValue={setEditValue}
        onSave={() => {
          const pts = parseInt(editValue, 10);
          if (!isNaN(pts) && editTarget) editRoundScore(editTarget.roundNumber, editTarget.playerId, pts);
          setEditTarget(null);
        }}
        onCancel={() => setEditTarget(null)}
        saveLabel={s.save}
        cancelLabel={s.cancel}
        title={editTarget ? s.editRoundTitle(editTarget.roundNumber, editTarget.playerName) : ""}
        hint={s.editRoundLabel}
        t={t}
      />

      {/* Edit player name modal */}
      <EditPlayerNameModal
        visible={!!editNameTarget}
        value={editNameValue}
        onChangeValue={setEditNameValue}
        onSave={() => {
          if (editNameValue.trim() && editNameTarget) editPlayerName(editNameTarget.playerId, editNameValue);
          setEditNameTarget(null);
        }}
        onCancel={() => setEditNameTarget(null)}
        saveLabel={s.save}
        cancelLabel={s.cancel}
        title={s.editPlayerNameTitle}
        hint={s.editPlayerNameLabel}
        t={t}
      />

      {/* Round header */}
      <View style={st.roundHeader}>
        <Text style={st.roundTitle}>{currentLabel}</Text>
        <Text style={st.roundSub}>{s.roundOf(game.currentRound, game.totalRounds)}</Text>
      </View>

      {/* Leader banner — only show after at least one round is played */}
      {leader && game.rounds.length > 0 && (
        <View style={st.leaderBanner}>
          <Text style={{ color: colors.green, fontSize: 15, fontWeight: "600" }}>
            {s.leading(leader.name, ranking[0].total)}
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
              const total = ranking.find((r) => r.player.id === player.id)?.total ?? 0;
              const isLeading = leader?.id === player.id;
              return (
                <View key={player.id} style={[st.tableRow, { backgroundColor: isLeading ? colors.greenLight : "transparent", borderBottomColor: t.border, borderBottomWidth: 1 }]}>
                  <TouchableOpacity
                    style={[st.nameCell, { borderColor: t.border }]}
                    onLongPress={() => { setEditNameValue(player.name); setEditNameTarget({ playerId: player.id, currentName: player.name }); }}
                    activeOpacity={0.7}
                    delayLongPress={500}
                  >
                    <Text style={[st.playerName, { color: t.text }]} numberOfLines={1}>
                      {isLeading ? "🏆 " : ""}{player.name}
                    </Text>
                    <Text style={{ fontSize: 9, color: t.muted, marginTop: 2 }}>✏️</Text>
                  </TouchableOpacity>
                  {rounds.map((r) => {
                    const round = game.rounds.find((cr) => cr.roundNumber === r);
                    const pts = round ? getScoreForRound(round, player.id) : undefined;
                    const isCurrent = r === game.currentRound;
                    const isEditable = pts !== undefined;
                    return (
                      <TouchableOpacity
                        key={r}
                        style={[st.roundCell, { backgroundColor: isCurrent ? colors.amberLight : "transparent", borderColor: t.border }]}
                        onPress={() => {
                          if (!isEditable) return;
                          setEditValue(String(pts));
                          setEditTarget({ roundNumber: r, playerId: player.id, playerName: player.name, currentPoints: pts! });
                        }}
                        activeOpacity={isEditable ? 0.6 : 1}
                      >
                        {pts !== undefined
                          ? <Text style={[st.scoreText, { color: pts === 0 ? colors.green : t.text }]}>{pts}</Text>
                          : <Text style={{ color: t.muted }}>—</Text>}
                        {isEditable && <Text style={{ fontSize: 8, color: t.muted, marginTop: 2 }}>✏️</Text>}
                      </TouchableOpacity>
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
  roundTitle: { color: colors.onAmber, fontSize: 22, fontWeight: "900" },
  roundSub: { color: colors.onAmberSub, fontSize: 13, marginTop: 2, opacity: 0.8 },
  leaderBanner: { backgroundColor: colors.greenLight, paddingHorizontal: 20, paddingVertical: 10, alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.greenBg },
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
  enterBtnText: { color: colors.onAmber, fontSize: 17, fontWeight: "700" },
  undoBtn: { alignItems: "center", paddingVertical: 10 },
  finishBtn: { alignItems: "center", paddingVertical: 10 },
  abandonBtn: { alignItems: "center", paddingVertical: 10 },
});
