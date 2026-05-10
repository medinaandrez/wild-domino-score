import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AppSettings, DEFAULT_SETTINGS, loadSettings, saveSettings } from "./settings";
import { getStrings, Strings } from "./i18n";

interface SettingsContextValue {
  settings: AppSettings;
  s: Strings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  loading: boolean;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const updateSetting = useCallback(async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  }, [settings]);

  const s = getStrings(settings.language);

  return (
    <SettingsContext.Provider value={{ settings, s, updateSetting, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
