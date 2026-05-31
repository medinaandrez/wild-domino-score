import { Platform } from "react-native";
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
  // Support both a plain array and a versioned payload
  if (Array.isArray(parsed)) return parsed as SavedGame[];
  if (parsed?.games && Array.isArray(parsed.games)) return parsed.games as SavedGame[];
  throw new Error("Formato de archivo no reconocido");
}

// ─── Export ──────────────────────────────────────────────────────────────────

export async function exportAllGames(): Promise<void> {
  const history = await loadHistory();
  await shareJSON(buildPayload(history), `wild-score-historial-${dateTag()}.json`);
}

export async function exportSingleGame(game: SavedGame): Promise<void> {
  await shareJSON(buildPayload([game]), `wild-score-partida-${dateTag()}.json`);
}

async function shareJSON(content: string, filename: string): Promise<void> {
  if (Platform.OS === "web") {
    // Web: trigger a download
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const FileSystem = require("expo-file-system");
  const Sharing = require("expo-sharing");

  const path = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error("compartir_no_disponible");

  await Sharing.shareAsync(path, {
    mimeType: "application/json",
    dialogTitle: filename,
    UTI: "public.json",
  });
}

// ─── Import ──────────────────────────────────────────────────────────────────

export async function importGamesFromFile(): Promise<{ added: number; skipped: number }> {
  if (Platform.OS === "web") {
    return importFromWeb();
  }

  const DocumentPicker = require("expo-document-picker");
  const FileSystem = require("expo-file-system");

  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "public.json", "text/plain"],
    copyToCacheDirectory: true,
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
    input.oncancel = () => reject(new Error("cancelado"));
    input.click();
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dateTag(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
