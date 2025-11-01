import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export const CATEGORIES = ['rác', 'khói', 'nước', 'khác'] as const;
export type Category = typeof CATEGORIES[number];

export type Report = {
  id: string;
  description: string;
  category: Category;
  photoUri: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
};

const KEY = 'reports:v1';

// ---- Chọn thư mục gốc an toàn (tránh lỗi TS với union string|null) ----
const FS_ANY = FileSystem as any;
const BASE_DIR: string =
  (FS_ANY.documentDirectory as string) ||
  (FS_ANY.cacheDirectory as string) ||
  ''; // web có thể rỗng; app mobile Expo Go sẽ có giá trị

// Thư mục chứa ảnh báo cáo (đảm bảo có dấu /)
const DIR = (BASE_DIR.endsWith('/') ? BASE_DIR : BASE_DIR + '/') + 'reports/';

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  }
}

async function loadReports(): Promise<Report[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Report[];
  } catch {
    return [];
  }
}

async function saveReports(list: Report[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function listReports(): Promise<Report[]> {
  return loadReports();
}

export async function getReport(id: string): Promise<Report | undefined> {
  const list = await loadReports();
  return list.find((r) => r.id === id);
}

export async function deleteReport(id: string): Promise<void> {
  const list = await loadReports();
  const idx = list.findIndex((r) => r.id === id);
  if (idx >= 0) {
    const [r] = list.splice(idx, 1);
    await saveReports(list);
    try {
      await FileSystem.deleteAsync(r.photoUri, { idempotent: true });
    } catch {}
  }
}

export async function createReport(
  draft: Omit<Report, 'id' | 'photoUri' | 'createdAt'>,
  imageUri: string
): Promise<Report> {
  await ensureDir();
  const id = Date.now().toString();

  // Lấy đuôi ảnh an toàn (URI có thể không có đuôi)
  const extMatch = imageUri.match(/\.(\w+)(?:\?|$)/);
  const ext = (extMatch?.[1] ?? 'jpg').toLowerCase();

  const dest = `${DIR}${id}.${ext}`;

  // copy ảnh từ cache ImagePicker sang thư mục app (bền)
  await FileSystem.copyAsync({ from: imageUri, to: dest });

  const report: Report = {
    id,
    description: draft.description,
    category: draft.category,
    photoUri: dest,
    latitude: draft.latitude,
    longitude: draft.longitude,
    createdAt: new Date().toISOString(),
  };

  const list = await loadReports();
  list.unshift(report);
  await saveReports(list);
  return report;
}
