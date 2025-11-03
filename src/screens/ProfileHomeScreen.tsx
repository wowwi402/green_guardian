// src/screens/ProfileHomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { spacing } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';
import { useAuth } from '../auth/AuthProvider';

export default function ProfileHomeScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const { signOut, mode } = useAuth(); // ✅ gọi hook BÊN TRONG component

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Hồ sơ</Text>
      <Text style={{ color: colors.subtext, marginBottom: spacing.xl }}>
        Trạng thái: {mode === 'guest' ? 'Khách' : mode === 'user' ? 'Đã đăng nhập' : 'Chưa chọn'}
      </Text>

      <PrimaryButton label="Tạo báo cáo" onPress={() => navigation.navigate('ReportForm')} />
      <View style={{ height: spacing.md }} />
      <PrimaryButton label="Báo cáo của tôi" variant="outline" onPress={() => navigation.navigate('ReportList')} />
      <View style={{ height: spacing.md }} />
      <PrimaryButton label="Sao lưu / Phục hồi" variant="outline" onPress={() => navigation.navigate('DataManage')} />
      <View style={{ height: spacing.md }} />
      <PrimaryButton label="Cài đặt giao diện" variant="outline" onPress={() => navigation.navigate('Settings')} />
      <View style={{ height: spacing.xl }} />
      <PrimaryButton label="Đăng xuất" variant="outline" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  title: { fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
});
