import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../services/firebase';
import { useAppTheme } from '../theme/ThemeProvider';
import { useAuth } from './AuthProvider';
import { spacing } from '../theme';

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const { colors } = useAppTheme();
  const { signInMock } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // KHÔNG cần navigate ở đây. RootNavigator sẽ tự render MainTabs khi user thay đổi.
      Alert.alert('OK', 'Đăng nhập thành công');
    } catch (e: any) {
      Alert.alert('Đăng nhập thất bại', e?.message ?? 'Không rõ lỗi');
    }
  };

  const onForgot = async () => {
    const em = email.trim();
    if (!em) { Alert.alert('Thiếu email', 'Nhập email để khôi phục.'); return; }
    try {
      await sendPasswordResetEmail(auth, em);
      Alert.alert('Đã gửi email khôi phục', 'Kiểm tra Inbox/Spam nhé.');
    } catch (e: any) {
      const msg = e?.code === 'auth/user-not-found'
        ? 'Email chưa được đăng ký'
        : (e?.message ?? 'Không gửi được email');
      Alert.alert('Lỗi', msg);
    }
  };

  const goRegister = () => nav.navigate('Register'); // trong AuthFlow stack

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

      {!!signInMock && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.outline, borderWidth: 1 }]}
          onPress={signInMock}
        >
          <Text style={[styles.btnText, { color: colors.text }]}>Dùng tài khoản demo</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onForgot} style={{ marginTop: spacing.md, alignSelf: 'center' }}>
        <Text style={{ color: (colors as any).link ?? colors.primary, fontWeight: '700' }}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* 🔹 Link Đăng ký */}
      <TouchableOpacity onPress={goRegister} style={{ marginTop: spacing.md, alignSelf: 'center' }}>
        <Text style={{ color: (colors as any).link ?? colors.primary, fontWeight: '700' }}>
          Chưa có tài khoản? Đăng ký
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '900', marginBottom: spacing.lg },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12 },
  btn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  btnText: { fontWeight: '700' },
});
