// src/services/knowledge.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KNOWLEDGE, type KnowledgeArticle } from '../data/knowledge';

const FAV_KEY = 'knowledge:favorites:v1';

export function listAll(): KnowledgeArticle[] {
  return KNOWLEDGE;
}

export function getById(id: string): KnowledgeArticle | undefined {
  return KNOWLEDGE.find(a => a.id === id);
}

export async function getFavorites(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(FAV_KEY);
  if (!raw) return new Set();
  try { return new Set(JSON.parse(raw) as string[]); } catch { return new Set(); }
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const fav = await getFavorites();
  let now: boolean;
  if (fav.has(id)) { fav.delete(id); now = false; }
  else { fav.add(id); now = true; }
  await AsyncStorage.setItem(FAV_KEY, JSON.stringify(Array.from(fav)));
  return now;
}

export async function isFavorite(id: string): Promise<boolean> {
  const fav = await getFavorites();
  return fav.has(id);
}
