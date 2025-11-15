import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { getReport, deleteReport, type Report } from '../../services/reports';
import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';

type Params = { MyReportDetail: { id: string } };

export default function MyReportDetailScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<Params, 'MyReportDetail'>>();
  const [item, setItem] = useState<Report | null>(null);

  useEffect(() => {
    (async () => {
      const r = await getReport(route.params.id);
      if (!r) { Alert.alert('Lỗi', 'Không tìm thấy báo cáo'); nav.goBack(); return; }
      setItem(r);
    })();
  }, [route.params?.id]);

  const onDelete = async () => {
    if (!item) return;
    Alert.alert('Xoá báo cáo', 'Bạn chắc chắn muốn xoá?', [
      { text: 'Huỷ' },
      {
        text: 'Xoá', style: 'destructive', onPress: async () => {
          await deleteReport(item.id);
          Alert.alert('Đã xoá');
          nav.goBack();
        }
      }
    ]);
  };

  if (!item) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      <Image source={{ uri: item.photoUri }} style={styles.image} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.title, { color: colors.text }]}>{item.category.toUpperCase()}</Text>
        <Text style={{ color: colors.subtext, marginBottom: 8 }}>{new Date(item.createdAt).toLocaleString()}</Text>
        <Text style={{ color: colors.text, lineHeight: 20 }}>{item.description}</Text>
        {!!item.latitude && !!item.longitude && (
          <Text style={{ color: colors.subtext, marginTop: 8 }}>
            Vị trí: {item.latitude?.toFixed(5)}, {item.longitude?.toFixed(5)}
          </Text>
        )}
      </View>

      <TouchableOpacity style={[styles.btnDanger, { backgroundColor: colors.danger }]} onPress={onDelete}>
        <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>Xoá báo cáo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 220, borderRadius: radius.lg, marginBottom: spacing.md },
  card: { padding: 16, borderRadius: radius.lg, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  btnDanger: { marginTop: spacing.lg, paddingVertical: 14, alignItems: 'center', borderRadius: radius.lg },
});
