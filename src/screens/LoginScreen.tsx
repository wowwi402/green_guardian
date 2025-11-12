import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { useAuth } from '../auth/AuthProvider';
import { spacing } from '../theme';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { signIn, resetPassword, signInMock } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      await signIn(email.trim(), password);
      Alert.alert('Thành công', 'Đăng nhập thành công');
    } catch (e: any) {
      Alert.alert('Đăng nhập thất bại', e?.message ?? 'Không rõ lỗi');
    }
  };

  const onForgot = async () => {
    const em = email.trim();
    if (!em) { Alert.alert('Thiếu email', 'Nhập email để khôi phục.'); return; }
    try {
      await resetPassword(em);
      Alert.alert('Đã gửi email khôi phục', 'Kiểm tra hộp thư (Inbox/Spam).');
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không gửi được email khôi phục');
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Đăng nhập</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={colors.subtext}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.card }]}
      />

      <TextInput
        placeholder="Mật khẩu"
        placeholderTextColor={colors.subtext}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.card }]}
      />

      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={onLogin}>
        <Text style={[styles.btnText, { color: colors.onPrimary }]}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onForgot} style={{ marginTop: spacing.md, alignSelf: 'center' }}>
        <Text style={{ color: (colors as any).link ?? colors.primary, fontWeight: '700' }}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.outline, borderWidth: 1 }]}
        onPress={signInMock}
      >
        <Text style={[styles.btnText, { color: colors.text }]}>Dùng tài khoản demo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: spacing.lg },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12 },
  btn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  btnText: { fontWeight: '700' },
});
