import { router } from "expo-router";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Alert } from "react-native";
import { useSettings } from "@/lib/SettingsContext";
import { colors, useTheme } from "@/lib/theme";
import { Language, RoundCount, ThemePref } from "@/lib/settings";

const APP_VERSION = "1.0";

export default function SettingsScreen() {
  const { t, isDark } = useTheme();
  const { settings, s, updateSetting } = useSettings();

  function pickLanguage() {
    Alert.alert(s.languageLabel, undefined, [
      { text: s.langEs, onPress: () => updateSetting("language", "es" as Language) },
      { text: s.langEn, onPress: () => updateSetting("language", "en" as Language) },
      { text: s.cancel, style: "cancel" },
    ]);
  }

  function pickTheme() {
    Alert.alert(s.themeLabel, undefined, [
      { text: s.themeAuto, onPress: () => updateSetting("theme", "auto" as ThemePref) },
      { text: s.themeLight, onPress: () => updateSetting("theme", "light" as ThemePref) },
      { text: s.themeDark, onPress: () => updateSetting("theme", "dark" as ThemePref) },
      { text: s.cancel, style: "cancel" },
    ]);
  }

  function pickRounds() {
    Alert.alert(s.roundsLabel, undefined, [
      { text: s.rounds5, onPress: () => updateSetting("rounds", 5 as RoundCount) },
      { text: s.rounds7, onPress: () => updateSetting("rounds", 7 as RoundCount) },
      { text: s.rounds10, onPress: () => updateSetting("rounds", 10 as RoundCount) },
      { text: s.cancel, style: "cancel" },
    ]);
  }

  const themeValue = settings.theme === "auto" ? s.themeAuto : settings.theme === "light" ? s.themeLight : s.themeDark;
  const langValue = settings.language === "es" ? s.langEs : s.langEn;
  const roundsValue = s.roundsHint(settings.rounds ?? 10);

  return (
    <View style={[st.flex, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={st.scroll}>

        {/* Preferences */}
        <Text style={[st.sectionTitle, { color: t.muted }]}>{s.preferencesSection.toUpperCase()}</Text>
        <View style={[st.group, { backgroundColor: t.card, borderColor: t.border }]}>

          {/* Language */}
          <TouchableOpacity style={st.row} onPress={pickLanguage} activeOpacity={0.7}>
            <Text style={[st.rowLabel, { color: t.text }]}>{s.languageLabel}</Text>
            <View style={st.rowRight}>
              <Text style={[st.rowValue, { color: t.muted }]}>{langValue}</Text>
              <Text style={[st.chevron, { color: t.muted }]}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={[st.divider, { backgroundColor: t.border }]} />

          {/* Theme */}
          <TouchableOpacity style={st.row} onPress={pickTheme} activeOpacity={0.7}>
            <Text style={[st.rowLabel, { color: t.text }]}>{s.themeLabel}</Text>
            <View style={st.rowRight}>
              <Text style={[st.rowValue, { color: t.muted }]}>{themeValue}</Text>
              <Text style={[st.chevron, { color: t.muted }]}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={[st.divider, { backgroundColor: t.border }]} />

          {/* Rounds */}
          <TouchableOpacity style={st.row} onPress={pickRounds} activeOpacity={0.7}>
            <Text style={[st.rowLabel, { color: t.text }]}>{s.roundsLabel}</Text>
            <View style={st.rowRight}>
              <Text style={[st.rowValue, { color: t.muted }]}>{roundsValue}</Text>
              <Text style={[st.chevron, { color: t.muted }]}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={[st.divider, { backgroundColor: t.border }]} />

          {/* Sounds */}
          <View style={st.row}>
            <View style={st.rowLabelBlock}>
              <Text style={[st.rowLabel, { color: t.text }]}>{s.soundsLabel}</Text>
              <Text style={[st.rowHint, { color: t.muted }]}>{s.soundsHint}</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(v) => updateSetting("soundEnabled", v)}
              trackColor={{ false: t.border, true: colors.amber }}
              thumbColor="#fff"
            />
          </View>

          <View style={[st.divider, { backgroundColor: t.border }]} />

          {/* Haptics */}
          <View style={st.row}>
            <View style={st.rowLabelBlock}>
              <Text style={[st.rowLabel, { color: t.text }]}>{s.hapticsLabel}</Text>
              <Text style={[st.rowHint, { color: t.muted }]}>{s.hapticsHint}</Text>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(v) => updateSetting("hapticEnabled", v)}
              trackColor={{ false: t.border, true: colors.amber }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Information */}
        <Text style={[st.sectionTitle, { color: t.muted }]}>{s.informationSection.toUpperCase()}</Text>
        <View style={[st.group, { backgroundColor: t.card, borderColor: t.border }]}>

          {/* Version */}
          <View style={st.row}>
            <Text style={[st.rowLabel, { color: t.text }]}>{s.versionLabel}</Text>
            <Text style={[st.rowValue, { color: t.muted }]}>{APP_VERSION}</Text>
          </View>

          <View style={[st.divider, { backgroundColor: t.border }]} />

          {/* Rules link */}
          <TouchableOpacity style={st.row} onPress={() => router.push("/rules")} activeOpacity={0.7}>
            <Text style={[st.rowLabel, { color: t.text }]}>{s.rulesLinkLabel}</Text>
            <Text style={[st.chevron, { color: t.muted }]}>›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 20, gap: 8, paddingBottom: 40 },
  sectionTitle: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, marginTop: 8, marginBottom: 4, marginLeft: 4 },
  group: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 16 },
  rowLabelBlock: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 16 },
  rowHint: { fontSize: 13, marginTop: 2 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  rowValue: { fontSize: 16 },
  chevron: { fontSize: 22, lineHeight: 26 },
  divider: { height: 1, marginLeft: 18 },
});
