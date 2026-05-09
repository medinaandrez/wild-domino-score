import { router } from "expo-router";
import { useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useGame } from "@/lib/GameContext";
import { colors, useTheme } from "@/lib/theme";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

export default function NewGameScreen() {
  const { startGame } = useGame();
  const { t } = useTheme();
  const [players, setPlayers] = useState(["", ""]);

  function updatePlayer(i: number, v: string) {
    setPlayers((prev) => prev.map((p, idx) => (idx === i ? v : p)));
  }

  function addPlayer() {
    if (players.length < MAX_PLAYERS) setPlayers((p) => [...p, ""]);
  }

  function removePlayer(i: number) {
    if (players.length > MIN_PLAYERS) setPlayers((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleStart() {
    const names = players.map((p) => p.trim()).filter(Boolean);
    if (names.length < MIN_PLAYERS) {
      Alert.alert("Faltan jugadores", "Ingresa al menos 2 nombres.");
      return;
    }
    if (new Set(names.map((n) => n.toLowerCase())).size !== names.length) {
      Alert.alert("Nombres repetidos", "Cada jugador debe tener un nombre único.");
      return;
    }
    await startGame(names);
    router.replace("/game");
  }

  return (
    <KeyboardAvoidingView style={[s.flex, { backgroundColor: t.bg }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[s.title, { color: t.text }]}>Jugadores</Text>
        <Text style={[s.hint, { color: t.muted }]}>Entre {MIN_PLAYERS} y {MAX_PLAYERS} jugadores</Text>

        {players.map((name, i) => (
          <View key={i} style={s.row}>
            <View style={s.badge}>
              <Text style={s.badgeText}>{i + 1}</Text>
            </View>
            <TextInput
              style={[s.input, { backgroundColor: t.cardAlt, color: t.text }]}
              placeholder={`Jugador ${i + 1}`}
              placeholderTextColor={t.muted}
              value={name}
              onChangeText={(v) => updatePlayer(i, v)}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {players.length > MIN_PLAYERS && (
              <TouchableOpacity style={s.removeBtn} onPress={() => removePlayer(i)}>
                <Text style={s.removeBtnText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {players.length < MAX_PLAYERS && (
          <TouchableOpacity style={[s.addBtn, { borderColor: t.border }]} onPress={addPlayer}>
            <Text style={{ color: colors.amber, fontSize: 18, fontWeight: "600" }}>+ Agregar jugador</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.8}>
          <Text style={s.startBtnText}>¡Comenzar partida!</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  hint: { fontSize: 15, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  badge: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#1e293b", fontWeight: "700", fontSize: 16 },
  input: { flex: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, fontSize: 18 },
  removeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(239,68,68,0.15)", alignItems: "center", justifyContent: "center" },
  removeBtnText: { color: colors.red, fontSize: 22, fontWeight: "700" },
  addBtn: { borderWidth: 2, borderStyle: "dashed", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4 },
  startBtn: { backgroundColor: colors.amber, borderRadius: 18, paddingVertical: 18, alignItems: "center", marginTop: 20 },
  startBtnText: { color: "#1e293b", fontSize: 20, fontWeight: "700" },
});
