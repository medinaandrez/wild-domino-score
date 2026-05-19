import { StyleSheet, Text, View } from "react-native";
import { Game } from "@/lib/types";
import { useTheme } from "@/lib/theme";

const PLAYER_COLORS = [
  "#f59e0b", "#06b6d4", "#22c55e", "#a855f7",
  "#ec4899", "#f97316", "#3b82f6", "#ef4444",
];

const PAD = { top: 12, right: 16, bottom: 24, left: 16 };
const CHART_H = 150;
const DOT_R = 4;

interface Point { x: number; y: number }

function LineSegment({ p1, p2, color }: { p1: Point; p2: Point; color: string }) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  return (
    <View
      style={[
        st.line,
        {
          left: midX - length / 2,
          top: midY - 1,
          width: length,
          backgroundColor: color,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    />
  );
}

export default function ScoreChart({ game, width }: { game: Game; width: number }) {
  const { t } = useTheme();

  const rounds = game.rounds;
  if (rounds.length < 2 || width === 0) return null;

  const chartW = width - PAD.left - PAD.right;
  const chartH = CHART_H - PAD.top - PAD.bottom;

  const seriesData = game.players.map((player) => {
    let cum = 0;
    return rounds.map((round) => {
      const s = round.scores.find((sc) => sc.playerId === player.id);
      cum += s?.points ?? 0;
      return cum;
    });
  });

  const maxScore = Math.max(...seriesData.flat(), 1);

  function xFor(i: number): number {
    return PAD.left + (i / (rounds.length - 1)) * chartW;
  }
  function yFor(score: number): number {
    return PAD.top + (score / maxScore) * chartH;
  }
  function pts(series: number[]): Point[] {
    return series.map((s, i) => ({ x: xFor(i), y: yFor(s) }));
  }

  return (
    <View>
      <View style={{ height: CHART_H }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <View
            key={f}
            style={[
              st.grid,
              {
                top: PAD.top + f * chartH,
                left: PAD.left,
                width: chartW,
                backgroundColor: t.border,
              },
            ]}
          />
        ))}

        {/* Series per player */}
        {game.players.map((player, pi) => {
          const color = PLAYER_COLORS[pi % PLAYER_COLORS.length];
          const points = pts(seriesData[pi]);
          return (
            <View key={player.id} style={StyleSheet.absoluteFill}>
              {points.slice(0, -1).map((p, i) => (
                <LineSegment key={i} p1={p} p2={points[i + 1]} color={color} />
              ))}
              {points.map((p, i) => (
                <View
                  key={i}
                  style={[
                    st.dot,
                    {
                      left: p.x - DOT_R,
                      top: p.y - DOT_R,
                      backgroundColor: color,
                      borderColor: t.bg,
                    },
                  ]}
                />
              ))}
            </View>
          );
        })}

        {/* X axis round labels */}
        {rounds.map((_, i) => (
          <Text
            key={i}
            style={[
              st.xLabel,
              { left: xFor(i) - 8, top: PAD.top + chartH + 5, color: t.muted },
            ]}
          >
            {i + 1}
          </Text>
        ))}
      </View>

      {/* Legend */}
      <View style={st.legend}>
        {game.players.map((player, pi) => (
          <View key={player.id} style={st.legendItem}>
            <View style={[st.legendDot, { backgroundColor: PLAYER_COLORS[pi % PLAYER_COLORS.length] }]} />
            <Text style={[st.legendName, { color: t.text }]} numberOfLines={1}>
              {player.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  line: { position: "absolute", height: 2, borderRadius: 1 },
  dot: { position: "absolute", width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R, borderWidth: 1.5 },
  grid: { position: "absolute", height: StyleSheet.hairlineWidth },
  xLabel: { position: "absolute", fontSize: 10, width: 16, textAlign: "center" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 4, marginTop: 6 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendName: { fontSize: 13, fontWeight: "500" },
});
