import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { listReports, type Report } from '../../services/reports';
import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';

export default function MyReportsListScreen() {
  const nav = useNavigation<any>();
  const { colors } = useAppTheme();
  const [items, setItems] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await listReports();
    setItems(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      onPress={() => nav.navigate('MyReportDetail', { id: item.id })}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}
    >
      <Image source={{ uri: item.photoUri }} style={styles.thumb} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]}>
          {item.category.toUpperCase()} • {new Date(item.createdAt).toLocaleString()}
        </Text>
        <Text numberOfLines={2} style={{ color: colors.subtext }}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={() => nav.navigate('ReportCreate')}
      >
        <Text style={[styles.btnText, { color: colors.onPrimary }]}>+ Tạo báo cáo</Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={{ color: colors.subtext, textAlign: 'center', marginTop: spacing.xl }}>
            Chưa có báo cáo nào.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.lg },
  card: {
    flexDirection: 'row', gap: 12, padding: 12, borderRadius: radius.lg, borderWidth: 1, marginBottom: 12,
    alignItems: 'center'
  },
  thumb: { width: 72, height: 72, borderRadius: radius.md, marginRight: 8 },
  title: { fontWeight: '700', marginBottom: 4 },
  btn: { alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.lg, marginBottom: spacing.md },
  btnText: { fontWeight: '800' },
});
