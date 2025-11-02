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

// ---- Base dir an toàn (tránh union string|null) ----
const FS_ANY = FileSystem as any;
const BASE_DIR: string =
  (FS_ANY.documentDirectory as string) ||
  (FS_ANY.cacheDirectory as string) ||
  '';

const DIR = (BASE_DIR.endsWith('/') ? BASE_DIR : BASE_DIR + '/') + 'reports/';
const EXPORT_DIR = (BASE_DIR.endsWith('/') ? BASE_DIR : BASE_DIR + '/') + 'exports/';

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
}

async function ensureExportDir() {
  const info = await FileSystem.getInfoAsync(EXPORT_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(EXPORT_DIR, { intermediates: true });
}

async function loadReports(): Promise<Report[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Report[]; } catch { return []; }
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
    try { await FileSystem.deleteAsync(r.photoUri, { idempotent: true }); } catch {}
  }
}

export async function createReport(
  draft: Omit<Report, 'id' | 'photoUri' | 'createdAt'>,
  imageUri: string
): Promise<Report> {
  await ensureDir();
  const id = Date.now().toString();

  // Lấy phần mở rộng an toàn
  const extMatch = imageUri.match(/\.(\w+)(?:\?|$)/);
  const ext = (extMatch?.[1] ?? 'jpg').toLowerCase();

  const dest = `${DIR}${id}.${ext}`;
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

// ---------------------- Export / Import ----------------------

/** Xuất tất cả reports ra một file JSON và trả về đường dẫn file + số lượng. */
export async function exportReportsToFile(): Promise<{ uri: string; count: number }> {
  await ensureExportDir();
  const data = await loadReports();
  const ts = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const name = `reports-${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;
  const uri = EXPORT_DIR + name;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2), { encoding: FileSystem.EncodingType.UTF8 });
  return { uri, count: data.length };
}

/** Nhập từ file JSON (định dạng cùng cấu trúc Report[]) và merge vào dữ liệu hiện có. */
export async function importReportsFromFile(pickedUri: string): Promise<{ added: number; total: number }> {
  const content = await FileSystem.readAsStringAsync(pickedUri, { encoding: FileSystem.EncodingType.UTF8 });
  let incoming: unknown;
  try {
    incoming = JSON.parse(content);
  } catch {
    throw new Error('File không phải JSON hợp lệ');
  }

  if (!Array.isArray(incoming)) {
    throw new Error('Định dạng không đúng (phải là mảng)');
  }

  // Validate đơn giản
  const ok = (x: any): x is Report =>
    x && typeof x.id === 'string' && typeof x.description === 'string' && typeof x.category === 'string';

  const filtered = (incoming as any[]).filter(ok);
  const current = await loadReports();

  // Merge: ưu tiên mục mới nếu id trùng
  const byId = new Map<string, Report>();
  for (const r of current) byId.set(r.id, r);
  let added = 0;
  for (const r of filtered) {
    if (!byId.has(r.id)) added += 1;
    byId.set(r.id, r);
  }
  const merged = Array.from(byId.values()).sort((a, b) => Number(b.id) - Number(a.id));
  await saveReports(merged);
  return { added, total: merged.length };
}
