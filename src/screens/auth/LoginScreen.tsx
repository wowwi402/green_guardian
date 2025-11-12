import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAppTheme } from '../../theme/ThemeProvider';
// Nếu bạn đang dùng AuthProvider cùng thư mục screens/auth:
import { useAuth } from '../../auth/AuthProvider'; // <- đúng đường dẫn nếu file nằm ở screens/auth

import { spacing } from '../../theme';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { signInMock } = useAuth?.() ?? { signInMock: undefined }; // an toàn nếu chưa có provider

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const onLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert('OK', 'Đăng nhập thành công');
    } catch (e: any) {
      Alert.alert('Đăng nhập thất bại', e?.message ?? 'Không rõ lỗi');
    }
  };

  const onForgot = async () => {
    const em = (email ?? '').trim();
    if (!em) { Alert.alert('Thiếu email', 'Nhập email để khôi phục.'); return; }
    try {
      await sendPasswordResetEmail(auth, em);
      Alert.alert('Đã gửi email khôi phục', 'Kiểm tra Inbox/Spam nhé.');
    } catch (e: any) {
      const msg = e?.code === 'auth/user-not-found' ? 'Email chưa được đăng ký' : (e?.message ?? 'Không gửi được email');
      Alert.alert('Lỗi', msg);
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

      {signInMock && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.outline, borderWidth: 1 }]}
          onPress={signInMock}
        >
          <Text style={[styles.btnText, { color: colors.text }]}>Dùng tài khoản demo</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onForgot} style={{ marginTop: spacing.md, alignSelf: 'center' }}>
      <Text style={{ color: colors.link || colors.primary, fontWeight: '700' }}>
       Quên mật khẩu?
      </Text>
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
