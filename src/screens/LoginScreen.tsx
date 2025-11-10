// src/screens/LoginScreen.tsx  (đặt đúng đường dẫn file bạn đang dùng)
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAppTheme } from '../theme/ThemeProvider';
import { spacing, radius } from '../theme';

const mapAuthError = (code?: string) => {
  switch (code) {
    case 'auth/invalid-email': return 'Email không hợp lệ.';
    case 'auth/user-not-found': return 'Không tìm thấy tài khoản.';
    case 'auth/wrong-password': return 'Sai mật khẩu.';
    case 'auth/operation-not-allowed': return 'Hãy bật Email/Password trong Firebase → Authentication → Sign-in method.';
    case 'auth/network-request-failed': return 'Lỗi mạng, vui lòng thử lại.';
    case 'auth/too-many-requests': return 'Thử quá nhiều lần, hãy đợi một lúc.';
    default: return `Lỗi: ${code ?? 'không xác định'}`;
  }
};

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const { colors } = useAppTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password); // ✅ dùng API đúng
      nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e: any) {
      Alert.alert('Đăng nhập thất bại', mapAuthError(e?.code));
      console.log('Login error:', e);
    } finally {
      setLoading(false);
    }
  };

  const goRegister = () => nav.navigate('Register');

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Đăng nhập</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={[
          styles.input,
          { backgroundColor: colors.card, borderColor: colors.outline, color: colors.text },
        ]}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Mật khẩu"
        secureTextEntry
        style={[
          styles.input,
          { backgroundColor: colors.card, borderColor: colors.outline, color: colors.text },
        ]}
      />

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }, loading && { opacity: 0.6 }]}
        onPress={onLogin}
        disabled={loading}
      >
        <Text style={[styles.btnTxt, { color: colors.onPrimary }]}>
          {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.note, { color: colors.subtext }]}>
        Chưa có tài khoản?{' '}
        <Text onPress={goRegister} style={{ color: colors.primary, fontWeight: '800' }}>
          Đăng ký
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900', marginBottom: spacing.lg },
  input: {
    borderWidth: 1, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    marginBottom: spacing.md,
  },
  btn: { borderRadius: radius.xl, alignItems: 'center', paddingVertical: 14 },
  btnTxt: { fontWeight: '800' },
  note: { marginTop: spacing.md, textAlign: 'center' },
});
