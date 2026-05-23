import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useGame } from "@/lib/GameContext";
import { useSettings } from "@/lib/SettingsContext";
import { getDoubleOpener, SPINNER_TILE_VALUE } from "@/lib/gameLogic";
import { RoundScore } from "@/lib/types";
import { colors, useTheme } from "@/lib/theme";

const isWeb = Platform.OS === "web";

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
      if (settings.hapticEnabled && !isWeb) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/results");
    } else {
      if (settings.hapticEnabled && !isWeb) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.back();
    }
  }

  const content = (
    <ScrollView
      contentContainerStyle={[st.scroll, isWeb && st.scrollWeb]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={isWeb ? st.webInner : undefined}>
        {/* Round label */}
        <View style={st.roundBanner}>
          <Text style={st.roundTitle}>{s.roundLabel(game.currentRound, getDoubleOpener(game.currentRound))}</Text>
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
            {isWeb ? (
              /* Web: stack vertically to avoid horizontal overflow */
              <View style={st.inputColWeb}>
                <TextInput
                  style={[st.inputWeb, { backgroundColor: t.cardAlt, color: t.text }]}
                  placeholder="0"
                  placeholderTextColor={t.muted}
                  value={inputs[player.id]}
                  onChangeText={(v) => updateInput(player.id, v)}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={st.wonBtnWeb}
                  onPress={() => setInputs((prev) => ({ ...prev, [player.id]: "0" }))}
                >
                  <Text style={{ color: colors.green, fontWeight: "700", fontSize: 15 }}>{s.won}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Native: side by side */
              <View style={st.inputRow}>
                <View style={st.inputWrap}>
                  <TextInput
                    style={[st.input, { backgroundColor: t.cardAlt, color: t.text }]}
                    placeholder="0"
                    placeholderTextColor={t.muted}
                    value={inputs[player.id]}
                    onChangeText={(v) => updateInput(player.id, v)}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                </View>
                <TouchableOpacity
                  style={st.wonBtn}
                  onPress={() => {
                    if (settings.hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setInputs((prev) => ({ ...prev, [player.id]: "0" }));
                  }}
                >
                  <Text style={{ color: colors.green, fontWeight: "700", fontSize: 15 }}>{s.won}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={st.confirmBtn} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={st.confirmBtnText}>{s.confirmPoints}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (isWeb) {
    return <View style={[st.flex, { backgroundColor: t.bg, width: "100%" }]}>{content}</View>;
  }

  return (
    <KeyboardAvoidingView
      style={[st.flex, { backgroundColor: t.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  scrollWeb: { padding: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" as const },
  webInner: {},
  roundBanner: { backgroundColor: colors.amber, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 18, alignItems: "center" },
  roundTitle: { color: colors.onAmber, fontSize: 20, fontWeight: "900" },
  roundSub: { color: colors.onAmberSub, fontSize: 13, marginTop: 4, opacity: 0.8 },
  hint: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14 },
  hintText: { flex: 1, fontSize: 14, lineHeight: 22 },
  card: { borderRadius: 18, padding: 16, marginBottom: 14 },
  playerName: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  // Native layout
  inputRow: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  inputWrap: { flex: 1 },
  input: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, fontSize: 26, fontWeight: "700", textAlign: "center", width: "100%" },
  wonBtn: { backgroundColor: colors.greenLight, borderWidth: 1, borderColor: colors.greenBorder, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, justifyContent: "center", alignItems: "center" },
  // Web layout
  inputColWeb: { gap: 10 },
  inputWeb: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, fontSize: 26, fontWeight: "700", textAlign: "center" as const },
  wonBtnWeb: { backgroundColor: colors.greenLight, borderWidth: 1, borderColor: colors.greenBorder, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  confirmBtn: { backgroundColor: colors.amber, borderRadius: 18, paddingVertical: 18, alignItems: "center", marginTop: 8 },
  confirmBtnText: { color: colors.onAmber, fontSize: 20, fontWeight: "700" },
});
