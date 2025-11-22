// src/services/reports.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { auth } from './firebase';

export const CATEGORIES = ['rác', 'khói', 'nước', 'khác'] as const;
export type Category = typeof CATEGORIES[number];

export type Report = {
  id: string;
  uid: string;                        // <- thêm để lọc "Báo cáo của tôi"
  description: string;
  category: Category;
  photoUri: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  status?: 'pending' | 'reviewed' | 'resolved';
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

// Helper: uid hiện tại hoặc 'guest'
const currentUid = () => auth?.currentUser?.uid ?? 'guest';

// ---------------------- FS helpers ----------------------
async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
}

async function ensureExportDir() {
  const info = await FileSystem.getInfoAsync(EXPORT_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(EXPORT_DIR, { intermediates: true });
}

// ---------------------- Storage helpers ----------------------
async function loadReportsRaw(): Promise<any[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as any[];
  } catch {
    return [];
  }
}

async function saveReports(list: Report[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

// Chuẩn hoá một item bất kỳ về đúng schema Report
function normalizeReport(x: any): Report | null {
  if (!x || typeof x !== 'object') return null;
  if (typeof x.id !== 'string') return null;
  if (typeof x.description !== 'string') return null;
  if (typeof x.category !== 'string') return null;

  const uid = typeof x.uid === 'string' ? x.uid : currentUid();
  const createdAt =
    typeof x.createdAt === 'string' ? x.createdAt : new Date().toISOString();

  const r: Report = {
    id: x.id,
    uid,
    description: x.description,
    category: x.category,
    photoUri: typeof x.photoUri === 'string' ? x.photoUri : '',
    latitude: typeof x.latitude === 'number' ? x.latitude : undefined,
    longitude: typeof x.longitude === 'number' ? x.longitude : undefined,
    createdAt,
    status: typeof x.status === 'string' ? x.status : 'pending',
  };

  return r.photoUri ? r : null; // bắt buộc có ảnh
}

// Nâng cấp dữ liệu cũ → thêm uid/status nếu thiếu
export async function ensureReportSchema(): Promise<void> {
  const raw = await loadReportsRaw();
  let changed = false;
  const normalized: Report[] = [];

  for (const it of raw) {
    const n = normalizeReport(it);
    if (n) {
      // nếu dữ liệu cũ thiếu uid/status thì sau normalize sẽ được điền
      if (!it.uid || !it.status) changed = true;
      normalized.push(n);
    }
  }

  if (changed) await saveReports(normalized);
}

// ---------------------- Public APIs ----------------------
export async function listReports(): Promise<Report[]> {
  await ensureReportSchema();
  const raw = await loadReportsRaw();
  const list: Report[] = [];
  for (const it of raw) {
    const n = normalizeReport(it);
    if (n) list.push(n);
  }
  // sort mới nhất trước
  return list.sort((a, b) => Number(b.id) - Number(a.id));
}

export async function getReport(id: string): Promise<Report | undefined> {
  const list = await listReports();
  return list.find((r) => r.id === id);
}

export async function deleteReport(id: string): Promise<void> {
  const list = await listReports();
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
  draft: Omit<Report, 'id' | 'photoUri' | 'createdAt' | 'uid' | 'status'>,
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
    uid: currentUid(),                // <- gắn uid
    description: draft.description,
    category: draft.category,
    photoUri: dest,
    latitude: draft.latitude,
    longitude: draft.longitude,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  const list = await listReports();
  list.unshift(report);
  await saveReports(list);
  return report;
}

// ---------------------- Export / Import ----------------------

/** Xuất tất cả reports ra một file JSON và trả về đường dẫn file + số lượng. */
export async function exportReportsToFile(): Promise<{ uri: string; count: number }> {
  await ensureExportDir();
  const data = await listReports();
  const ts = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const name = `reports-${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;
  const uri = EXPORT_DIR + name;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return { uri, count: data.length };
}

/** Nhập từ file JSON (định dạng cùng cấu trúc Report[]) và merge vào dữ liệu hiện có. */
export async function importReportsFromFile(
  pickedUri: string
): Promise<{ added: number; total: number }> {
  const content = await FileSystem.readAsStringAsync(pickedUri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  let incoming: unknown;
  try {
    incoming = JSON.parse(content);
  } catch {
    throw new Error('File không phải JSON hợp lệ');
  }

  if (!Array.isArray(incoming)) {
    throw new Error('Định dạng không đúng (phải là mảng)');
  }

  // Chuẩn hoá từng item
  const filtered: Report[] = [];
  for (const it of incoming as any[]) {
    const n = normalizeReport(it);
    if (n) filtered.push(n);
  }

  // Merge: ưu tiên mục mới nếu id trùng
  const current = await listReports();
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

/** Cập nhật một report (có thể đổi ảnh). */
export async function updateReport(
  id: string,
  patch: Partial<Pick<Report, 'description' | 'category' | 'latitude' | 'longitude' | 'status'>> & {
    photoUri?: string; // nếu muốn thay ảnh
  }
): Promise<Report> {
  const list = await listReports();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error('Không tìm thấy báo cáo');

  let updated: Report = { ...list[idx], ...patch };

  if (patch.photoUri && patch.photoUri !== list[idx].photoUri) {
    // copy ảnh mới vào thư mục app và xoá ảnh cũ
    const extMatch = patch.photoUri.match(/\.(\w+)(?:\?|$)/);
    const ext = (extMatch?.[1] ?? 'jpg').toLowerCase();
    const dest = `${DIR}${id}.${ext}`;

    await ensureDir();
    await FileSystem.copyAsync({ from: patch.photoUri, to: dest });
    try {
      await FileSystem.deleteAsync(list[idx].photoUri, { idempotent: true });
    } catch {}
    updated.photoUri = dest;
  }

  list[idx] = updated;
  await saveReports(list);
  return updated;
}

export async function removeReport(id: string) {
  return deleteReport(id);
}