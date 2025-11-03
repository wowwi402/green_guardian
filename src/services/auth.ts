// src/services/auth.ts
import {
  onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, updateProfile, User
} from 'firebase/auth';
import { auth } from './firebase';

export function listenAuth(cb: (u: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function signUpEmail(email: string, password: string, displayName?: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName) await updateProfile(cred.user, { displayName });
  return cred.user;
}

export async function signInEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function signOutAll() {
  await signOut(auth);
}
