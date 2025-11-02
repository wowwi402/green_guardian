// src/screens/MapScreen.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Linking,
  Switch,
} from 'react-native';
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';

import { colors, spacing, radius } from '../theme';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { listReports, type Report } from '../services/reports';
import { DROP_POINTS_HCM, type DropPoint } from '../data/drop_points';

// Kiểu cho điểm DEMO
type MockPoint = { id: string; name: string; lat: number; lon: number; note?: string };

// Tạo vài điểm DEMO quanh vị trí hiện tại để minh họa
function makeMockDropPoints(center: { latitude: number; longitude: number }): MockPoint[] {
  const { latitude, longitude } = center;
  const offsets = [
    { dLat: 0.004, dLon: 0.002, name: 'Điểm thu gom A' },
    { dLat: -0.003, dLon: 0.003, name: 'Điểm thu gom B' },
    { dLat: 0.002, dLon: -0.004, name: 'Điểm thu gom C' },
    { dLat: -0.004, dLon: -0.002, name: 'Điểm thu gom D' },
  ];
  return offsets.map((o, i) => ({
    id: `dp-${i}`,
    name: o.name,
    lat: latitude + o.dLat,
    lon: longitude + o.dLon,
    note: 'Giờ: 8:00–17:00',
  }));
}

// Mở Apple/Google Maps chỉ đường tới điểm (lat, lon)
function openExternalMap(lat: number, lon: number, label: string) {
  const latLng = `${lat},${lon}`;
  if (Platform.OS === 'ios') {
    Linking.openURL(`maps://?q=${encodeURIComponent(label)}&ll=${latLng}`);
  } else {
    Linking.openURL(`geo:0,0?q=${latLng}(${encodeURIComponent(label)})`);
  }
}

// Màu pin cho báo cáo theo danh mục
function catColor(cat?: string) {
  switch (cat) {
    case 'rác':
      return '#2ECC71';
    case 'khói':
      return '#E67E22';
    case 'nước':
      return '#3498DB';
    default:
      return '#F1C40F';
  }
}

// Màu pin cho điểm thu gom thật theo type
function pointColor(p: DropPoint) {
  switch (p.type) {
    case 'recycle':
      return '#2ECC71';
    case 'hazard':
      return '#E74C3C';
    case 'e-waste':
      return '#8E44AD';
    case 'organic':
      return '#27AE60';
  }
}

export default function MapScreen() {
  const { coords, loading, granted, request } = useCurrentLocation();
  const mapRef = useRef<MapView>(null);

  // Bộ lọc
  const [showMock, setShowMock] = useState(true);
  const [showReal, setShowReal] = useState(true);
  const [showReports, setShowReports] = useState(true);

  // Báo cáo đã lưu (có toạ độ)
  const [reports, setReports] = useState<Report[]>([]);

  // Region khởi tạo
  const initialRegion: Region = useMemo(() => {
    const lat = coords?.latitude ?? 10.8231; // HCM mặc định
    const lon = coords?.longitude ?? 106.6297;
    return { latitude: lat, longitude: lon, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  }, [coords]);

  // Dữ liệu điểm
  const mock = useMemo(() => makeMockDropPoints(initialRegion), [initialRegion]);
  const real = DROP_POINTS_HCM; // dữ liệu tĩnh từ file

  // Tải báo cáo khi vào tab bản đồ
  const loadReports = useCallback(async () => {
    const data = await listReports();
    setReports(data.filter((r) => r.latitude != null && r.longitude != null));
  }, []);
  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );

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

        {/* Điểm thu gom MẪU */}
        {showMock &&
          mock.map((p) => (
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

        {/* Điểm thu gom THẬT (từ file dữ liệu) */}
        {showReal &&
          real.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.lat, longitude: p.lon }}
              pinColor={pointColor(p)}
            >
              <Callout onPress={() => openExternalMap(p.lat, p.lon, p.name)}>
                <View style={{ maxWidth: 220 }}>
                  <Text style={{ fontWeight: '700' }}>{p.name}</Text>
                  {p.address ? <Text>{p.address}</Text> : null}
                  {p.note ? <Text>{p.note}</Text> : null}
                  <Text style={{ color: '#007AFF', marginTop: 4 }}>Chỉ đường</Text>
                </View>
              </Callout>
            </Marker>
          ))}

        {/* Các báo cáo đã lưu của tôi */}
        {showReports &&
          reports.map((r) => (
            <Marker
              key={r.id}
              coordinate={{ latitude: r.latitude!, longitude: r.longitude! }}
              pinColor={catColor(r.category)}
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
          mapRef.current?.animateToRegion(
            { latitude: lat, longitude: lon, latitudeDelta: 0.02, longitudeDelta: 0.02 },
            600
          );
        }}
      >
        <Text style={styles.fabText}>◎</Text>
      </TouchableOpacity>

      {/* Bộ lọc lớp: dùng Switch */}
      <View style={styles.legendPanel}>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: '#9ca3af' }]} />
          <Text style={styles.legendLabel}>Mẫu</Text>
          <Switch value={showMock} onValueChange={setShowMock} />
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: '#2ECC71' }]} />
          <Text style={styles.legendLabel}>Điểm thật</Text>
          <Switch value={showReal} onValueChange={setShowReal} />
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: '#F1C40F' }]} />
          <Text style={styles.legendLabel}>Báo cáo của tôi</Text>
          <Switch value={showReports} onValueChange={setShowReports} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.subtext },

  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    backgroundColor: colors.card,
    borderColor: colors.outline,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.xl,
  },
  fabText: { color: colors.text, fontWeight: '900', fontSize: 16 },

  btn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  btnText: { color: colors.bg, fontWeight: '700' },

  // Panel bộ lọc (Switch)
  legendPanel: {
    position: 'absolute',
    left: spacing.xl,
    bottom: spacing.xl,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outline,
    width: 220,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  dot: { width: 10, height: 10, borderRadius: 999, marginRight: 8 },
  legendLabel: { color: colors.text, fontWeight: '700', flex: 1, marginLeft: 8 },
});
