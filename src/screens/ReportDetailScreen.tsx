import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Platform, Linking, ScrollView } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { deleteReport, Report } from '../services/reports';

function openExternalMap(lat?: number, lon?: number) {
  if (lat == null || lon == null) return;
  const latLng = `${lat},${lon}`;
  if (Platform.OS === 'ios') {
    Linking.openURL(`maps://?q=${encodeURIComponent('Điểm báo cáo')}&ll=${latLng}`);
  } else {
    Linking.openURL(`geo:0,0?q=${latLng}(Điểm báo cáo)`);
  }
}

export default function ReportDetailScreen({ route, navigation }: any) {
  const report = route.params.report as Report;

  async function onDelete() {
    Alert.alert('Xoá báo cáo?', 'Bạn có chắc muốn xoá mục này?', [
      { text: 'Huỷ' },
      { text: 'Xoá', style: 'destructive', onPress: async () => { await deleteReport(report.id); navigation.goBack(); } },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <Image source={{ uri: report.photoUri }} style={styles.photo} />
      <View style={{ height: spacing.lg }} />

      <Text style={styles.title}>{report.category.toUpperCase()}</Text>
      <Text style={styles.meta}>{new Date(report.createdAt).toLocaleString()}</Text>

      <View style={{ height: spacing.md }} />
      <Text style={styles.desc}>{report.description}</Text>

      <View style={{ height: spacing.md }} />
      {report.latitude != null && report.longitude != null ? (
        <>
          <Text style={styles.meta}>Vị trí: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</Text>
          <View style={{ height: spacing.sm }} />
          <TouchableOpacity style={styles.btn} onPress={() => openExternalMap(report.latitude, report.longitude)}>
            <Text style={styles.btnText}>Mở chỉ đường</Text>
          </TouchableOpacity>
        </>
      ) : null}

      <View style={{ height: spacing.lg }} />
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#E74C3C' }]} onPress={onDelete}>
        <Text style={[styles.btnText, { color: 'white' }]}>Xoá báo cáo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  photo: { width: '100%', height: 260, borderRadius: radius.lg, backgroundColor: colors.card },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  meta: { color: colors.subtext, marginTop: 2 },
  desc: { color: colors.subtext, lineHeight: 20 },
  btn: { backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignSelf: 'flex-start', borderRadius: radius.lg },
  btnText: { color: colors.bg, fontWeight: '700' },
});
