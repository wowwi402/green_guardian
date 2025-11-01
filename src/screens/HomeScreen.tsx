import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { colors, spacing } from '../theme';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import AqiCard from '../components/AqiCard';
import * as Aqi from '../utils/aqi';                 // << dùng namespace import
import { fetchAirQuality } from '../services/air';

type UIState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; subtitle: string; aqi: number; color: string; category: string; note: string };

export default function HomeScreen() {
  const { granted, loading: locLoading, error: locError, coords, request } = useCurrentLocation();
  const [ui, setUi] = useState<UIState>({ kind: 'idle' });

  const load = useCallback(async () => {
    if (!coords) return;
    try {
      setUi({ kind: 'loading' });

      const sample = await fetchAirQuality(coords.latitude, coords.longitude);

      // Tính AQI tổng hợp từ PM2.5/O3
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

  // --- UI quyết định ---
  if (locLoading && !coords) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator />
        <Text style={styles.text}>Đang lấy vị trí…</Text>
      </View>
    );
  }

  if (granted === false) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.text}>Bạn đã từ chối quyền vị trí.</Text>
        <View style={{ height: spacing.md }} />
        <Button title="Thử hỏi lại quyền" onPress={request} />
      </View>
    );
  }

  if (locError) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.text}>Lỗi vị trí: {locError}</Text>
        <View style={{ height: spacing.md }} />
        <Button title="Lấy lại vị trí" onPress={request} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang chủ (Guest)</Text>
      {coords && (
        <Text style={styles.text}>
          Vị trí hiện tại: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
        </Text>
      )}

      <View style={{ height: spacing.xl }} />

      {ui.kind === 'loading' && (
        <View style={styles.containerCenter}>
          <ActivityIndicator />
          <Text style={styles.text}>Đang tải AQI…</Text>
        </View>
      )}

      {ui.kind === 'error' && (
        <>
          <Text style={styles.text}>Không lấy được dữ liệu thật: {ui.message}</Text>
          <View style={{ height: spacing.md }} />
          <Button title="Thử tải lại" onPress={load} />
          <View style={{ height: spacing.xl }} />
          {/* Fallback DEMO */}
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
          <Button title="Làm mới" onPress={load} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  containerCenter: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  text: { color: colors.subtext, lineHeight: 20, textAlign: 'left' },
});
