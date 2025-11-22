import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { listReports, type Report } from '../../services/reports';
import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportsParamList } from '../../navigation/ReportsStack';

export default function MyReportsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<ReportsParamList>>();
  const { colors } = useAppTheme();

  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listReports();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));
  useEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => nav.navigate('ReportCreate')}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Tạo mới</Text>
        </TouchableOpacity>
      ),
    });
  }, [nav, colors.primary]);

  const renderItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      onPress={() => nav.navigate('ReportDetail', { id: item.id })}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}
    >
      <Image source={{ uri: item.photoUri }} style={styles.thumb} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {item.description || '(Không có mô tả)'}
        </Text>
        <Text style={{ color: colors.subtext, marginTop: 2 }}>
          {item.category} • {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      contentContainerStyle={{ padding: spacing.lg }}
      data={items}
      keyExtractor={(r) => r.id}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 48 }}>
          <Text style={{ color: colors.subtext }}>Chưa có báo cáo nào. Nhấn “Tạo mới”.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  thumb: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: '#eee' },
  title: { fontWeight: '800' },
});
