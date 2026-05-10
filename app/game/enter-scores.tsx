import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useGame } from "@/lib/GameContext";
import { useSettings } from "@/lib/SettingsContext";
import { SPINNER_TILE_VALUE } from "@/lib/gameLogic";
import { RoundScore } from "@/lib/types";
import { colors, useTheme } from "@/lib/theme";

export default function EnterScoresScreen() {
  const { game, submitRound } = useGame();
  const { t } = useTheme();
  const { s, settings } = useSettings();

  const [inputs, setInputs] = useState<Record<string, string>>(
    Object.fromEntries(game?.players.map((p) => [p.id, ""]) ?? [])
  );

  useEffect(() => {
    if (!game) router.replace("/");
  }, [game]);

  if (!game) return null;

  function updateInput(id: string, value: string) {
    if (/^\d*$/.test(value)) setInputs((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit() {
    const allFilled = game!.players.every((p) => inputs[p.id].trim() !== "");
    if (!allFilled) {
      Alert.alert(s.incompleteTitle, s.incompleteMsg);
      return;
    }
    const isLastRound = game!.currentRound === game!.totalRounds;
    const scores: RoundScore[] = game!.players.map((p) => ({
      playerId: p.id,
      points: parseInt(inputs[p.id] || "0", 10) || 0,
    }));
    await submitRound(scores);
    if (isLastRound) {
      if (settings.hapticEnabled && Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/results");
    } else {
      if (settings.hapticEnabled && Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.back();
    }
  }

  const roundLabel = s.roundLabel(game.currentRound, game.totalRounds - game.currentRound + 1);

  return (
    <KeyboardAvoidingView style={[st.flex, { backgroundColor: t.bg }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
        {/* Round label */}
        <View style={st.roundBanner}>
          <Text style={st.roundTitle}>{s.roundLabel(game.currentRound, game.totalRounds - game.currentRound)}</Text>
          <Text style={st.roundSub}>{s.roundWinnerNote}</Text>
        </View>

        {/* Spinner hint */}
        <View style={[st.hint, { backgroundColor: t.card }]}>
          <Text style={{ fontSize: 22 }}>🃏</Text>
          <Text style={[st.hintText, { color: t.muted }]}>{s.spinnerNote(SPINNER_TILE_VALUE)}</Text>
        </View>

        {/* Player inputs */}
        {game.players.map((player) => (
          <View key={player.id} style={[st.card, { backgroundColor: t.card }]}>
            <Text style={[st.playerName, { color: t.text }]}>{player.name}</Text>
            <View style={st.inputRow}>
              <TextInput
                style={[st.input, { backgroundColor: t.cardAlt, color: t.text }]}
                placeholder="0"
                placeholderTextColor={t.muted}
                value={inputs[player.id]}
                onChangeText={(v) => updateInput(player.id, v)}
                keyboardType="number-pad"
                returnKeyType="done"
              />
              <TouchableOpacity
                style={st.wonBtn}
                onPress={() => {
                  if (settings.hapticEnabled && Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setInputs((prev) => ({ ...prev, [player.id]: "0" }));
                }}
              >
                <Text style={{ color: colors.green, fontWeight: "700", fontSize: 15 }}>{s.won}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={st.confirmBtn} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={st.confirmBtnText}>{s.confirmPoints}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  roundBanner: { backgroundColor: colors.amber, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 18, alignItems: "center" },
  roundTitle: { color: "#1e293b", fontSize: 20, fontWeight: "900" },
  roundSub: { color: "#334155", fontSize: 13, marginTop: 4, opacity: 0.8 },
  hint: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14 },
  hintText: { flex: 1, fontSize: 14, lineHeight: 22 },
  card: { borderRadius: 18, padding: 16 },
  playerName: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  inputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: { flex: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, fontSize: 26, fontWeight: "700", textAlign: "center" },
  wonBtn: { backgroundColor: colors.greenLight, borderWidth: 1, borderColor: "rgba(34,197,94,0.3)", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16 },
  confirmBtn: { backgroundColor: colors.amber, borderRadius: 18, paddingVertical: 18, alignItems: "center", marginTop: 8 },
  confirmBtnText: { color: "#1e293b", fontSize: 20, fontWeight: "700" },
});
