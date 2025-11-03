import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';
type ThemeSettings = { mode: ThemeMode; primary: string };

const KEY = 'theme:settings';

/** Bảng màu semantic (đã tối ưu contrast) */
const LIGHT_BASE = {
  // nền sáng, hơi xanh lá rất nhẹ
  bg: '#F6FAF7',
  surface: '#F9FBF8',
  card: '#FFFFFF',
  text: '#0B3D2E',     // xanh rêu đậm
  subtext: '#667085',  // xám-trung tính
  outline: '#E6EDE8',
};
const DARK_BASE = {
  bg: '#0C1A12',
  surface: '#0F2418',
  card: '#0F2418',
  text: '#EAF6EF',
  subtext: '#AAC7B7',
  outline: '#1E3A2C',
};

function buildColors(settings: ThemeSettings) {
  const base = settings.mode === 'dark' ? DARK_BASE : LIGHT_BASE;
  const primary = settings.primary; // ví dụ: #16A34A
  const onPrimary = settings.mode === 'dark' ? '#0C1A12' : '#FFFFFF';

  return {
    ...base,
    primary,
    onPrimary,
    // thêm vài màu tiện dụng
    success: '#16A34A',
    warning: '#F59E0B',
    danger:  '#E11D48',
    info:    '#0EA5E9',
  };
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
  // 👉 chuyển mặc định sang LIGHT + primary xanh lá hiện đại
  const [settings, setSettings] = useState<ThemeSettings>({ mode: 'light', primary: '#16A34A' });
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
