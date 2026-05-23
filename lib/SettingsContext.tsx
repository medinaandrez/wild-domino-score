import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppSettings, DEFAULT_SETTINGS, loadSettings, saveSettings } from "./settings";
import { getStrings, Strings } from "./i18n";
import { setWidgetLanguage } from "./widgetData";

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
      setWidgetLanguage(s.language);
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
    if (key === "language") setWidgetLanguage(value as AppSettings["language"]);
  }, [settings]);

  const s = useMemo(() => getStrings(settings.language), [settings.language]);

  const value = useMemo(
    () => ({ settings, s, updateSetting, loading }),
    [settings, s, updateSetting, loading]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
