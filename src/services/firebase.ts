// src/services/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDYu25YQWz4KP6obgfmzfan8V01c9EXJlo",
  authDomain: "green-guardian-web.firebaseapp.com",
  projectId: "green-guardian-web",
  storageBucket: "green-guardian-web.firebasestorage.app",
  messagingSenderId: "339869409951",
  appId: "1:339869409951:web:183849849300e5c9d738aa",
  measurementId: "G-QGEF3WLCZV"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
