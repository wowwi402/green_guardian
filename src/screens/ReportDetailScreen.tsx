import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, Platform, Linking } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { spacing, radius } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';
import { getReport, deleteReport, type Report } from '../services/reports';
import * as Sharing from 'expo-sharing';

function openExternalMap(lat: number, lon: number, label: string) {
  const latLng = `${lat},${lon}`;
  if (Platform.OS === 'ios') Linking.openURL(`maps://?q=${encodeURIComponent(label)}&ll=${latLng}`);
  else Linking.openURL(`geo:0,0?q=${latLng}(${encodeURIComponent(label)})`);
}

export default function ReportDetailScreen({ route, navigation }: any) {
  const { colors } = useAppTheme();
  const id = route.params?.id as string;
  const [item, setItem] = useState<Report | null>(null);

  useEffect(() => {
    (async () => {
      const r = await getReport(id);
      setItem(r ?? null);
    })();
  }, [id]);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text, padding: spacing.xl }}>Không tìm thấy báo cáo.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Image source={{ uri: item.photoUri }} style={styles.image} />
      <View style={{ padding: spacing.xl }}>
        <Text style={[styles.title, { color: colors.text }]}>{item.description}</Text>
        <Text style={{ color: colors.subtext, marginTop: 4 }}>
          {item.category.toUpperCase()} · {new Date(item.createdAt).toLocaleString()}
        </Text>

        <View style={{ height: spacing.xl }} />
        <PrimaryButton label="Chia sẻ ảnh" onPress={async () => {
          if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(item.photoUri);
          else Alert.alert('Thiết bị không hỗ trợ chia sẻ.');
        }} />

        {item.latitude != null && item.longitude != null && (
          <>
            <View style={{ height: spacing.md }} />
            <PrimaryButton label="Chỉ đường" variant="outline" onPress={() => openExternalMap(item.latitude!, item.longitude!, 'Báo cáo')} />
          </>
        )}

        <View style={{ height: spacing.md }} />
        <PrimaryButton label="Sửa báo cáo" variant="outline" onPress={() => navigation.navigate('ReportForm', { editId: item.id })} />

        <View style={{ height: spacing.md }} />
        <PrimaryButton
          label="Xoá báo cáo"
          variant="outline"
          onPress={() =>
            Alert.alert('Xoá?', 'Bạn có chắc muốn xoá báo cáo này?', [
              { text: 'Huỷ' },
              {
                text: 'Xoá',
                style: 'destructive',
                onPress: async () => {
                  await deleteReport(item.id);
                  navigation.goBack();
                },
              },
            ])
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: '100%', height: 260, resizeMode: 'cover' },
  title: { fontSize: 20, fontWeight: '800' },
});
