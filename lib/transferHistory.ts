import { NativeModules, Platform, Share } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

const { WildDominoLiveActivity } = NativeModules;
import { SavedGame } from "./types";
import { loadHistory, mergeImportedGames } from "./storage";

const FILE_VERSION = 1;

interface ExportPayload {
  version: number;
  exportedAt: string;
  games: SavedGame[];
}

function buildPayload(games: SavedGame[]): string {
  const payload: ExportPayload = {
    version: FILE_VERSION,
    exportedAt: new Date().toISOString(),
    games,
  };
  return JSON.stringify(payload, null, 2);
}

const MAX_GAMES = 5000;
const MAX_PLAYERS = 20;
const MAX_STRING_LEN = 200;

function isValidString(v: unknown, maxLen = MAX_STRING_LEN): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= maxLen;
}

function isValidSavedGame(g: unknown): g is SavedGame {
  if (typeof g !== "object" || g === null) return false;
  const game = g as Record<string, unknown>;

  if (!isValidString(game.id)) return false;
  if (typeof game.date !== "string" || isNaN(Date.parse(game.date))) return false;
  if (!isValidString(game.winner)) return false;

  if (!Array.isArray(game.playerNames) || game.playerNames.length === 0 || game.playerNames.length > MAX_PLAYERS) return false;
  if (!game.playerNames.every((n) => isValidString(n))) return false;

  if (!Array.isArray(game.finalScores) || game.finalScores.length === 0 || game.finalScores.length > MAX_PLAYERS) return false;
  if (!game.finalScores.every((s) => {
    if (typeof s !== "object" || s === null) return false;
    const score = s as Record<string, unknown>;
    return isValidString(score.name) && typeof score.total === "number" && Number.isFinite(score.total);
  })) return false;

  return true;
}

function parsePayload(raw: string): SavedGame[] {
  const parsed = JSON.parse(raw);
  const games = Array.isArray(parsed) ? parsed
    : parsed?.games && Array.isArray(parsed.games) ? parsed.games
    : null;

  if (!games) throw new Error("formato_invalido");
  if (games.length === 0 || games.length > MAX_GAMES) throw new Error("formato_invalido");
  if (!games.every(isValidSavedGame)) throw new Error("formato_invalido");

  return games as SavedGame[];
}

// ─── Export ──────────────────────────────────────────────────────────────────

export async function exportAllGames(): Promise<void> {
  const history = await loadHistory();
  if (history.length === 0) throw new Error("sin_partidas");
  await shareJSON(buildPayload(history), `wild-score-historial-${dateTag()}.wildscore`);
}

export async function exportSingleGame(game: SavedGame): Promise<void> {
  await shareJSON(buildPayload([game]), `wild-score-partida-${dateTag()}.wildscore`);
}

async function shareJSON(content: string, filename: string): Promise<void> {
  if (Platform.OS === "web") {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (Platform.OS === "ios") {
    // iOS: write via native Swift module (NSTemporaryDirectory) then share as file
    const path: string = await WildDominoLiveActivity.writeTempFile(content, filename);
    const result = await Share.share({ url: path, title: filename });
    if (result.action === Share.dismissedAction) throw new Error("cancelado");
    return;
  }

  // Android: write to cache via expo-file-system and share via expo-sharing
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) throw new Error("sin_cache");

  const path = `${cacheDir}${filename}`;
  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path, {
    mimeType: "application/octet-stream",
    dialogTitle: filename,
  });
}

// ─── Import ──────────────────────────────────────────────────────────────────

export async function importGamesFromFile(): Promise<{ added: number; skipped: number }> {
  if (Platform.OS === "web") {
    return importFromWeb();
  }

  // Accept any file — content is validated when we try to parse it
  const result = await DocumentPicker.getDocumentAsync({
    type: ["*/*"],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error("cancelado");
  }

  const uri = result.assets[0].uri;
  const raw = await readFileAsText(uri);
  const games = parsePayload(raw);
  return mergeImportedGames(games);
}

function importFromWeb(): Promise<{ added: number; skipped: number }> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { reject(new Error("cancelado")); return; }
      const text = await file.text();
      try {
        const games = parsePayload(text);
        const result = await mergeImportedGames(games);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    input.click();
  });
}

// ─── Import from URL (AirDrop / file opened externally) ──────────────────────

export async function importFromURL(url: string): Promise<{ added: number; skipped: number }> {
  const raw = await readFileAsText(url);
  const games = parsePayload(raw);
  return mergeImportedGames(games);
}

// ─── File reading helper ──────────────────────────────────────────────────────

async function readFileAsText(uri: string): Promise<string> {
  // Use fetch for file:// URIs — works on iOS and Android without expo-file-system
  if (uri.startsWith("file://") || uri.startsWith("content://")) {
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  }
  // Fallback: expo-file-system for other URI schemes
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dateTag(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
