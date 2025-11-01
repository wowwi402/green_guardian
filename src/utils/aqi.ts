// src/utils/aqi.ts

// --- DEMO fallback ---
export function mockAqiFromCoords(lat: number, lon: number) {
  const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233)) % 1;
  const aqi = Math.round(30 + seed * 150); // 30..180
  return { aqi, ...aqiToCategory(aqi) };
}

// --- PM2.5 breakpoints (US-EPA) ---
const PM25_BREAKPOINTS = [
  { cLow: 0.0,   cHigh: 12.0,   iLow: 0,   iHigh: 50 },
  { cLow: 12.1,  cHigh: 35.4,   iLow: 51,  iHigh: 100 },
  { cLow: 35.5,  cHigh: 55.4,   iLow: 101, iHigh: 150 },
  { cLow: 55.5,  cHigh: 150.4,  iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4,  iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 350.4,  iLow: 301, iHigh: 400 },
  { cLow: 350.5, cHigh: 500.4,  iLow: 401, iHigh: 500 },
];

export function aqiFromPm25(pm25: number) {
  const c = Math.max(0, Number(pm25));
  for (const bp of PM25_BREAKPOINTS) {
    if (c >= bp.cLow && c <= bp.cHigh) {
      return Math.round(
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow
      );
    }
  }
  return 500;
}

// --- O3 (µg/m³) xấp xỉ cho fallback ---
const O3_BREAKPOINTS_APPROX = [
  { cLow: 0,   cHigh: 100,  iLow: 0,   iHigh: 50 },
  { cLow: 101, cHigh: 160,  iLow: 51,  iHigh: 100 },
  { cLow: 161, cHigh: 215,  iLow: 101, iHigh: 150 },
  { cLow: 216, cHigh: 265,  iLow: 151, iHigh: 200 },
  { cLow: 266, cHigh: 800,  iLow: 201, iHigh: 300 },
];

export function aqiFromO3Approx(ozoneUg: number) {
  const c = Math.max(0, Number(ozoneUg));
  for (const bp of O3_BREAKPOINTS_APPROX) {
    if (c >= bp.cLow && c <= bp.cHigh) {
      return Math.round(
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow
      );
    }
  }
  return 300;
}

export function aqiToCategory(aqi: number) {
  if (aqi <= 50)   return { category: 'Tốt',       color: '#2ECC71', advice: 'Không khí trong lành.' };
  if (aqi <= 100)  return { category: 'Trung bình', color: '#F1C40F', advice: 'Nhạy cảm nên cân nhắc.' };
  if (aqi <= 150)  return { category: 'Kém',        color: '#E67E22', advice: 'Hạn chế hoạt động mạnh ngoài trời.' };
  if (aqi <= 200)  return { category: 'Xấu',        color: '#E74C3C', advice: 'Đeo khẩu trang khi ra ngoài.' };
  if (aqi <= 300)  return { category: 'Rất xấu',    color: '#8E44AD', advice: 'Tránh ra ngoài nếu có thể.' };
  return              { category: 'Nguy hại',        color: '#7E0023', advice: 'Ở trong nhà, đóng cửa, lọc không khí.' };
}

export type AqiDetail = {
  aqi: number;
  pollutant: 'pm2_5' | 'o3';
  pm25?: number;
  o3?: number;
};

export function overallAqiFrom({ pm25, o3 }: { pm25?: number; o3?: number }): AqiDetail | null {
  const scores: AqiDetail[] = [];
  if (pm25 != null) scores.push({ aqi: aqiFromPm25(pm25), pollutant: 'pm2_5', pm25 });
  if (o3 != null)   scores.push({ aqi: aqiFromO3Approx(o3), pollutant: 'o3', o3 });
  if (scores.length === 0) return null;
  return scores.sort((a, b) => b.aqi - a.aqi)[0];
}

// default export để ai import kiểu AQI.overallAqiFrom cũng chạy
const AQI = { mockAqiFromCoords, aqiFromPm25, aqiFromO3Approx, aqiToCategory, overallAqiFrom };
export default AQI;
