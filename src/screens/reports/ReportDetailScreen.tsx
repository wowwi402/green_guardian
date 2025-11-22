import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { deleteReport, getReport, type Report } from '../../services/reports';
import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';

type RouteParams = { id: string };

export default function ReportDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { colors } = useAppTheme();
  const [data, setData] = useState<Report | null>(null);

  useEffect(() => {
    (async () => {
      const r = await getReport((route.params as RouteParams).id);
      setData(r ?? null);
    })();
  }, [route.params]);

  const onDelete = async () => {
    if (!data) return;
    Alert.alert('Xoá báo cáo?', 'Hành động không thể hoàn tác.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          await deleteReport(data.id);
          nav.goBack();
        },
      },
    ]);
  };

  if (!data) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Không tìm thấy báo cáo</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg }}>
      <Image source={{ uri: data.photoUri }} style={styles.image} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.h1, { color: colors.text }]}>{data.description || '(Không có mô tả)'}</Text>
        <Text style={{ color: colors.subtext, marginTop: 4 }}>
          {data.category} • {new Date(data.createdAt).toLocaleString()}
        </Text>
        {!!data.latitude && !!data.longitude && (
          <Text style={{ color: colors.subtext, marginTop: 4 }}>
            Vị trí: {data.latitude}, {data.longitude}
          </Text>
        )}
      </View>

      <TouchableOpacity onPress={onDelete} style={[styles.btnDanger, { backgroundColor: '#EF4444' }]}>
        <Text style={{ color: '#fff', fontWeight: '800' }}>Xoá báo cáo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 220, borderRadius: radius.lg, backgroundColor: '#eee' },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  h1: { fontSize: 18, fontWeight: '900' },
  btnDanger: { paddingVertical: 14, borderRadius: radius.xl, alignItems: 'center' },
});
