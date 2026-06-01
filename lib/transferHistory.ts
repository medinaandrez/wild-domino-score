import { Platform, Share } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
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

function parsePayload(raw: string): SavedGame[] {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed as SavedGame[];
  if (parsed?.games && Array.isArray(parsed.games)) return parsed.games as SavedGame[];
  throw new Error("formato_invalido");
}

// ─── Export ──────────────────────────────────────────────────────────────────

export async function exportAllGames(): Promise<void> {
  const history = await loadHistory();
  if (history.length === 0) throw new Error("sin_partidas");
  await shareJSON(buildPayload(history), `wild-score-historial-${dateTag()}.json`);
}

export async function exportSingleGame(game: SavedGame): Promise<void> {
  await shareJSON(buildPayload([game]), `wild-score-partida-${dateTag()}.json`);
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

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) throw new Error("sin_cache");

  const path = `${cacheDir}${filename}`;
  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (Platform.OS === "ios") {
    // iOS: Share API supports file URLs natively via UIActivityViewController
    const result = await Share.share({ url: path, title: filename });
    if (result.action === Share.dismissedAction) throw new Error("cancelado");
  } else {
    // Android: use expo-sharing which handles FileProvider content URIs
    await Sharing.shareAsync(path, {
      mimeType: "application/json",
      dialogTitle: filename,
    });
  }
}

// ─── Import ──────────────────────────────────────────────────────────────────

export async function importGamesFromFile(): Promise<{ added: number; skipped: number }> {
  if (Platform.OS === "web") {
    return importFromWeb();
  }

  // Android only supports MIME types; iOS supports both MIME and UTIs
  const types: string[] = Platform.OS === "android"
    ? ["application/json", "text/plain", "*/*"]
    : ["public.json", "application/json", "public.plain-text"];

  const result = await DocumentPicker.getDocumentAsync({
    type: types,
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error("cancelado");
  }

  const uri = result.assets[0].uri;
  const raw = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dateTag(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
