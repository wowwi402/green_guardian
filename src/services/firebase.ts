// src/services/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAIhaxPwwm7fRj3OtyoGFDd_8cRlFZvCEA",
  authDomain: "coffee-spark-ai-barista-9fcfa.firebaseapp.com",
  projectId: "coffee-spark-ai-barista-9fcfa",
  storageBucket: "coffee-spark-ai-barista-9fcfa.firebasestorage.app",
  messagingSenderId: "1003240837217",
  appId: "1:1003240837217:web:f049d6e05928b2d1671a20"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
