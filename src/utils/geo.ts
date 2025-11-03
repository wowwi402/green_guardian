// src/utils/geo.ts
export type LatLng = { latitude: number; longitude: number };

const RAD = Math.PI / 180;
export function haversineKm(a: LatLng, b: LatLng) {
  const dLat = (b.latitude - a.latitude) * RAD;
  const dLon = (b.longitude - a.longitude) * RAD;
  const lat1 = a.latitude * RAD;
  const lat2 = b.latitude * RAD;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * 6371 * Math.asin(Math.sqrt(h)); // bán kính Trái Đất ~6371km
}

export function formatKm(km: number) {
  if (!isFinite(km)) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
