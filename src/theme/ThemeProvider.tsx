// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';
type ThemeSettings = { mode: ThemeMode; primary: string };

export type ThemeColors = {
  bg: string;
  bgSoft: string;   // nền phụ (thay cho 'surface')
  card: string;
  text: string;
  subtext: string;
  outline: string;

  primary: string;
  onPrimary: string;

  success: string;
  warning: string;
  danger: string;
  info: string;

  link: string;     // màu link
};

const KEY = 'theme:settings';

const LIGHT_BASE: Pick<ThemeColors, 'bg' | 'bgSoft' | 'card' | 'text' | 'subtext' | 'outline'> = {
  bg: '#F6FAF7',
  bgSoft: '#F0F6F2',
  card: '#FFFFFF',
  text: '#0B3D2E',
  subtext: '#667085',
  outline: '#E6EDE8',
};

const DARK_BASE: Pick<ThemeColors, 'bg' | 'bgSoft' | 'card' | 'text' | 'subtext' | 'outline'> = {
  bg: '#0C1A12',
  bgSoft: '#11281C',
  card: '#0F2418',
  text: '#EAF6EF',
  subtext: '#AAC7B7',
  outline: '#1E3A2C',
};

function buildColors(settings: ThemeSettings): ThemeColors {
  const base = settings.mode === 'dark' ? DARK_BASE : LIGHT_BASE;
  const primary = settings.primary;
  const onPrimary = settings.mode === 'dark' ? '#0C1A12' : '#FFFFFF';

  return {
    ...base,

    primary,
    onPrimary,

    // tiện dụng
    success: '#16A34A',
    warning: '#F59E0B',
    danger:  '#E11D48',
    info:    '#0EA5E9',

    link: primary, // có thể đổi thành màu xanh link riêng nếu muốn
  };
}

type Ctx = {
  settings: ThemeSettings;
  colors: ThemeColors;
  setMode: (m: ThemeMode) => void;
  setPrimary: (hex: string) => void;
  ready: boolean;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>({
    mode: 'light',
    primary: '#16A34A',
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ThemeSettings;
          if (parsed?.mode && parsed?.primary) setSettings(parsed);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem(KEY, JSON.stringify(settings)).catch(() => {});
    }
  }, [ready, settings]);

  const colors = useMemo(() => buildColors(settings), [settings]);
  const setMode = (m: ThemeMode) => setSettings(s => ({ ...s, mode: m }));
  const setPrimary = (hex: string) => setSettings(s => ({ ...s, primary: hex }));

  const value = useMemo<Ctx>(
    () => ({ settings, colors, setMode, setPrimary, ready }),
    [settings, colors, ready]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useAppTheme must be used inside <ThemeProvider>');
  return ctx;
}
