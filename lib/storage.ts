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
  if (!raw) return null;
  const game = JSON.parse(raw) as Game;
  // Migration: older saves won't have totalRounds
  if (!game.totalRounds) game.totalRounds = 10;
  return game;
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

export async function mergeImportedGames(incoming: SavedGame[]): Promise<{ added: number; skipped: number }> {
  const existing = await loadHistory();
  const existingIds = new Set(existing.map((g) => g.id));
  const fresh = incoming.filter((g) => !existingIds.has(g.id));
  if (fresh.length > 0) {
    const merged = [...fresh, ...existing].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
  }
  return { added: fresh.length, skipped: incoming.length - fresh.length };
}

const FREQUENT_PLAYERS_KEY = "spinner_frequent_players";
const MAX_FREQUENT = 12;

export async function loadFrequentPlayers(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FREQUENT_PLAYERS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function saveFrequentPlayers(names: string[]): Promise<void> {
  try {
    const existing = await loadFrequentPlayers();
    const merged = [...new Set([...names, ...existing])].slice(0, MAX_FREQUENT);
    await AsyncStorage.setItem(FREQUENT_PLAYERS_KEY, JSON.stringify(merged));
  } catch {
    // ignore storage errors
  }
}
