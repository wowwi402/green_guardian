import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';
import { listReports, deleteReport, type Report } from '../../services/reports';

export default function ReportDetailScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const id: string = params?.id;

  const [r, setR] = useState<Report | null>(null);

  useEffect(() => {
    (async () => {
      const all = await listReports();
      setR(all.find(x => x.id === id) ?? null);
    })();
  }, [id]);

  if (!r) {
    return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <Text>Không tìm thấy báo cáo.</Text>
    </View>;
  }

  const openMap = () => {
    if (r.latitude == null || r.longitude == null) return;
    const latLng = `${r.latitude},${r.longitude}`;
    const label = encodeURIComponent(r.description || 'Báo cáo');
    if (Platform.OS === 'ios') Linking.openURL(`maps://?q=${label}&ll=${latLng}`);
    else Linking.openURL(`geo:0,0?q=${latLng}(${label})`);
  };

  const doDelete = () => {
    Alert.alert('Xoá báo cáo', 'Bạn chắc muốn xoá?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: async () => {
        await deleteReport(r.id);
        nav.goBack();
      } },
    ]);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.title, { color: colors.text }]}>{r.description || r.category.toUpperCase()}</Text>
        <Text style={{ color: colors.subtext }}>
          {new Date(r.createdAt).toLocaleString()} • {r.category.toUpperCase()}
        </Text>

        {!!r.latitude && !!r.longitude && (
          <Text style={{ color: colors.subtext, marginTop: spacing.sm }}>
            Tọa độ: {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}
          </Text>
        )}

        <View style={{ height: spacing.md }} />

        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => nav.navigate('ReportForm', { id: r.id })}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>Sửa báo cáo</Text>
        </TouchableOpacity>

        {!!r.latitude && !!r.longitude && (
          <TouchableOpacity style={[styles.btn, { borderColor: colors.outline, borderWidth: 1 }]} onPress={openMap}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>Mở trên Bản đồ</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.btn, { backgroundColor: '#E11D48' }]} onPress={doDelete}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>Xoá</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl },
  card: { borderWidth: 1, borderRadius: radius.xl, padding: spacing.lg },
  title: { fontSize: 18, fontWeight: '900', marginBottom: 6 },
  btn: { borderRadius: radius.xl, paddingVertical: 12, alignItems: 'center', marginTop: spacing.md },
});
