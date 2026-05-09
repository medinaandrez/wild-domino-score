import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, useTheme } from "@/lib/theme";

const SECTIONS = [
  {
    title: "¿Qué es Spinner?",
    body: "Spinner: The Original Texas Wild Domino Game es una variante de dominó con un set especial de 55 fichas doble-9 más 11 fichas comodín (Spinner). Se juega en exactamente 10 manos.",
  },
  {
    title: "Datos generales",
    body: "• Jugadores: 2 a 8\n• Set: Doble-9 + 11 fichas Spinner (66 fichas en total)\n• Objetivo: Tener la puntuación más baja al final del juego\n• Reparto: Con 2 jugadores, cada uno recibe 14 fichas. Con 3–8 jugadores, cada uno recibe 7 fichas. El resto forma la reserva (boneyard).\n• Spinner: Ficha comodín, equivale a cualquier valor.",
  },
  {
    title: "Inicio de la partida",
    body: "El primer jugador debe colocar el 9|9 o un Double-Spinner (sustituto del 9|9). Si nadie lo tiene, el repartidor roba sucesivamente de la reserva hasta encontrarlo y lo coloca en el centro de la mesa.",
  },
  {
    title: "Desarrollo del juego",
    body: "Cada jugador, en su turno, coloca una ficha acorde al valor en cualquier extremo de la cadena, o un Spinner como comodín. Si no puede, roba una ficha y pasa turno si sigue sin poder jugar.\n\nTras colocar un doble, los siguientes 3 movimientos deben jugarse sobre ese doble (valor coincidente o Spinner). Si no puede, roba una ficha.\n\nDespués de esos 3 movimientos, el siguiente jugador puede jugar en cualquier extremo de la cadena.\n\n💡 Consejo: coloca primero los dobles grandes para bloquear a los demás.",
  },
  {
    title: "Fin de la mano",
    body: "La mano termina cuando un jugador se queda sin fichas. Los demás suman los puntos de las fichas que les quedan:\n\n• Cada pip vale 1 punto\n• Spinner = 10 puntos\n• Double-Spinner = 20 puntos\n\nEjemplo: 7|Spinner = 17 puntos.",
  },
  {
    title: "Inicio de la siguiente mano",
    body: "Igual que al inicio, pero descendiendo:\n\nMano 2 → 8|8 (o Double-Spinner)\nMano 3 → 7|7\nMano 4 → 6|6\n… y así hasta 0|0 en la mano 10.",
  },
  {
    title: "Ganador del juego",
    body: "Al acabar todas las manos, se suman las puntuaciones acumuladas. Gana quien tenga la puntuación total más baja.",
  },
  {
    title: "Acortar el juego (opcional)",
    body: "Para acortar, cada mano comienza automáticamente con el doble correspondiente: primera mano con 9|9; si nadie lo tiene, con 8|8; después 7|7, etc.",
  },
];

const QUICK_REF = [
  ["Jugadores", "2 – 8"],
  ["Manos", "10"],
  ["Fichas Spinner", "10 pts en mano"],
  ["Double-Spinner", "20 pts en mano"],
  ["Objetivo", "Menor puntaje total"],
];

export default function RulesScreen() {
  const { t } = useTheme();

  return (
    <View style={[s.flex, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={{ fontSize: 52, marginBottom: 8 }}>🎲</Text>
          <Text style={s.headerTitle}>Reglas del Spinner</Text>
          <Text style={s.headerSub}>Texas Wild Domino Game</Text>
        </View>

        {SECTIONS.map((sec) => (
          <View key={sec.title} style={[s.card, { backgroundColor: t.card }]}>
            <Text style={[s.cardTitle, { color: t.text }]}>{sec.title}</Text>
            <Text style={[s.cardBody, { color: t.muted }]}>{sec.body}</Text>
          </View>
        ))}

        <View style={[s.card, { backgroundColor: t.card }]}>
          <Text style={[s.cardTitle, { color: t.text }]}>Referencia rápida</Text>
          {QUICK_REF.map(([label, value]) => (
            <View key={label} style={[s.refRow, { borderBottomColor: t.border }]}>
              <Text style={[s.refLabel, { color: t.muted }]}>{label}</Text>
              <Text style={[s.refValue, { color: t.text }]}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
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
