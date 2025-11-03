// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { listenAuth, signInEmail, signUpEmail, signOutAll } from '../services/auth';

type Ctx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pw: string) => Promise<void>;
  signUp: (email: string, pw: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenAuth(u => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  const signIn = async (email: string, pw: string) => { await signInEmail(email, pw); };
  const signUp = async (email: string, pw: string, name?: string) => { await signUpEmail(email, pw, name); };
  const signOut = async () => { await signOutAll(); };

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
