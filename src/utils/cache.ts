import AsyncStorage from '@react-native-async-storage/async-storage';

type CacheBox<T> = { value: T; expiresAt: number };

export async function setCache<T>(key: string, value: T, ttlMs: number) {
  const box: CacheBox<T> = { value, expiresAt: Date.now() + ttlMs };
  await AsyncStorage.setItem(key, JSON.stringify(box));
}

export async function getCache<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    const box = JSON.parse(raw) as CacheBox<T>;
    if (box.expiresAt > Date.now()) return box.value as T;
    // hết hạn → xoá
    await AsyncStorage.removeItem(key);
    return null;
  } catch {
    await AsyncStorage.removeItem(key);
    return null;
  }
}
