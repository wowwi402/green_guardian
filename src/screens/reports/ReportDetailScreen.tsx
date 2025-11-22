// src/screens/reports/ReportDetailScreen.tsx
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Platform, Linking, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';

import { useAppTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme';
import { getReport, deleteReport } from '../../services/reports';

type RouteParams = { id: string };

export default function ReportDetailScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = (route.params ?? {}) as RouteParams;

  const [loading, setLoading] = useState(true);
  const [r, setR] = useState<Awaited<ReturnType<typeof getReport>>>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReport(id);
      setR(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useLayoutEffect(() => {
    nav.setOptions({
      title: 'Chi tiết báo cáo',
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 12, marginRight: spacing.md }}>
          {/* Sửa */}
          <TouchableOpacity
            onPress={() => nav.navigate('ReportForm', { id })}
            style={{ padding: 6 }}
            accessibilityLabel="Sửa báo cáo"
          >
            <Ionicons name="create-outline" size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Xoá */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Xoá báo cáo', 'Bạn có chắc muốn xoá?', [
                { text: 'Huỷ' },
                {
                  text: 'Xoá',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteReport(id);
                    Alert.alert('Đã xoá');
                    nav.goBack();
                  },
                },
              ]);
            }}
            style={{ padding: 6 }}
            accessibilityLabel="Xoá báo cáo"
          >
            <Ionicons name="trash-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [colors.text, id, nav]);

  React.useEffect(() => { load(); }, [load]);

  if (loading || !r) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.subtext }}>{loading ? 'Đang tải…' : 'Không tìm thấy báo cáo'}</Text>
      </View>
    );
  }

  const openExternalMap = () => {
    if (!r.latitude || !r.longitude) return;
    const latLng = `${r.latitude},${r.longitude}`;
    if (Platform.OS === 'ios') Linking.openURL(`maps://?q=${encodeURIComponent('Vị trí báo cáo')}&ll=${latLng}`);
    else Linking.openURL(`geo:0,0?q=${latLng}(Vị trí báo cáo)`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      {!!r.photoUri && (
        <Image
          source={{ uri: r.photoUri }}
          style={{ width: '100%', height: 260, backgroundColor: colors.card }}
          resizeMode="cover"
        />
      )}

      <View style={{ padding: spacing.xl, gap: spacing.md }}>
        <View style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.outline }]}>
          <Ionicons name="pricetag-outline" size={16} color={colors.text} />
          <Text style={{ color: colors.text, fontWeight: '800', marginLeft: 6 }}>
            {r.category.toUpperCase()}
          </Text>
        </View>

        <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>
          {r.description || '(Không mô tả)'}
        </Text>

        <Text style={{ color: colors.subtext }}>
          {new Date(r.createdAt).toLocaleString()}
        </Text>

        {!!r.latitude && !!r.longitude && (
          <TouchableOpacity
            onPress={openExternalMap}
            style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.outline }]}
          >
            <Ionicons name="navigate-outline" size={18} color={colors.text} />
            <Text style={{ color: colors.text, fontWeight: '800', marginLeft: 8 }}>
              Xem chỉ đường ({r.latitude.toFixed(5)}, {r.longitude.toFixed(5)})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' },
  btn: { borderWidth: 1, borderRadius: radius.xl, paddingVertical: 12, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center' },
});
