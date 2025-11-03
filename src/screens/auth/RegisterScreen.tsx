import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { spacing, radius } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../auth/AuthProvider';

export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);

  const onRegister = async () => {
    try {
      if (pw.length < 6) return Alert.alert('Mật khẩu tối thiểu 6 ký tự');
      setBusy(true);
      await signUp(email, pw, name);
      Alert.alert('Thành công', 'Tài khoản đã được tạo.');
    } catch (e: any) {
      Alert.alert('Đăng ký thất bại', e?.message ?? '');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.box, { backgroundColor: colors.bg }]}>
      <Text style={[styles.h1, { color: colors.text }]}>Tạo tài khoản</Text>

      <View style={[styles.input, { borderColor: colors.outline, backgroundColor: colors.card }]}>
        <TextInput placeholder="Tên hiển thị" value={name} onChangeText={setName}
          style={{ color: colors.text }} placeholderTextColor={colors.subtext} />
      </View>
      <View style={[styles.input, { borderColor: colors.outline, backgroundColor: colors.card }]}>
        <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address"
          value={email} onChangeText={setEmail} style={{ color: colors.text }} placeholderTextColor={colors.subtext} />
      </View>
      <View style={[styles.input, { borderColor: colors.outline, backgroundColor: colors.card }]}>
        <TextInput placeholder="Mật khẩu" secureTextEntry value={pw} onChangeText={setPw}
          style={{ color: colors.text }} placeholderTextColor={colors.subtext} />
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={onRegister} disabled={busy}>
        <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>{busy ? 'Đang xử lý…' : 'Đăng ký'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  h1: { fontSize: 24, fontWeight: '900', marginBottom: spacing.lg },
  input: { borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 10, marginBottom: spacing.md },
  btn: { alignItems: 'center', paddingVertical: 12, borderRadius: radius.xl },
});
