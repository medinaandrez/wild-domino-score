import { useContext } from "react";
import { Platform, useColorScheme } from "react-native";
import { SettingsContext } from "./SettingsContext";

export const colors = {
  amber: "#f59e0b",
  amberLight: "rgba(245,158,11,0.15)",
  cyan: "#06b6d4",
  green: "#22c55e",
  greenLight: "rgba(34,197,94,0.15)",
  greenBorder: "rgba(34,197,94,0.3)",
  greenBg: "rgba(34,197,94,0.2)",
  red: "#ef4444",
  redLight: "rgba(239,68,68,0.15)",
  onAmber: "#1e293b",
  onAmberSub: "#334155",

  dark: {
    bg: "#0f172a",
    surface: "#1e293b",
    card: "#1e293b",
    cardAlt: "#334155",
    border: "#475569",
    text: "#f1f5f9",
    muted: "#94a3b8",
  },
  light: {
    bg: "#f8fafc",
    surface: "#f1f5f9",
    card: "#ffffff",
    cardAlt: "#f1f5f9",
    border: "#cbd5e1",
    text: "#1e293b",
    muted: "#64748b",
  },
};

export function useTheme() {
  const scheme = useColorScheme();
  // Access SettingsContext directly here to avoid a circular dependency
  // (SettingsContext -> theme -> SettingsContext). The context may be null
  // before the provider mounts, so we fall back to "auto".
  const ctx = useContext(SettingsContext);
  const themePref = ctx?.settings?.theme ?? "auto";
  // Web always uses light theme — dark-mode CSS variables are not wired up.
  const isDark = Platform.OS === "web"
    ? false
    : themePref === "auto" ? scheme === "dark" : themePref === "dark";
  const t = isDark ? colors.dark : colors.light;
  return { isDark, t };
}
