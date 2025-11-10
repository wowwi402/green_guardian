// src/screens/MyReportDetailScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useAppTheme } from '../theme/ThemeProvider';
import { spacing, radius } from '../theme';
import { getReport, deleteReport, type Report } from '../services/reports';

type RouteParams = { id: string };

export default function MyReportDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { colors } = useAppTheme();

  const id: string | undefined = route?.params?.id;
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);

  const dangerText = useMemo(
    () => (colors as any).onDanger ?? colors.onPrimary ?? '#fff',
    [colors]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (!id) {
          Alert.alert('Lỗi', 'Không có ID báo cáo.');
          return;
        }
        const r = await getReport(id);
        if (mounted) setReport(r ?? null);
      } catch (e: any) {
        Alert.alert('Lỗi', e?.message ?? 'Không tải được báo cáo.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onDelete = () => {
    if (!report) return;
    Alert.alert('Xoá báo cáo', 'Bạn chắc chắn muốn xoá báo cáo này?', [
      { text: 'Huỷ' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReport(report.id);
            Alert.alert('Đã xoá', 'Báo cáo đã được xoá.');
            // Quay lại danh sách
            // @ts-ignore
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Lỗi', e?.message ?? 'Không xoá được báo cáo.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator />
        <Text style={{ color: colors.subtext, marginTop: spacing.sm }}>
          Đang tải…
        </Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18 }}>
          Không tìm thấy báo cáo
        </Text>
        <Text style={{ color: colors.subtext, marginTop: spacing.xs }}>
          Có thể báo cáo đã bị xoá hoặc ID không hợp lệ.
        </Text>
      </View>
    );
  }

  const created = new Date(report.createdAt);
  const createdStr = isNaN(created.getTime())
    ? report.createdAt
    : created.toLocaleString();

  return (
    <ScrollView
      style={[styles.wrap, { backgroundColor: colors.bg }]}
      contentContainerStyle={{ padding: spacing.xl }}
    >
      {/* Ảnh */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.outline },
        ]}
      >
        {!!report.photoUri && (
          <Image
            source={{ uri: report.photoUri }}
            style={styles.photo}
            resizeMode="cover"
          />
        )}

        <View style={{ height: spacing.md }} />

        {/* Thông tin cơ bản */}
        <Text style={[styles.h1, { color: colors.text }]}>Chi tiết báo cáo</Text>
        <Text style={[styles.kv, { color: colors.subtext }]}>
          Mã: <Text style={{ color: colors.text }}>{report.id}</Text>
        </Text>
        <Text style={[styles.kv, { color: colors.subtext }]}>
          Thời gian:{' '}
          <Text style={{ color: colors.text }}>
            {createdStr}
          </Text>
        </Text>
        <Text style={[styles.kv, { color: colors.subtext }]}>
          Loại:{' '}
          <Text style={{ color: colors.text }}>{report.category}</Text>
        </Text>

        {typeof report.latitude === 'number' &&
          typeof report.longitude === 'number' && (
            <Text style={[styles.kv, { color: colors.subtext }]}>
              Vị trí:{' '}
              <Text style={{ color: colors.text }}>
                {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
              </Text>
            </Text>
          )}

        <View style={{ height: spacing.sm }} />

        <Text style={[styles.h2, { color: colors.text }]}>Mô tả</Text>
        <Text style={{ color: colors.subtext, lineHeight: 20 }}>
          {report.description || '(Không có mô tả)'}
        </Text>
      </View>

      {/* Hành động */}
      <View style={{ height: spacing.lg }} />

      <View style={styles.btnRow}>
        {/* Xoá */}
        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: colors.danger, flex: 1, marginRight: spacing.sm },
          ]}
          onPress={onDelete}
        >
          <Text style={[styles.btnText, { color: dangerText }]}>Xoá báo cáo</Text>
        </TouchableOpacity>

        {/* Quay lại */}
        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: colors.card, borderColor: colors.outline, borderWidth: 1, flex: 1 },
          ]}
          // @ts-ignore
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.btnText, { color: colors.text }]}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: radius.lg,
  },
  h1: { fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
  h2: { fontSize: 16, fontWeight: '700', marginBottom: spacing.xs },
  kv: { marginTop: spacing.xs },
  btnRow: { flexDirection: 'row' },
  btn: {
    paddingVertical: 14,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontWeight: '700' },
});
