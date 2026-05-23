import { router } from "expo-router";
import Constants from "expo-constants";
import { Alert, Linking, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "@/lib/SettingsContext";
import { colors, useTheme } from "@/lib/theme";
import { Language, RoundCount } from "@/lib/settings";

const SITE_URL = "https://spinner-scorekeeper.vercel.app";
const REPO_URL = "https://github.com/medinaandrez/wild-domino-score";

const APP_VERSION = Constants.expoConfig?.version ?? "—";

function InlinePicker<T extends string | number>({
  options, value, onChange, t,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  t: ReturnType<typeof useTheme>["t"];
}) {
  return (
    <View style={ip.row}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            style={[
              ip.btn,
              i === 0 && ip.btnFirst,
              i === options.length - 1 && ip.btnLast,
              active ? { backgroundColor: colors.amber } : { backgroundColor: t.cardAlt, borderColor: t.border },
            ]}
            activeOpacity={0.7}
          >
            <Text style={[ip.label, { color: active ? colors.onAmber : t.text }]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const ip = StyleSheet.create({
  row: { flexDirection: "row", marginTop: 10, marginBottom: 4 },
  btn: { flex: 1, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: colors.amber },
  btnFirst: { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  btnLast: { borderTopRightRadius: 10, borderBottomRightRadius: 10 },
  label: { fontSize: 14, fontWeight: "600" },
});

export default function SettingsScreen() {
  const { t } = useTheme();
  const { settings, s, updateSetting } = useSettings();
  const isWeb = Platform.OS === "web";

  function pickLanguage() {
    Alert.alert(s.languageLabel, undefined, [
      { text: s.langEs, onPress: () => updateSetting("language", "es" as Language) },
      { text: s.langEn, onPress: () => updateSetting("language", "en" as Language) },
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

  const langValue = settings.language === "es" ? s.langEs : s.langEn;
  const roundsValue = s.roundsHint(settings.rounds);

  return (
    <View style={[st.flex, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={st.scroll}>

        {/* Preferences */}
        <Text style={[st.sectionTitle, { color: t.muted }]}>{s.preferencesSection.toUpperCase()}</Text>
        <View style={[st.group, { backgroundColor: t.card, borderColor: t.border }]}>

          {/* Language */}
          {isWeb ? (
            <View style={[st.row, { flexDirection: "column", alignItems: "flex-start" }]}>
              <Text style={[st.rowLabel, { color: t.text }]}>{s.languageLabel}</Text>
              <InlinePicker
                t={t}
                value={settings.language}
                onChange={(v) => updateSetting("language", v as Language)}
                options={[
                  { label: s.langEs, value: "es" as Language },
                  { label: s.langEn, value: "en" as Language },
                ]}
              />
            </View>
          ) : (
            <TouchableOpacity style={st.row} onPress={pickLanguage} activeOpacity={0.7}>
              <Text style={[st.rowLabel, { color: t.text }]}>{s.languageLabel}</Text>
              <View style={st.rowRight}>
                <Text style={[st.rowValue, { color: t.muted }]}>{langValue}</Text>
                <Text style={[st.chevron, { color: t.muted }]}>›</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={[st.divider, { backgroundColor: t.border }]} />

          {/* Rounds */}
          {isWeb ? (
            <View style={[st.row, { flexDirection: "column", alignItems: "flex-start" }]}>
              <Text style={[st.rowLabel, { color: t.text }]}>{s.roundsLabel}</Text>
              <InlinePicker
                t={t}
                value={settings.rounds}
                onChange={(v) => updateSetting("rounds", v as RoundCount)}
                options={[
                  { label: s.rounds5, value: 5 as RoundCount },
                  { label: s.rounds7, value: 7 as RoundCount },
                  { label: s.rounds10, value: 10 as RoundCount },
                ]}
              />
            </View>
          ) : (
            <TouchableOpacity style={st.row} onPress={pickRounds} activeOpacity={0.7}>
              <Text style={[st.rowLabel, { color: t.text }]}>{s.roundsLabel}</Text>
              <View style={st.rowRight}>
                <Text style={[st.rowValue, { color: t.muted }]}>{roundsValue}</Text>
                <Text style={[st.chevron, { color: t.muted }]}>›</Text>
              </View>
            </TouchableOpacity>
          )}

          {!isWeb && (
            <>
              <View style={[st.divider, { backgroundColor: t.border }]} />
              {/* Haptics — only on native */}
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
            </>
          )}
        </View>

        {/* Information */}
        <Text style={[st.sectionTitle, { color: t.muted }]}>{s.informationSection.toUpperCase()}</Text>
        <View style={[st.group, { backgroundColor: t.card, borderColor: t.border }]}>

          <View style={st.row}>
            <Text style={[st.rowLabel, { color: t.text }]}>{s.versionLabel}</Text>
            <Text style={[st.rowValue, { color: t.muted }]}>{APP_VERSION}</Text>
          </View>

          <View style={[st.divider, { backgroundColor: t.border }]} />

          <TouchableOpacity style={st.row} onPress={() => router.push("/rules")} activeOpacity={0.7}>
            <Text style={[st.rowLabel, { color: t.text }]}>{s.rulesLinkLabel}</Text>
            <Text style={[st.chevron, { color: t.muted }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Author */}
        <Text style={[st.sectionTitle, { color: t.muted }]}>{s.authorSection.toUpperCase()}</Text>
        <View style={[st.authorCard, { backgroundColor: t.card, borderColor: t.border }]}>
          {/* Header */}
          <View style={st.authorHeader}>
            <View style={[st.authorIconBox, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
              <Text style={st.authorIcon}>👤</Text>
            </View>
            <View style={st.authorHeaderText}>
              <Text style={[st.authorSectionTitle, { color: t.text }]}>{s.authorSection}</Text>
              <Text style={[st.authorSectionDesc, { color: t.muted }]}>{s.authorSectionDesc}</Text>
            </View>
          </View>

          {/* Name card */}
          <View style={[st.authorNameCard, { backgroundColor: t.bg, borderColor: t.border }]}>
            <Text style={[st.authorName, { color: t.text }]}>{s.authorName}</Text>
            <Text style={[st.authorSubtitle, { color: t.muted }]}>{s.authorSubtitle}</Text>
          </View>

          {/* Buttons */}
          <View style={st.authorButtons}>
            <TouchableOpacity
              style={[st.authorBtn, { backgroundColor: t.bg, borderColor: t.border }]}
              onPress={() => Linking.openURL(SITE_URL)}
              activeOpacity={0.7}
            >
              <Text style={st.authorBtnIcon}>🌐</Text>
              <Text style={[st.authorBtnLabel, { color: t.text }]}>{s.authorViewSite}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[st.authorBtn, { backgroundColor: t.bg, borderColor: t.border }]}
              onPress={() => Linking.openURL(REPO_URL)}
              activeOpacity={0.7}
            >
              <Text style={st.authorBtnIcon}>🔗</Text>
              <Text style={[st.authorBtnLabel, { color: t.text }]}>{s.authorViewProject}</Text>
            </TouchableOpacity>
          </View>
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
  // Author card
  authorCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  authorHeader: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  authorIconBox: { width: 64, height: 64, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  authorIcon: { fontSize: 28 },
  authorHeaderText: { flex: 1, justifyContent: "center", gap: 4 },
  authorSectionTitle: { fontSize: 18, fontWeight: "700" },
  authorSectionDesc: { fontSize: 14, lineHeight: 20 },
  authorNameCard: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, gap: 2 },
  authorName: { fontSize: 18, fontWeight: "700" },
  authorSubtitle: { fontSize: 14 },
  authorButtons: { flexDirection: "row", gap: 10 },
  authorBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 14 },
  authorBtnIcon: { fontSize: 18 },
  authorBtnLabel: { fontSize: 15, fontWeight: "700" },
});
