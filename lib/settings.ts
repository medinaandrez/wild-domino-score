import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "es" | "en";
export type ThemePref = "auto" | "light" | "dark";
export type RoundCount = 5 | 7 | 10;

export interface AppSettings {
  language: Language;
  theme: ThemePref;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  rounds: RoundCount;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: "es",
  theme: "auto",
  soundEnabled: true,
  hapticEnabled: true,
  rounds: 10,
};

const KEY = "spinner_settings";

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}
