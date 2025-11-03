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
  TextInput,
} from 'react-native';
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';

import { spacing, radius } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { listReports, type Report } from '../services/reports';
import { DROP_POINTS_HCM, type DropPoint } from '../data/drop_points';
import { haversineKm, formatKm } from '../utils/geo';

// ----- mock points quanh vị trí -----
type MockPoint = { id: string; name: string; lat: number; lon: number; note?: string };
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

function openExternalMap(lat: number, lon: number, label: string) {
  const latLng = `${lat},${lon}`;
  if (Platform.OS === 'ios') Linking.openURL(`maps://?q=${encodeURIComponent(label)}&ll=${latLng}`);
  else Linking.openURL(`geo:0,0?q=${latLng}(${encodeURIComponent(label)})`);
}

function catColor(cat?: string) {
  switch (cat) {
    case 'rác': return '#2ECC71';
    case 'khói': return '#E67E22';
    case 'nước': return '#3498DB';
    default: return '#F1C40F';
  }
}
function pointColor(p: DropPoint) {
  switch (p.type) {
    case 'recycle': return '#2ECC71';
    case 'hazard':  return '#E74C3C';
    case 'e-waste': return '#8E44AD';
    case 'organic': return '#27AE60';
  }
}

export default function MapScreen() {
  const { colors } = useAppTheme();
  const { coords, loading, granted, request } = useCurrentLocation();
  const mapRef = useRef<MapView>(null);

  // Lớp hiển thị
  const [showMock, setShowMock] = useState(true);
  const [showReal, setShowReal] = useState(true);
  const [showReports, setShowReports] = useState(true);

  // Tìm kiếm & lọc gần
  const [query, setQuery] = useState('');
  const [nearOnly, setNearOnly] = useState(false);
  const RADIUS_KM = 3;

  // Báo cáo đã lưu
  const [reports, setReports] = useState<Report[]>([]);
  const loadReports = useCallback(async () => {
    const data = await listReports();
    setReports(data.filter((r) => r.latitude != null && r.longitude != null));
  }, []);
  useFocusEffect(useCallback(() => { loadReports(); }, [loadReports]));

  // Region khởi tạo
  const initialRegion: Region = useMemo(() => {
    const lat = coords?.latitude ?? 10.8231;
    const lon = coords?.longitude ?? 106.6297;
    return { latitude: lat, longitude: lon, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  }, [coords]);

  const mock = useMemo(() => makeMockDropPoints(initialRegion), [initialRegion]);
  const real = DROP_POINTS_HCM;

  const norm = (s?: string) => (s ?? '').toLowerCase();
  const q = norm(query);

  const within = (lat: number, lon: number) =>
    !nearOnly || !coords ? true : haversineKm(coords, { latitude: lat, longitude: lon }) <= RADIUS_KM;

  const filteredMock = useMemo(
    () => (showMock ? mock.filter(p => (!q || norm(p.name).includes(q)) && within(p.lat, p.lon)) : []),
    [showMock, mock, q, nearOnly, coords]
  );

  const filteredReal = useMemo(
    () =>
      showReal
        ? real.filter(p => {
            const nameOk = !q || norm(p.name).includes(q) || norm(p.address).includes(q ?? '');
            return nameOk && within(p.lat, p.lon);
          })
        : [],
    [showReal, real, q, nearOnly, coords]
  );

  const filteredReports = useMemo(
    () =>
      showReports
        ? reports.filter(r => {
            const nameOk = !q || norm(r.description).includes(q) || norm(r.category).includes(q);
            return nameOk && within(r.latitude!, r.longitude!);
          })
        : [],
    [showReports, reports, q, nearOnly, coords]
  );

  if (loading && !coords) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator />
        <Text style={{ color: colors.subtext }}>Đang lấy vị trí…</Text>
      </View>
    );
  }

  if (granted === false) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Bạn đã từ chối quyền vị trí.</Text>
        <View style={{ height: spacing.md }} />
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={request}>
          <Text style={{ color: colors.bg, fontWeight: '700' }}>Hỏi lại quyền vị trí</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
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

        {/* Mock */}
        {filteredMock.map((p) => {
          const dist =
            coords ? haversineKm(coords, { latitude: p.lat, longitude: p.lon }) : undefined;
          return (
            <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lon }}>
              <Callout onPress={() => openExternalMap(p.lat, p.lon, p.name)}>
                <View style={{ maxWidth: 220 }}>
                  <Text style={{ fontWeight: '700' }}>{p.name}</Text>
                  {dist != null && <Text>Cách bạn: {formatKm(dist)}</Text>}
                  {p.note ? <Text>{p.note}</Text> : null}
                  <Text style={{ color: '#007AFF', marginTop: 4 }}>Chỉ đường</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {/* Điểm thật */}
        {filteredReal.map((p) => {
          const dist =
            coords ? haversineKm(coords, { latitude: p.lat, longitude: p.lon }) : undefined;
          return (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.lat, longitude: p.lon }}
              pinColor={pointColor(p)}
            >
              <Callout onPress={() => openExternalMap(p.lat, p.lon, p.name)}>
                <View style={{ maxWidth: 240 }}>
                  <Text style={{ fontWeight: '700' }}>{p.name}</Text>
                  {p.address ? <Text>{p.address}</Text> : null}
                  {dist != null && <Text>Cách bạn: {formatKm(dist)}</Text>}
                  {p.note ? <Text>{p.note}</Text> : null}
                  <Text style={{ color: '#007AFF', marginTop: 4 }}>Chỉ đường</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {/* Báo cáo của tôi */}
        {filteredReports.map((r) => {
          const dist =
            coords ? haversineKm(coords, { latitude: r.latitude!, longitude: r.longitude! }) : undefined;
          const title = r.description || r.category.toUpperCase();
          return (
            <Marker
              key={r.id}
              coordinate={{ latitude: r.latitude!, longitude: r.longitude! }}
              pinColor={catColor(r.category)}
            >
              <Callout onPress={() => openExternalMap(r.latitude!, r.longitude!, 'Báo cáo')}>
                <View style={{ maxWidth: 240 }}>
                  <Text style={{ fontWeight: '700' }}>{title}</Text>
                  {dist != null && <Text>Cách bạn: {formatKm(dist)}</Text>}
                  <Text style={{ color: '#007AFF', marginTop: 4 }}>Chỉ đường</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Nút về vị trí hiện tại */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.card, borderColor: colors.outline }]}
        onPress={() => {
          const lat = coords?.latitude ?? initialRegion.latitude;
          const lon = coords?.longitude ?? initialRegion.longitude;
          mapRef.current?.animateToRegion(
            { latitude: lat, longitude: lon, latitudeDelta: 0.02, longitudeDelta: 0.02 },
            600
          );
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16 }}>◎</Text>
      </TouchableOpacity>

      {/* Ô TÌM KIẾM */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm theo tên điểm hoặc mô tả…"
          placeholderTextColor={colors.subtext}
          style={{ color: colors.text, paddingVertical: 8 }}
        />
      </View>

      {/* Lọc gần tôi */}
      <View style={[styles.nearPanel, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Gần tôi ≤ {RADIUS_KM} km</Text>
        <Switch value={nearOnly} onValueChange={setNearOnly} />
      </View>

      {/* Bộ lọc lớp */}
      <View style={[styles.legendPanel, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: '#9ca3af' }]} />
          <Text style={[styles.legendLabel, { color: colors.text }]}>Mẫu</Text>
          <Switch value={showMock} onValueChange={setShowMock} />
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: '#2ECC71' }]} />
          <Text style={[styles.legendLabel, { color: colors.text }]}>Điểm thật</Text>
          <Switch value={showReal} onValueChange={setShowReal} />
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: '#F1C40F' }]} />
          <Text style={[styles.legendLabel, { color: colors.text }]}>Báo cáo của tôi</Text>
          <Switch value={showReports} onValueChange={setShowReports} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.xl,
  },

  // Search
  searchBar: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    top: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },

  // Near me
  nearPanel: {
    position: 'absolute',
    left: spacing.xl,
    top: spacing.xl * 3.2,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },

  // Layer switches
  legendPanel: {
    position: 'absolute',
    left: spacing.xl,
    bottom: spacing.xl,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    width: 220,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 },
  dot: { width: 10, height: 10, borderRadius: 999, marginRight: 8 },
  legendLabel: { fontWeight: '700', flex: 1, marginLeft: 8 },

    btn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
});
