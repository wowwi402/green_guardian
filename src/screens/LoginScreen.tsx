// src/screens/LoginScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { spacing } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';
import { useAuth } from '../auth/AuthProvider';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { signInMock } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Đăng nhập (Demo)</Text>
      <Text style={{ color: colors.subtext, marginBottom: spacing.xl }}>
        Ở đồ án thật bạn thay bằng form tài khoản/mật khẩu hoặc OAuth.
      </Text>
      <PrimaryButton label="Đăng nhập (giả lập)" onPress={signInMock} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
});
