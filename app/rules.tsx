import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSettings } from "@/lib/SettingsContext";
import { colors, useTheme } from "@/lib/theme";

export default function RulesScreen() {
  const { t } = useTheme();
  const { s } = useSettings();

  return (
    <View style={[st.flex, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={st.scroll}>
        <View style={st.header}>
          <Text style={{ fontSize: 52, marginBottom: 8 }}>🎲</Text>
          <Text style={st.headerTitle}>{s.rulesHeader}</Text>
          <Text style={st.headerSub}>{s.rulesSubHeader}</Text>
        </View>

        {s.rulesSections.map((sec) => (
          <View key={sec.title} style={[st.card, { backgroundColor: t.card }]}>
            <Text style={[st.cardTitle, { color: t.text }]}>{sec.title}</Text>
            <Text style={[st.cardBody, { color: t.muted }]}>{sec.body}</Text>
          </View>
        ))}

        <View style={[st.card, { backgroundColor: t.card }]}>
          <Text style={[st.cardTitle, { color: t.text }]}>{s.rulesQuickRefTitle}</Text>
          {s.rulesQuickRef.map(([label, value]) => (
            <View key={label} style={[st.refRow, { borderBottomColor: t.border }]}>
              <Text style={[st.refLabel, { color: t.muted }]}>{label}</Text>
              <Text style={[st.refValue, { color: t.text }]}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  header: { backgroundColor: colors.amber, borderRadius: 24, padding: 24, alignItems: "center", marginBottom: 4 },
  headerTitle: { color: "#1e293b", fontSize: 22, fontWeight: "900" },
  headerSub: { color: "#334155", fontSize: 13, marginTop: 4, opacity: 0.8 },
  card: { borderRadius: 18, padding: 18 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  cardBody: { fontSize: 15, lineHeight: 26 },
  refRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  refLabel: { fontSize: 15 },
  refValue: { fontSize: 15, fontWeight: "600" },
});
