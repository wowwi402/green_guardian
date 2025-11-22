import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert, FlatList, StyleSheet, Text, TouchableOpacity, View, Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';
import {
  listReports, deleteReport, type Report,
  exportReportsToFile, importReportsFromFile,
} from '../../services/reports';
import * as DocumentPicker from 'expo-document-picker';

export default function MyReportsScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const [items, setItems] = useState<Report[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try { setItems(await listReports()); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onExport = useCallback(async () => {
    try {
      const { uri, count } = await exportReportsToFile();
      const Sharing = await import('expo-sharing');
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
      else Alert.alert('Đã xuất', `File: ${uri}\nSố bản ghi: ${count}`);
    } catch (e: any) {
      Alert.alert('Xuất thất bại', e?.message ?? 'Không thể xuất JSON.');
    }
  }, []);

  const onImport = useCallback(async () => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({ type: 'application/json', multiple: false });
      if (picked.canceled || !picked.assets?.length) return;
      const { uri } = picked.assets[0];
      const res = await importReportsFromFile(uri);
      Alert.alert('Đã nhập', `Thêm mới: ${res.added}\nTổng cộng: ${res.total}`);
      load();
    } catch (e: any) {
      Alert.alert('Nhập thất bại', e?.message ?? 'Không thể nhập JSON.');
    }
  }, [load]);

  const confirmDelete = useCallback((id: string) => {
    Alert.alert('Xoá báo cáo', 'Bạn có chắc muốn xoá báo cáo này?', [
      { text: 'Huỷ' },
      { text: 'Xoá', style: 'destructive', onPress: async () => { await deleteReport(id); load(); } },
    ]);
  }, [load]);

  useLayoutEffect(() => {
    nav.setOptions?.({
      headerTitle: 'Báo cáo của tôi',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            if (nav.canGoBack()) nav.goBack();
            else nav.navigate('MainTabs', { screen: 'Profile' }); // fallback về Hồ sơ
          }}
          style={{ paddingHorizontal: 8, paddingVertical: 6 }}
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 12, marginRight: spacing.md }}>
          <TouchableOpacity onPress={onExport} style={{ padding: 6 }} accessibilityLabel="Xuất JSON">
            <Ionicons name="download-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onImport} style={{ padding: 6 }} accessibilityLabel="Nhập JSON">
            <Ionicons name="cloud-upload-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [colors.text, nav, onExport, onImport]);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {items.length === 0 && !busy ? (
        <View style={styles.empty}>
          <Text style={{ color: colors.subtext, textAlign: 'center' }}>Chưa có báo cáo nào.</Text>
          <Text style={{ color: colors.subtext, textAlign: 'center', marginTop: 4 }}>
            Dùng nút “+” hoặc màn Bản đồ để thêm.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          refreshing={busy}
          onRefresh={load}
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}
          renderItem={({ item }) => (
           <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => nav.navigate('ReportDetail', { id: item.id })}  // ← đổi sang ReportDetail
              onLongPress={() => confirmDelete(item.id)}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}
>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              {!!item.photoUri && (
            <Image source={{ uri: item.photoUri }} style={{ width: 72, height: 72, borderRadius: radius.lg }} />
              )}
            <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '800' }} numberOfLines={1}>
              {item.description || '(Không mô tả)'}
            </Text>
            <Text style={{ color: colors.subtext, marginTop: 2 }}>{item.category.toUpperCase()}</Text>
            <Text style={{ color: colors.subtext, marginTop: 2 }} numberOfLines={1}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
            </View>
          <TouchableOpacity onPress={() => confirmDelete(item.id)} style={{ padding: 6, alignSelf: 'center' }}>
      <Ionicons name="trash-outline" size={20} color={colors.danger ?? '#E11D48'} />
    </TouchableOpacity>
  </View>
</TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: { borderWidth: 1, borderRadius: radius.xl, padding: spacing.md },
});
