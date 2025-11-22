import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
  Platform, Linking, Switch, TextInput, Animated
} from 'react-native';
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { spacing, radius } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { listReports, type Report } from '../services/reports';
import { DROP_POINTS_HCM, type DropPoint } from '../data/drop_points';
import { haversineKm, formatKm } from '../utils/geo';
import MAP_STYLE_CLEAN from '../theme/mapStyle';
import Fab from '../components/Fab';

// ====== Helpers ======
type MockPoint = { id: string; name: string; lat: number; lon: number; note?: string };
function makeMockDropPoints(c: { latitude: number; longitude: number }): MockPoint[] {
  const o = [
    { dLat: 0.004, dLon: 0.002, name: 'Điểm thu gom A' },
    { dLat: -0.003, dLon: 0.003, name: 'Điểm thu gom B' },
    { dLat: 0.002, dLon: -0.004, name: 'Điểm thu gom C' },
    { dLat: -0.004, dLon: -0.002, name: 'Điểm thu gom D' },
  ];
  return o.map((v, i) => ({ id: `dp-${i}`, name: v.name, lat: c.latitude + v.dLat, lon: c.longitude + v.dLon, note: 'Giờ: 8:00–17:00' }));
}
function openExternalMap(lat: number, lon: number, label: string) {
  const latLng = `${lat},${lon}`;
  if (Platform.OS === 'ios') Linking.openURL(`maps://?q=${encodeURIComponent(label)}&ll=${latLng}`);
  else Linking.openURL(`geo:0,0?q=${latLng}(${encodeURIComponent(label)})`);
}
function catColor(cat?: string) {
  switch (cat) {
    case 'rác': return '#16A34A';
    case 'khói': return '#F59E0B';
    case 'nước': return '#0EA5E9';
    default: return '#F59E0B';
  }
}
function pointColor(p: DropPoint) {
  switch (p.type) {
    case 'recycle': return '#16A34A';
    case 'hazard': return '#E11D48';
    case 'e-waste': return '#8B5CF6';
    case 'organic': return '#22C55E';
    default: return '#16A34A'; // ✅ thêm default để không lỗi TS
  }
}

// ====== Small atoms ======
function Chip({ icon, label, active, onPress }: { icon: any; label: string; active?: boolean; onPress?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}
      style={[styles.chip, {
        backgroundColor: active ? colors.primary : colors.card,
        borderColor: active ? colors.primary : colors.outline
      }]}>
      <Ionicons name={icon} size={14} color={active ? colors.onPrimary : colors.text} style={{ marginRight: 6 }} />
      <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '700' }} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}
function ChipSwitch({ icon, label, value, onChange }: { icon: any; label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.outline }]}>
      <Ionicons name={icon} size={14} color={colors.text} style={{ marginRight: 6 }} />
      <Text style={{ color: colors.text, fontWeight: '700', marginRight: 8 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

// ====== Screen ======
type ListItem =
  | { kind: 'mock'; id: string; name: string; lat: number; lon: number; subtitle?: string; distanceKm?: number }
  | { kind: 'real'; id: string; name: string; lat: number; lon: number; subtitle?: string; distanceKm?: number }
  | { kind: 'report'; id: string; name: string; lat: number; lon: number; subtitle?: string; distanceKm?: number; category?: string };

export default function MapScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const { coords, loading, granted, request } = useCurrentLocation();
  const mapRef = useRef<MapView>(null);

  // Layers
  const [showMock, setShowMock] = useState(true);
  const [showReal, setShowReal] = useState(true);
  const [showReports, setShowReports] = useState(true);

  // Filter / sort
  const [query, setQuery] = useState('');
  const [nearOnly, setNearOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');
  const RADIUS_KM = 3;

  const [showLayers, setShowLayers] = useState(false);

  // Reports
  const [reports, setReports] = useState<Report[]>([]);
  const loadReports = useCallback(async () => {
    const data = await listReports();
    setReports(data.filter(r => r.latitude != null && r.longitude != null));
  }, []);
  useFocusEffect(useCallback(() => { loadReports(); }, [loadReports]));

  // Region
  const initialRegion: Region = useMemo(() => {
    const lat = coords?.latitude ?? 10.8231;
    const lon = coords?.longitude ?? 106.6297;
    return { latitude: lat, longitude: lon, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  }, [coords]);

  const mock = useMemo(() => makeMockDropPoints(initialRegion), [initialRegion]);
  const real = DROP_POINTS_HCM;
  const norm = (s?: string) => (s ?? '').toLowerCase();
  const q = norm(query);
  const within = (lat: number, lon: number) => !nearOnly || !coords ? true : haversineKm(coords, { latitude: lat, longitude: lon }) <= RADIUS_KM;

  const filteredMock = useMemo(() => (showMock ? mock.filter(p => (!q || norm(p.name).includes(q)) && within(p.lat, p.lon)) : []),
    [showMock, mock, q, nearOnly, coords]);
  const filteredReal = useMemo(() => showReal ? real.filter(p => {
    const nameOk = !q || norm(p.name).includes(q) || norm(p.address).includes(q);
    return nameOk && within(p.lat, p.lon);
  }) : [], [showReal, real, q, nearOnly, coords]);
  const filteredReports = useMemo(() => showReports ? reports.filter(r => {
    const nameOk = !q || norm(r.description).includes(q) || norm(r.category).includes(q);
    return nameOk && within(r.latitude!, r.longitude!);
  }) : [], [showReports, reports, q, nearOnly, coords]);

  // BottomSheet
  const [sheetOpen, setSheetOpen] = useState(true);
  const sheetAnim = useRef(new Animated.Value(1)).current; // 1 = open
  const toggleSheet = () => {
    const to = sheetOpen ? 0 : 1;
    setSheetOpen(!sheetOpen);
    Animated.spring(sheetAnim, { toValue: to, useNativeDriver: true, friction: 8, tension: 50 }).start();
  };
  const sheetTranslate = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [220, 0] });

  const sheetItems: ListItem[] = useMemo(() => {
    const dist = (lat: number, lon: number) => coords ? haversineKm(coords, { latitude: lat, longitude: lon }) : undefined;
    const items: ListItem[] = [];
    filteredMock.forEach(p => items.push({ kind: 'mock', id: `m-${p.id}`, name: p.name, lat: p.lat, lon: p.lon, subtitle: p.note, distanceKm: dist(p.lat, p.lon) }));
    filteredReal.forEach(p => items.push({ kind: 'real', id: `r-${p.id}`, name: p.name, lat: p.lat, lon: p.lon, subtitle: p.address, distanceKm: dist(p.lat, p.lon) }));
    filteredReports.forEach(r => items.push({ kind: 'report', id: `rp-${r.id}`, name: r.description || r.category.toUpperCase(), lat: r.latitude!, lon: r.longitude!, subtitle: r.category.toUpperCase(), distanceKm: dist(r.latitude!, r.longitude!), category: r.category }));
    if (sortBy === 'distance') items.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
    else items.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    return items;
  }, [filteredMock, filteredReal, filteredReports, sortBy, coords]);

  // Guards
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
          <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>Hỏi lại quyền vị trí</Text>
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
        customMapStyle={MAP_STYLE_CLEAN}
      >
        {/* My location */}
        {coords && (
          <Marker coordinate={{ latitude: coords.latitude, longitude: coords.longitude }} pinColor={colors.primary} title="Vị trí của bạn" />
        )}

        {/* Mock */}
        {filteredMock.map((p) => {
          const d = coords ? haversineKm(coords, { latitude: p.lat, longitude: p.lon }) : undefined;
          return (
            <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lon }}>
              <Callout onPress={() => openExternalMap(p.lat, p.lon, p.name)}>
                <View style={{ maxWidth: 220 }}>
                  <Text style={{ fontWeight: '700' }}>{p.name}</Text>
                  {d != null && <Text>Cách bạn: {formatKm(d)}</Text>}
                  {p.note ? <Text>{p.note}</Text> : null}
                  <Text style={{ color: '#007AFF', marginTop: 4 }}>Chỉ đường</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {/* Real */}
        {filteredReal.map((p) => {
          const d = coords ? haversineKm(coords, { latitude: p.lat, longitude: p.lon }) : undefined;
          return (
            <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lon }} pinColor={pointColor(p)}>
              <Callout onPress={() => openExternalMap(p.lat, p.lon, p.name)}>
                <View style={{ maxWidth: 240 }}>
                  <Text style={{ fontWeight: '700' }}>{p.name}</Text>
                  {p.address ? <Text>{p.address}</Text> : null}
                  {d != null && <Text>Cách bạn: {formatKm(d)}</Text>}
                  {p.note ? <Text>{p.note}</Text> : null}
                  <Text style={{ color: '#007AFF', marginTop: 4 }}>Chỉ đường</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {/* Reports */}
        {filteredReports.map((r) => {
          const d = coords ? haversineKm(coords, { latitude: r.latitude!, longitude: r.longitude! }) : undefined;
          const title = r.description || r.category.toUpperCase();
          return (
            <Marker key={r.id} coordinate={{ latitude: r.latitude!, longitude: r.longitude! }} pinColor={catColor(r.category)}>
              <Callout onPress={() => openExternalMap(r.latitude!, r.longitude!, 'Báo cáo')}>
                <View style={{ maxWidth: 240 }}>
                  <Text style={{ fontWeight: '700' }}>{title}</Text>
                  {d != null && <Text>Cách bạn: {formatKm(d)}</Text>}
                  <Text style={{ color: '#007AFF', marginTop: 4 }}>Chỉ đường</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* ===== Top controls ===== */}
      <View style={styles.topWrap}>
        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.outline }]}>
          <Ionicons name="search" size={16} color={colors.subtext} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm theo tên điểm/địa chỉ/mô tả…"
            placeholderTextColor={colors.subtext}
            style={{ color: colors.text, paddingVertical: 8, flex: 1 }}
          />
        </View>

        {/* Chips row */}
        <View style={styles.chipsRow}>
          <ChipSwitch icon="navigate-outline" label="≤ 3 km" value={nearOnly} onChange={setNearOnly} />
          <Chip icon="layers-outline" label="Lớp" active={showLayers} onPress={() => setShowLayers(v => !v)} />
          <Chip icon="swap-vertical" label={sortBy === 'distance' ? 'Gần nhất' : 'Tên A→Z'} onPress={() => setSortBy(s => s === 'distance' ? 'name' : 'distance')} />
        </View>
      </View>

      {/* Popover LỚP */}
      {showLayers && (
        <View style={[styles.popCard, { backgroundColor: colors.card, borderColor: colors.outline }]}>
          <Row label="Mẫu" dot="#9CA3AF">
            <Switch value={showMock} onValueChange={setShowMock} />
          </Row>
          <Row label="Điểm thật" dot="#16A34A">
            <Switch value={showReal} onValueChange={setShowReal} />
          </Row>
          <Row label="Báo cáo của tôi" dot="#F59E0B">
            <Switch value={showReports} onValueChange={setShowReports} />
          </Row>
        </View>
      )}

      {/* Recenter button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.card, borderColor: colors.outline }]}
        onPress={() => {
          const lat = coords?.latitude ?? initialRegion.latitude;
          const lon = coords?.longitude ?? initialRegion.longitude;
          mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 600);
        }}>
        <Ionicons name="locate" size={18} color={colors.text} />
      </TouchableOpacity>

      {/* FAB tạo báo cáo */}
      <Fab onPress={() => nav.navigate('Reports' as never, { screen: 'ReportCreate' } as never)} />
      {/* BottomSheet list */}
      <Animated.View style={[
        styles.sheet,
        { backgroundColor: colors.card, borderColor: colors.outline, transform: [{ translateY: sheetTranslate }] }
      ]}>
        <TouchableOpacity style={styles.sheetHeader} onPress={toggleSheet} activeOpacity={0.9}>
          <View style={styles.sheetGrabber} />
          <Text style={{ fontWeight: '800', color: colors.text }}>
            Danh sách ({sheetItems.length}) — {sortBy === 'distance' ? 'Gần nhất' : 'Tên A→Z'}
          </Text>
        </TouchableOpacity>

        <View style={{ maxHeight: 220, paddingHorizontal: spacing.md }}>
          {sheetItems.length === 0 ? (
            <Text style={{ color: colors.subtext, textAlign: 'center', paddingVertical: spacing.lg }}>
              Không có điểm nào khớp bộ lọc.
            </Text>
          ) : (
            sheetItems.map((it) => (
              <TouchableOpacity
                key={it.id}
                style={[styles.rowItem, { borderColor: colors.outline }]}
                onPress={() =>
                  mapRef.current?.animateToRegion(
                    { latitude: it.lat, longitude: it.lon, latitudeDelta: 0.01, longitudeDelta: 0.01 },
                    500
                  )
                }
                onLongPress={() => openExternalMap(it.lat, it.lon, it.name)}
              >
                <View style={[styles.bullet, { backgroundColor: it.kind === 'real' ? '#16A34A' : it.kind === 'report' ? '#F59E0B' : '#9CA3AF' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={1}>{it.name}</Text>
                  {!!it.subtitle && <Text style={{ color: colors.subtext }} numberOfLines={1}>{it.subtitle}</Text>}
                </View>
                <Text style={{ color: colors.subtext, marginLeft: spacing.md }}>
                  {it.distanceKm != null ? formatKm(it.distanceKm) : ''}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </Animated.View>
    </View>
  );
}

function Row({ label, dot, children }: { label: string; dot: string; children: React.ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.layerRow}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Top controls
  topWrap: { position: 'absolute', left: spacing.xl, right: spacing.xl, top: spacing.xl },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.lg, borderWidth: 1, paddingHorizontal: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  chipsRow: { flexDirection: 'row', marginTop: spacing.md, gap: 8, alignItems: 'center', flexWrap: 'wrap' },

  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: spacing.md,
    borderRadius: 999, borderWidth: 1,
  },

  // Popover Lớp
  popCard: {
    position: 'absolute', left: spacing.xl, top: spacing.xl * 5.2,
    borderRadius: radius.lg, borderWidth: 1, padding: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  layerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, minWidth: 220 },
  dot: { width: 10, height: 10, borderRadius: 99, marginRight: 8 },

  // Recenter button
  fab: {
    position: 'absolute', right: spacing.xl, bottom: spacing.xl + 230,
    borderWidth: 1.5, paddingVertical: 10, paddingHorizontal: spacing.md,
    borderRadius: radius.xl, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },

  // BottomSheet
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderTopWidth: 1, paddingBottom: spacing.xl, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: -4 }, elevation: 10,
  },
  sheetHeader: { paddingTop: spacing.md, paddingBottom: spacing.md, paddingHorizontal: spacing.md, alignItems: 'center' },
  sheetGrabber: { width: 40, height: 4, borderRadius: 99, backgroundColor: '#0002', marginBottom: 6 },
  rowItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  bullet: { width: 8, height: 8, borderRadius: 99, marginRight: spacing.md },

  btn: { paddingVertical: 10, paddingHorizontal: spacing.md, borderRadius: radius.lg, alignItems: 'center' },
});
