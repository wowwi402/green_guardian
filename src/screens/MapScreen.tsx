import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Linking } from 'react-native';
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../theme';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { listReports, type Report } from '../services/reports';

type DropPoint = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  note?: string;
};

// —— Điểm thu gom mẫu quanh vị trí
function makeMockDropPoints(center: { latitude: number; longitude: number }): DropPoint[] {
  const { latitude, longitude } = center;
  const offsets = [
    { dLat:  0.004, dLon:  0.002, name: 'Điểm thu gom A' },
    { dLat: -0.003, dLon:  0.003, name: 'Điểm thu gom B' },
    { dLat:  0.002, dLon: -0.004, name: 'Điểm thu gom C' },
    { dLat: -0.004, dLon: -0.002, name: 'Điểm thu gom D' },
  ];
  return offsets.map((o, i) => ({
    id: `dp-${i}`,
    name: o.name,
    lat: latitude + o.dLat,
    lon: longitude + o.dLon,
    note: 'Giờ mở cửa: 8:00–17:00',
  }));
}

function openExternalMap(lat: number, lon: number, label: string) {
  const latLng = `${lat},${lon}`;
  if (Platform.OS === 'ios') {
    Linking.openURL(`maps://?q=${encodeURIComponent(label)}&ll=${latLng}`);
  } else {
    Linking.openURL(`geo:0,0?q=${latLng}(${encodeURIComponent(label)})`);
  }
}

// Màu pin theo danh mục báo cáo
function categoryColor(cat?: string) {
  switch (cat) {
    case 'rác':  return '#2ECC71';
    case 'khói': return '#E67E22';
    case 'nước': return '#3498DB';
    default:     return '#F1C40F';
  }
}

export default function MapScreen() {
  const { coords, loading, granted, request } = useCurrentLocation();
  const mapRef = useRef<MapView>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [showDrops, setShowDrops] = useState(true);
  const [showReports, setShowReports] = useState(true);

  const initialRegion: Region = useMemo(() => {
    const lat = coords?.latitude ?? 10.8231;   // HCM mặc định
    const lon = coords?.longitude ?? 106.6297;
    return { latitude: lat, longitude: lon, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  }, [coords]);

  const drops = useMemo(() => makeMockDropPoints(initialRegion), [initialRegion]);

  // Tải báo cáo mỗi khi vào lại tab Bản đồ
  const loadReports = useCallback(async () => {
    const data = await listReports();
    setReports(data.filter(r => r.latitude != null && r.longitude != null));
  }, []);

  useFocusEffect(useCallback(() => { loadReports(); }, [loadReports]));

  if (loading && !coords) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.text}>Đang lấy vị trí…</Text>
      </View>
    );
  }

  if (granted === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Bạn đã từ chối quyền vị trí.</Text>
        <View style={{ height: spacing.md }} />
        <TouchableOpacity style={styles.btn} onPress={request}>
          <Text style={styles.btnText}>Hỏi lại quyền vị trí</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        userInterfaceStyle="dark"
      >
        {/* Vị trí của bạn */}
        {coords && (
          <Marker
            coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
            pinColor={colors.primary}
            title="Vị trí của bạn"
            description="Đang ở đây"
          />
        )}

        {/* Điểm thu gom mẫu */}
        {showDrops && drops.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lon }}>
            <Callout onPress={() => openExternalMap(p.lat, p.lon, p.name)}>
              <View style={{ maxWidth: 200 }}>
                <Text style={{ fontWeight: '700' }}>{p.name}</Text>
                {p.note ? <Text>{p.note}</Text> : null}
                <Text style={{ color: '#007AFF', marginTop: 4 }}>Chỉ đường</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Marker: báo cáo đã lưu */}
        {showReports && reports.map((r) => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.latitude!, longitude: r.longitude! }}
            pinColor={categoryColor(r.category)}
          >
            <Callout onPress={() => openExternalMap(r.latitude!, r.longitude!, 'Báo cáo')}>
              <View style={{ maxWidth: 220 }}>
                <Text style={{ fontWeight: '700' }}>{r.category.toUpperCase()}</Text>
                <Text numberOfLines={3}>{r.description}</Text>
                <Text style={{ color: '#007AFF', marginTop: 4 }}>Chỉ đường</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Nút đưa về vị trí hiện tại */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          const lat = coords?.latitude ?? initialRegion.latitude;
          const lon = coords?.longitude ?? initialRegion.longitude;
          mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 600);
        }}
      >
        <Text style={styles.fabText}>◎</Text>
      </TouchableOpacity>

      {/* Bộ lọc nhanh: bật/tắt marker */}
      <View style={styles.legend}>
        <TouchableOpacity onPress={() => setShowDrops(s => !s)}>
          <Text style={[styles.legendText, { opacity: showDrops ? 1 : 0.4 }]}>• Điểm thu gom</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowReports(s => !s)}>
          <Text style={[styles.legendText, { opacity: showReports ? 1 : 0.4 }]}>• Báo cáo của tôi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.subtext },
  fab: {
    position: 'absolute', right: spacing.xl, bottom: spacing.xl,
    backgroundColor: colors.card, borderColor: colors.outline, borderWidth: 1.5,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.xl,
  },
  fabText: { color: colors.text, fontWeight: '900', fontSize: 16 },
  btn: { backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: radius.lg },
  btnText: { color: colors.bg, fontWeight: '700' },
  legend: {
    position: 'absolute', left: spacing.xl, bottom: spacing.xl,
    backgroundColor: colors.card, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.outline,
  },
  legendText: { color: colors.text, fontWeight: '700', marginVertical: 2 },
});
