import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { listReports, deleteReport, Report } from '../services/reports';
import { auth } from '../services/firebase';
import { useAppTheme } from '../theme/ThemeProvider';
import { spacing, radius } from '../theme';

export default function MyReportsListScreen() {
  const nav = useNavigation<any>();
  const { colors } = useAppTheme();
  const [data, setData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await listReports();
    const uid = auth.currentUser?.uid ?? 'guest';
    const mine = all.filter(r => r.uid === uid).sort((a,b)=> (a.createdAt < b.createdAt ? 1 : -1));
    setData(mine);
    setLoading(false);
  }, []);

  useEffect(() => { const unsub = nav.addListener('focus', load); return unsub; }, [nav, load]);

  const onDelete = (id: string) => {
    Alert.alert('Xóa báo cáo', 'Bạn chắc chắn muốn xóa?', [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => { await deleteReport(id); load(); } }
    ]);
  };

  const renderItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.card, borderColor: colors.outline }]}
      onPress={() => nav.navigate('MyReportDetail', { id: item.id })}
    >
      <Image source={{ uri: item.photoUri }} style={styles.thumb} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {item.category.toUpperCase()} · {new Date(item.createdAt).toLocaleString()}
        </Text>
        <Text style={{ color: colors.subtext }} numberOfLines={2}>{item.description}</Text>
        {!!item.latitude && !!item.longitude && (
          <Text style={{ color: colors.subtext, marginTop: 4 }}>
            {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.deleteBtn, { borderColor: colors.outline }]}>
        <Text style={{ color: colors.danger }}>Xóa</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {data.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text style={{ color: colors.subtext }}>Chưa có báo cáo nào.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.xl }}
          refreshing={loading}
          onRefresh={load}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  item: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  thumb: { width: 64, height: 64, borderRadius: radius.lg, marginRight: spacing.md },
  title: { fontWeight: '700', marginBottom: 4 },
  deleteBtn: { marginLeft: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 8, borderWidth: 1, borderRadius: radius.lg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
