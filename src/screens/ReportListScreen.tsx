import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { spacing, radius } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';
import { listReports, deleteReport, type Report } from '../services/reports';
import { useFocusEffect } from '@react-navigation/native';

export default function ReportListScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const [items, setItems] = React.useState<Report[]>([]);

  const load = React.useCallback(async () => {
    const data = await listReports();
    setItems(data);
  }, []);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  function onLongPress(item: Report) {
    Alert.alert('Tuỳ chọn', 'Bạn muốn làm gì với báo cáo này?', [
      { text: 'Huỷ' },
      { text: 'Sửa', onPress: () => navigation.navigate('ReportForm', { editId: item.id }) },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          await deleteReport(item.id);
          load();
        },
      },
    ]);
  }

  const renderItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
      onLongPress={() => onLongPress(item)}
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}
    >
      <Image source={{ uri: item.photoUri }} style={styles.thumb} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.description}</Text>
        <Text style={{ color: colors.subtext, marginTop: 4 }}>
          {item.category.toUpperCase()} · {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={{ padding: spacing.xl }}
        ListEmptyComponent={<Text style={{ color: colors.subtext, textAlign: 'center', marginTop: spacing.xl }}>Chưa có báo cáo nào.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { flexDirection: 'row', padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center' },
  thumb: { width: 64, height: 64, borderRadius: radius.md, marginRight: spacing.md, backgroundColor: '#0003' },
  title: { fontWeight: '700' },
});
