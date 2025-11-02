import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { colors, spacing } from '../theme';
import PrimaryButton from '../components/PrimaryButton';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { exportReportsToFile, importReportsFromFile } from '../services/reports';

export default function DataManageScreen() {
  const [busy, setBusy] = useState(false);

  async function onExport() {
    try {
      setBusy(true);
      const { uri, count } = await exportReportsToFile();
      setBusy(false);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Chia sẻ file báo cáo' });
      } else {
        Alert.alert('Đã xuất file', `Đường dẫn: ${uri}\nTổng: ${count} mục`);
      }
    } catch (e: any) {
      setBusy(false);
      Alert.alert('Lỗi xuất file', e?.message ?? 'Không xuất được file');
    }
  }

  async function onImport() {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (res.canceled) return;
      const uri = res.assets?.[0]?.uri;
      if (!uri) return;
      setBusy(true);
      const { added, total } = await importReportsFromFile(uri);
      setBusy(false);
      Alert.alert('Đã nhập dữ liệu', `Thêm mới: ${added}\nTổng sau khi nhập: ${total}`);
    } catch (e: any) {
      setBusy(false);
      Alert.alert('Lỗi nhập file', e?.message ?? 'Không nhập được dữ liệu');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sao lưu / Phục hồi</Text>
      <Text style={styles.text}>
        Xuất báo cáo ra file JSON để lưu lại hoặc nhập từ file JSON đã có.
        (Lưu ý: JSON không chứa ảnh; nếu nhập trên máy khác, ảnh cũ có thể không hiển thị.)
      </Text>

      <View style={{ height: spacing.xl }} />
      <PrimaryButton label={busy ? 'Đang xuất...' : 'Xuất JSON'} onPress={onExport} disabled={busy} />
      <View style={{ height: spacing.md }} />
      <PrimaryButton label={busy ? 'Đang nhập...' : 'Nhập từ JSON'} variant="outline" onPress={onImport} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.sm },
  text: { color: colors.subtext, lineHeight: 20 },
});
