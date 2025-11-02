import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing } from '../theme';

export default function ProfileHomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hồ sơ</Text>
      <Text style={styles.text}>Bạn có thể gửi báo cáo vi phạm môi trường kèm ảnh & vị trí.</Text>

      <View style={{ height: spacing.xl }} />
      <PrimaryButton label="Tạo báo cáo mới" onPress={() => navigation.navigate('ReportForm')} />
      <View style={{ height: spacing.md }} />
      <PrimaryButton label="Xem báo cáo của tôi" variant="outline" onPress={() => navigation.navigate('ReportList')} />
      <View style={{ height: spacing.md }} />
      <PrimaryButton label="Sao lưu / Phục hồi" variant="outline" onPress={() => navigation.navigate('DataManage')} />  
      <View style={{ height: spacing.md }} />
      <PrimaryButton label="Cài đặt giao diện" variant="outline" onPress={() => navigation.navigate('Settings')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.sm },
  text: { color: colors.subtext, lineHeight: 20 },
});
