import AsyncStorage from "@react-native-async-storage/async-storage";
import { Game, SavedGame } from "./types";
import { getRanking } from "./gameLogic";

const CURRENT_GAME_KEY = "spinner_current_game";
const HISTORY_KEY = "spinner_history";

export async function saveCurrentGame(game: Game): Promise<void> {
  await AsyncStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game));
}

export async function loadCurrentGame(): Promise<Game | null> {
  const raw = await AsyncStorage.getItem(CURRENT_GAME_KEY);
  return raw ? (JSON.parse(raw) as Game) : null;
}

export async function clearCurrentGame(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_GAME_KEY);
}

export async function loadHistory(): Promise<SavedGame[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? (JSON.parse(raw) as SavedGame[]) : [];
}

export async function saveGameToHistory(game: Game): Promise<void> {
  const history = await loadHistory();
  const ranking = getRanking(game);
  const saved: SavedGame = {
    id: game.id,
    date: game.finishedAt ?? new Date().toISOString(),
    playerNames: game.players.map((p) => p.name),
    winner: ranking[0]?.player.name ?? "",
    finalScores: ranking.map((r) => ({
      name: r.player.name,
      total: r.total,
    })),
  };
  const updated = [saved, ...history];
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
