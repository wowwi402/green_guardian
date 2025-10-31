import { getCache, setCache } from '../utils/cache';

export type AirSample = {
  timeISO: string;
  pm25?: number; // µg/m³
  o3?: number;   // µg/m³
  provider: 'open-meteo';
};

const TTL_MS = 10 * 60 * 1000;

export async function fetchAirQuality(lat: number, lon: number): Promise<AirSample> {
  const key = `air:${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = await getCache<AirSample>(key);
  if (cached) return cached;

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,ozone&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  const t: string[] = json?.hourly?.time ?? [];
  const pmArr: (number | null)[] = json?.hourly?.pm2_5 ?? [];
  const o3Arr: (number | null)[] = json?.hourly?.ozone ?? [];

  // lấy mẫu mới nhất có dữ liệu
  let idx = t.length - 1;
  while (idx >= 0 && pmArr[idx] == null && o3Arr[idx] == null) idx--;
  if (idx < 0) throw new Error('Không có dữ liệu AQI.');

  const sample: AirSample = {
    timeISO: t[idx],
    pm25: pmArr[idx] ?? undefined,
    o3: o3Arr[idx] ?? undefined,
    provider: 'open-meteo',
  };

  await setCache(key, sample, TTL_MS);
  return sample;
}
