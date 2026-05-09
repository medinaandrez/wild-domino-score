import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useGame } from "@/lib/GameContext";
import { SPINNER_TILE_VALUE, TOTAL_ROUNDS, getRoundLabel } from "@/lib/gameLogic";
import { RoundScore } from "@/lib/types";
import { colors, useTheme } from "@/lib/theme";

export default function EnterScoresScreen() {
  const { game, submitRound } = useGame();
  const { t } = useTheme();

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
      Alert.alert("Campos incompletos", "Ingresa los puntos de todos los jugadores. El ganador ingresa 0.");
      return;
    }
    const isLastRound = game!.currentRound === TOTAL_ROUNDS;
    const scores: RoundScore[] = game!.players.map((p) => ({
      playerId: p.id,
      points: parseInt(inputs[p.id] || "0", 10) || 0,
    }));
    await submitRound(scores);
    if (isLastRound) {
      router.replace("/results");
    } else {
      router.back();
    }
  }

  return (
    <KeyboardAvoidingView style={[s.flex, { backgroundColor: t.bg }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Round label */}
        <View style={s.roundBanner}>
          <Text style={s.roundTitle}>{getRoundLabel(game.currentRound)}</Text>
          <Text style={s.roundSub}>El ganador de la ronda ingresa 0</Text>
        </View>

        {/* Spinner hint */}
        <View style={[s.hint, { backgroundColor: t.card }]}>
          <Text style={{ fontSize: 22 }}>🃏</Text>
          <Text style={[s.hintText, { color: t.muted }]}>
            Las fichas Spinner que queden en mano valen{" "}
            <Text style={{ fontWeight: "700", color: colors.amber }}>{SPINNER_TILE_VALUE} puntos</Text> cada una.
          </Text>
        </View>

        {/* Player inputs */}
        {game.players.map((player) => (
          <View key={player.id} style={[s.card, { backgroundColor: t.card }]}>
            <Text style={[s.playerName, { color: t.text }]}>{player.name}</Text>
            <View style={s.inputRow}>
              <TextInput
                style={[s.input, { backgroundColor: t.cardAlt, color: t.text }]}
                placeholder="0"
                placeholderTextColor={t.muted}
                value={inputs[player.id]}
                onChangeText={(v) => updateInput(player.id, v)}
                keyboardType="number-pad"
                returnKeyType="done"
              />
              <TouchableOpacity
                style={s.wonBtn}
                onPress={() => setInputs((prev) => ({ ...prev, [player.id]: "0" }))}
              >
                <Text style={{ color: colors.green, fontWeight: "700", fontSize: 15 }}>🏆 Ganó</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={s.confirmBtn} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={s.confirmBtnText}>Confirmar puntos</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
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
