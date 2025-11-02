import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';
type ThemeSettings = { mode: ThemeMode; primary: string };

const KEY = 'theme:settings';

const DARK_BASE = {
  bg: '#0B0B0B',
  card: '#151515',
  text: '#FFFFFF',
  subtext: '#A6A6A6',
  outline: '#2E2E2E',
};
const LIGHT_BASE = {
  bg: '#FFFFFF',
  card: '#F7F7F7',
  text: '#0B0B0B',
  subtext: '#5B5B5B',
  outline: '#D7D7D7',
};

function buildColors(settings: ThemeSettings) {
  const base = settings.mode === 'dark' ? DARK_BASE : LIGHT_BASE;
  return { ...base, primary: settings.primary };
}

type Ctx = {
  settings: ThemeSettings;
  colors: ReturnType<typeof buildColors>;
  setMode: (m: ThemeMode) => void;
  setPrimary: (hex: string) => void;
  ready: boolean;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>({ mode: 'dark', primary: '#62E39A' });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setSettings(JSON.parse(raw));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, ready]);

  const colors = useMemo(() => buildColors(settings), [settings]);
  const setMode = (m: ThemeMode) => setSettings((s) => ({ ...s, mode: m }));
  const setPrimary = (hex: string) => setSettings((s) => ({ ...s, primary: hex }));

  const value = useMemo<Ctx>(() => ({ settings, colors, setMode, setPrimary, ready }), [settings, colors]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useAppTheme must be used inside <ThemeProvider>');
  return ctx;
}
