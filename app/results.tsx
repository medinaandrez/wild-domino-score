import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, LayoutChangeEvent, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ScoreChart from "@/components/ScoreChart";
import Animated, {
  FadeInDown, FadeInUp,
  useAnimatedStyle, useSharedValue,
  withDelay, withRepeat, withSequence, withSpring, withTiming,
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import { useGame } from "@/lib/GameContext";
import { useSettings } from "@/lib/SettingsContext";
import { getRanking } from "@/lib/gameLogic";
import { saveGameToHistory } from "@/lib/storage";
import { Game } from "@/lib/types";
import { colors, useTheme } from "@/lib/theme";
import { Strings } from "@/lib/i18n";
import { MEDALS } from "@/lib/constants";
const { width: SW, height: SH } = Dimensions.get("window");

const CONFETTI_COLORS = [
  colors.amber, colors.cyan, colors.green,
  "#a855f7", "#ec4899", "#f97316",
];

const PIECES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * SW,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 7 + Math.random() * 7,
  delay: Math.random() * 600,
  duration: 2000 + Math.random() * 1200,
  rotate: Math.random() * 360,
  isCircle: Math.random() > 0.5,
}));

function ConfettiPiece({ x, color, size, delay, duration, rotate, isCircle }: typeof PIECES[0]) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(0);
  const rot = useSharedValue(rotate);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(SH * 0.75, { duration }));
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(duration - 500, withTiming(0, { duration: 500 })),
    ));
    rot.value = withDelay(delay, withTiming(rotate + 360 * 3, { duration }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rot.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        st.confettiPiece,
        style,
        {
          left: x,
          width: size,
          height: isCircle ? size : size * 1.6,
          backgroundColor: color,
          borderRadius: isCircle ? size : 2,
        },
      ]}
    />
  );
}

function WinnerBanner({ name, label, score }: { name: string; label: string; score: string }) {
  const scale = useSharedValue(0.5);
  const bounce = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 120 });
    bounce.value = withDelay(400, withRepeat(
      withSequence(
        withSpring(1.04, { damping: 8 }),
        withSpring(1, { damping: 8 }),
      ), 3, false
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * bounce.value }],
  }));

  return (
    <Animated.View style={[st.winnerBanner, style]}>
      <Text style={{ fontSize: 52, marginBottom: 6 }}>🏆</Text>
      <Text style={st.winnerName}>{name}</Text>
      <Text style={st.winnerLabel}>{label}</Text>
      <Text style={st.winnerScore}>{score}</Text>
    </Animated.View>
  );
}

function RankingContent({ ranking, game, t, s }: { ranking: ReturnType<typeof getRanking>; game: Game; t: ReturnType<typeof useTheme>["t"]; s: Strings }) {
  const [chartWidth, setChartWidth] = useState(0);
  return (
    <View style={{ backgroundColor: t.bg, padding: 4, gap: 12 }}>
      <WinnerBanner
        name={ranking[0].player.name}
        label={s.wonGame}
        score={`${ranking[0].total} ${s.pts}`}
      />
      <Animated.Text entering={FadeInDown.delay(300).springify()} style={[st.sectionTitle, { color: t.text }]}>
        {s.finalRanking}
      </Animated.Text>
      {ranking.map((item, i) => (
        <Animated.View
          key={item.player.id}
          entering={FadeInDown.delay(400 + i * 100).springify()}
          style={[st.rankCard, { backgroundColor: t.card }]}
        >
          <View style={st.rankLeft}>
            <Text style={st.medal}>{MEDALS[i] ?? `${i + 1}.`}</Text>
            <Text style={[st.rankName, { color: t.text }]}>{item.player.name}</Text>
          </View>
          <Text style={[st.rankScore, { color: i === 0 ? colors.amber : t.muted }]}>{item.total}</Text>
        </Animated.View>
      ))}
      {/* Score progression chart */}
      <Animated.View
        entering={FadeInDown.delay(400 + ranking.length * 100).springify()}
        style={[st.chartCard, { backgroundColor: t.card }]}
        onLayout={(e: LayoutChangeEvent) => setChartWidth(e.nativeEvent.layout.width - 24)}
      >
        <Text style={[st.sectionTitle, { color: t.text, marginBottom: 4 }]}>{s.scoreProgress}</Text>
        <ScoreChart game={game} width={chartWidth} />
      </Animated.View>
      <Text style={[st.brand, { color: t.muted }]}>{s.brandName}</Text>
    </View>
  );
}

export default function ResultsScreen() {
  const { game, abandonGame } = useGame();
  const { t } = useTheme();
  const { s } = useSettings();
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (!game) router.replace("/");
  }, [game]);

  if (!game) return null;

  const ranking = getRanking(game);
  const winner = ranking[0];

  async function handleSave() {
    if (saved) return;
    await saveGameToHistory(game!);
    setSaved(true);
    Alert.alert(s.savedTitle, s.savedMsg);
  }

  async function handleShare() {
    if (Platform.OS === "web") {
      try {
        if (navigator.share) {
          await navigator.share({ title: s.brandName, text: `${winner.player.name} ${s.wonGame}` });
        } else {
          Alert.alert(s.shareUnavailableTitle, s.shareUnavailableMsg);
        }
      } catch { /* user cancelled */ }
      return;
    }
    if (!viewShotRef.current?.capture) return;
    try {
      setSharing(true);
      const uri = await viewShotRef.current.capture();
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: s.shareResults });
      } else {
        Alert.alert(s.shareUnavailableTitle, s.shareUnavailableMsg);
      }
    } catch {
      Alert.alert(s.shareErrorTitle, s.shareErrorMsg);
    } finally {
      setSharing(false);
    }
  }

  async function handleNewGame() { await abandonGame(); router.replace("/new-game"); }
  async function handleHome() { await abandonGame(); router.replace("/"); }

  return (
    <View style={[st.flex, { backgroundColor: t.bg }]}>

      {/* Confetti layer */}
      <View style={st.confettiContainer} pointerEvents="none">
        {PIECES.map((p) => <ConfettiPiece key={p.id} {...p} />)}
      </View>

      <ScrollView contentContainerStyle={st.scroll}>

        {/* Captured area — ViewShot only on native */}
        {Platform.OS !== "web" ? (
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
            <RankingContent ranking={ranking} game={game} t={t} s={s} />
          </ViewShot>
        ) : (
          <RankingContent ranking={ranking} game={game} t={t} s={s} />
        )}

        {/* Actions */}
        <Animated.View entering={FadeInUp.delay(600).springify()} style={st.actions}>
          <TouchableOpacity style={[st.btn, { backgroundColor: colors.green }]} onPress={handleShare} activeOpacity={0.8} disabled={sharing}>
            <Text style={[st.btnText, { color: "#fff" }]}>{sharing ? s.generatingImage : s.shareResults}</Text>
          </TouchableOpacity>

          {!saved ? (
            <TouchableOpacity style={[st.btn, { backgroundColor: colors.cyan }]} onPress={handleSave} activeOpacity={0.8}>
              <Text style={[st.btnText, { color: "#fff" }]}>{s.saveToHistory}</Text>
            </TouchableOpacity>
          ) : (
            <View style={st.savedBadge}>
              <Text style={{ color: colors.green, fontSize: 17, fontWeight: "600" }}>{s.savedToHistory}</Text>
            </View>
          )}

          <TouchableOpacity style={[st.btn, { backgroundColor: colors.amber }]} onPress={handleNewGame} activeOpacity={0.8}>
            <Text style={[st.btnText, { color: colors.onAmber }]}>{s.newGameBtn}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[st.btn, { backgroundColor: t.card, borderWidth: 1.5, borderColor: t.border }]} onPress={handleHome} activeOpacity={0.75}>
            <Text style={[st.btnText, { color: t.text }]}>{s.goHome}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },
  confettiContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
  confettiPiece: { position: "absolute", top: 0 },
  winnerBanner: { backgroundColor: colors.amber, borderRadius: 24, padding: 28, alignItems: "center" },
  winnerName: { color: colors.onAmber, fontSize: 30, fontWeight: "900" },
  winnerLabel: { color: colors.onAmberSub, fontSize: 17, fontWeight: "600", marginTop: 4 },
  winnerScore: { color: colors.onAmber, fontSize: 40, fontWeight: "900", marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginTop: 4 },
  rankCard: { borderRadius: 18, paddingHorizontal: 20, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rankLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  medal: { fontSize: 30, width: 40, textAlign: "center" },
  rankName: { fontSize: 20, fontWeight: "700" },
  rankScore: { fontSize: 22, fontWeight: "900" },
  chartCard: { borderRadius: 18, padding: 12 },
  brand: { textAlign: "center", fontSize: 13, paddingVertical: 8 },
  actions: { gap: 12, marginTop: 4 },
  btn: { borderRadius: 18, paddingVertical: 18, alignItems: "center" },
  btnText: { fontSize: 20, fontWeight: "700" },
  savedBadge: { backgroundColor: colors.greenLight, borderWidth: 1, borderColor: colors.greenBorder, borderRadius: 18, paddingVertical: 16, alignItems: "center" },
});
