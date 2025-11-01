import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../theme';
import { listReports, Report } from '../services/reports';

export default function ReportListScreen({ navigation }: any) {
  const [items, setItems] = useState<Report[]>([]);

  const load = useCallback(async () => {
    const data = await listReports();
    setItems(data);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <Text style={styles.empty}>Chưa có báo cáo nào. Vào “Hồ sơ → Tạo báo cáo mới”.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigation.navigate('ReportDetail', { report: item })}>
              <Image source={{ uri: item.photoUri }} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.category.toUpperCase()}</Text>
                <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  empty: { color: colors.subtext, textAlign: 'center', marginTop: spacing.xl },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.outline },
  thumb: { width: 84, height: 84, borderRadius: radius.md, marginRight: spacing.md },
  title: { color: colors.text, fontWeight: '800' },
  desc: { color: colors.subtext, marginTop: 4 },
  meta: { color: colors.subtext, fontSize: 12, marginTop: 6 },
});
