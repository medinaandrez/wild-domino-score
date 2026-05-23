import { NativeModules, Platform } from "react-native";
import { Game } from "./types";
import { getDoubleOpener, getRanking } from "./gameLogic";

const { WildDominoLiveActivity } = NativeModules;

function available(): boolean {
  return Platform.OS === "ios" && !!WildDominoLiveActivity;
}

function playersJSON(ranking: ReturnType<typeof getRanking>): string {
  return JSON.stringify(
    ranking.map((r) => ({ name: r.player.name, score: r.total }))
  );
}

export function startLiveActivity(game: Game): void {
  if (!available()) return;
  const ranking = getRanking(game);
  const leader = ranking[0];
  WildDominoLiveActivity.startActivity(
    game.id,
    game.currentRound,
    game.totalRounds,
    getDoubleOpener(game.currentRound),
    leader?.player.name ?? "",
    leader?.total ?? 0,
    playersJSON(ranking)
  );
}

export function updateLiveActivity(game: Game, isFinished = false): void {
  if (!available()) return;
  const ranking = getRanking(game);
  const leader = ranking[0];
  WildDominoLiveActivity.updateActivity(
    game.currentRound,
    game.totalRounds,
    getDoubleOpener(Math.min(game.currentRound, game.totalRounds)),
    leader?.player.name ?? "",
    leader?.total ?? 0,
    playersJSON(ranking),
    isFinished
  );
}

export function endLiveActivity(): void {
  if (!available()) return;
  WildDominoLiveActivity.endActivity();
}
