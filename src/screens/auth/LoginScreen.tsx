import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { spacing, radius } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../auth/AuthProvider';

export default function LoginScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    try { setBusy(true); await signIn(email, pw); }
    catch (e: any) { Alert.alert('Đăng nhập thất bại', e?.message ?? ''); }
    finally { setBusy(false); }
  };

  return (
    <View style={[styles.box, { backgroundColor: colors.bg }]}>
      <Text style={[styles.h1, { color: colors.text }]}>Đăng nhập</Text>

      <View style={[styles.input, { borderColor: colors.outline, backgroundColor: colors.card }]}>
        <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address"
          value={email} onChangeText={setEmail} style={{ color: colors.text }} placeholderTextColor={colors.subtext} />
      </View>
      <View style={[styles.input, { borderColor: colors.outline, backgroundColor: colors.card }]}>
        <TextInput placeholder="Mật khẩu" secureTextEntry value={pw} onChangeText={setPw}
          style={{ color: colors.text }} placeholderTextColor={colors.subtext} />
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={onLogin} disabled={busy}>
        <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>{busy ? 'Đang xử lý…' : 'Đăng nhập'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: spacing.md }}>
        <Text style={{ color: colors.text }}>Chưa có tài khoản? <Text style={{ color: colors.primary, fontWeight: '700' }}>Đăng ký</Text></Text>
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
