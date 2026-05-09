import { useColorScheme } from "react-native";

export const colors = {
  amber: "#f59e0b",
  amberLight: "rgba(245,158,11,0.15)",
  cyan: "#06b6d4",
  green: "#22c55e",
  greenLight: "rgba(34,197,94,0.15)",
  red: "#ef4444",
  redLight: "rgba(239,68,68,0.15)",

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
  const isDark = scheme === "dark";
  const t = isDark ? colors.dark : colors.light;
  return { isDark, t };
}
