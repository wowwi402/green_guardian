import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { spacing } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import AqiCard from '../components/AqiCard';
import * as Aqi from '../utils/aqi';
import { fetchAirQuality } from '../services/air';
import Fab from '../components/Fab';
import { useNavigation } from '@react-navigation/native';

type UIState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; subtitle: string; aqi: number; color: string; category: string; note: string };

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const { granted, loading: locLoading, error: locError, coords, request } = useCurrentLocation();
  const [ui, setUi] = useState<UIState>({ kind: 'idle' });

  const load = useCallback(async () => {
    if (!coords) return;
    try {
      setUi({ kind: 'loading' });
      const sample = await fetchAirQuality(coords.latitude, coords.longitude);
      const best = Aqi.overallAqiFrom({ pm25: sample.pm25, o3: sample.o3 });
      if (!best) throw new Error('Không có số đo hợp lệ.');
      const cat = Aqi.aqiToCategory(best.aqi);

      const subtitle =
        `Nguồn: Open-Meteo • ${new Date(sample.timeISO).toLocaleString()}` +
        (best.pollutant === 'pm2_5' && best.pm25 != null
          ? ` • PM2.5: ${best.pm25.toFixed(1)} µg/m³`
          : best.o3 != null
          ? ` • O₃: ${Math.round(best.o3)} µg/m³ (xấp xỉ)`
          : '');

      setUi({
        kind: 'ready',
        subtitle,
        aqi: best.aqi,
        color: cat.color,
        category: cat.category,
        note: cat.advice,
      });
    } catch (e: any) {
      console.warn('AQI load error:', e);
      setUi({ kind: 'error', message: e?.message ?? 'Lỗi lấy AQI' });
    }
  }, [coords]);

  useEffect(() => {
    if (coords) load();
  }, [coords, load]);

  // Guards vị trí
  if (locLoading && !coords) {
    return (
      <View style={[styles.containerCenter, { backgroundColor: colors.bg }]}>
        <ActivityIndicator />
        <Text style={[styles.text, { color: colors.subtext }]}>Đang lấy vị trí…</Text>
      </View>
    );
  }
  if (granted === false) {
    return (
      <View style={[styles.containerCenter, { backgroundColor: colors.bg }]}>
        <Text style={[styles.text, { color: colors.text }]}>Bạn đã từ chối quyền vị trí.</Text>
        <View style={{ height: spacing.md }} />
        <Button title="Thử hỏi lại quyền" onPress={request} color={colors.primary} />
      </View>
    );
  }
  if (locError) {
    return (
      <View style={[styles.containerCenter, { backgroundColor: colors.bg }]}>
        <Text style={[styles.text, { color: colors.text }]}>Lỗi vị trí: {locError}</Text>
        <View style={{ height: spacing.md }} />
        <Button title="Lấy lại vị trí" onPress={request} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Trang chủ</Text>

      {coords && (
        <Text style={[styles.text, { color: colors.subtext }]}>
          Vị trí hiện tại: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
        </Text>
      )}

      <View style={{ height: spacing.xl }} />

      {ui.kind === 'loading' && (
        <View style={styles.containerCenter}>
          <ActivityIndicator />
          <Text style={[styles.text, { color: colors.subtext }]}>Đang tải AQI…</Text>
        </View>
      )}

      {ui.kind === 'error' && (
        <>
          <Text style={[styles.text, { color: colors.text }]}>
            Không lấy được dữ liệu thật: {ui.message}
          </Text>
          <View style={{ height: spacing.md }} />
          <Button title="Thử tải lại" onPress={load} color={colors.primary} />
          <View style={{ height: spacing.xl }} />
          {coords && (() => {
            const demo = Aqi.mockAqiFromCoords(coords.latitude, coords.longitude);
            return (
              <AqiCard
                title="Chỉ số AQI"
                aqi={demo.aqi}
                category={`${demo.category} (DEMO)`}
                color={demo.color}
                subtitle="Dữ liệu DEMO do không lấy được API"
                note={demo.advice}
              />
            );
          })()}
        </>
      )}

      {ui.kind === 'ready' && (
        <>
          <AqiCard
            title="Chỉ số AQI"
            aqi={ui.aqi}
            category={ui.category}
            color={ui.color}
            subtitle={ui.subtitle}
            note={ui.note}
          />
          <View style={{ height: spacing.md }} />
          <Button title="Làm mới" onPress={load} color={colors.primary} />
        </>
      )}

      {/* Nút nổi tạo báo cáo */}
      <Fab onPress={() => nav.navigate('Reports' as never, { screen: 'ReportCreate' } as never)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  containerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  text: { lineHeight: 20, textAlign: 'left' },
});
