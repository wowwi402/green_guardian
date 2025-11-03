// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Mode = 'none' | 'guest' | 'user';
type Ctx = {
  mode: Mode;
  loading: boolean;
  continueAsGuest: () => Promise<void>;
  signInMock: () => Promise<void>;   // demo
  signOut: () => Promise<void>;
};

const KEY = 'auth:mode';
const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('none');   
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw === 'guest' || raw === 'user') setMode(raw);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const continueAsGuest = async () => {
    await AsyncStorage.setItem(KEY, 'guest');
    setMode('guest');
  };

  const signInMock = async () => {
    await AsyncStorage.setItem(KEY, 'user');
    setMode('user');
  };

  const signOut = async () => {
    await AsyncStorage.setItem(KEY, 'none');
    setMode('none');
  };

  const value = useMemo(() => ({ mode, loading, continueAsGuest, signInMock, signOut }), [mode, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
