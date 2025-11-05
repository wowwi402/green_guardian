// src/auth/AuthProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut as fbSignOut, User } from 'firebase/auth';
import { auth } from '../services/firebase';

type AuthContextShape = {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextShape | null>(null);

// Lưu trạng thái khách trên máy
const GUEST_KEY = 'gg:guest:v1';

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [guestLoaded, setGuestLoaded] = useState(false);

  // Load cờ "khách" từ AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(GUEST_KEY);
        setIsGuest(v === '1');
      } finally {
        setGuestLoaded(true);
      }
    })();
  }, []);

  // Lắng nghe trạng thái Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      // Nếu đã đăng nhập thật → tắt chế độ khách
      if (u && isGuest) {
        setIsGuest(false);
        AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
      }
    });
    return () => unsub();
  }, [isGuest]);

  const signInGuest = async () => {
    setIsGuest(true);
    await AsyncStorage.setItem(GUEST_KEY, '1');
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth); // nếu đang ở guest thì lệnh này không ảnh hưởng
    } catch {
      // ignore
    }
    setIsGuest(false);
    await AsyncStorage.removeItem(GUEST_KEY);
    setUser(null);
  };

  // Chờ tải xong cờ guest + auth init
  const initializing = loading || !guestLoaded;

  return (
    <AuthCtx.Provider
      value={{ user, loading: initializing, isGuest, signInGuest, signOut }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
