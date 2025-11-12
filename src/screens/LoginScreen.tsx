// src/screens/auth/Login.tsx  (hoặc LoginScreen.tsx)

import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';

import { useAppTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme';
import { auth } from '../services/firebase';
import { useAuth } from '../auth/AuthProvider';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { signIn, signInMock } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      // KHÔNG điều hướng ở đây: RootNavigator sẽ tự chuyển sang MainTabs khi user != null
    } catch (e: any) {
      Alert.alert('Đăng nhập thất bại', e?.message ?? 'Không rõ lỗi');
    } finally {
      setBusy(false);
    }
  };

  const onForgot = async () => {
    const em = (email ?? '').trim();
    if (!em) {
      Alert.alert('Thiếu email', 'Hãy nhập email để khôi phục mật khẩu.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, em);
      Alert.alert('Đã gửi email khôi phục', 'Hãy kiểm tra hộp thư (kể cả Spam).');
    } catch (e: any) {
      const msg =
        e?.code === 'auth/user-not-found'
          ? 'Email chưa được đăng ký.'
          : e?.message ?? 'Không gửi được email khôi phục.';
      Alert.alert('Lỗi', msg);
    }
  };

  const gotoRegister = () => navigation.navigate('Register');

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
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.outline, backgroundColor: colors.card },
        ]}
      />

      <TextInput
        placeholder="Mật khẩu"
        placeholderTextColor={colors.subtext}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.outline, backgroundColor: colors.card },
        ]}
      />

      <TouchableOpacity
        disabled={busy}
        style={[
          styles.btn,
          { backgroundColor: busy ? '#bdbdbd' : colors.primary },
        ]}
        onPress={onLogin}
      >
        <Text style={[styles.btnText, { color: colors.onPrimary }]}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Text>
      </TouchableOpacity>

      {typeof signInMock === 'function' && (
        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor: colors.card,
              borderColor: colors.outline,
              borderWidth: 1,
              marginTop: spacing.sm,
            },
          ]}
          onPress={signInMock}
        >
          <Text style={[styles.btnText, { color: colors.text }]}>
            Dùng tài khoản demo
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onForgot}
        style={{ marginTop: spacing.md, alignSelf: 'center' }}
      >
        <Text
          style={{
            color: (colors as any).link || colors.primary,
            fontWeight: '700',
          }}
        >
          Quên mật khẩu?
        </Text>
      </TouchableOpacity>

      <View style={{ height: spacing.md }} />

      <TouchableOpacity onPress={gotoRegister} style={{ alignSelf: 'center' }}>
        <Text style={{ color: colors.subtext }}>
          Chưa có tài khoản?{' '}
          <Text
            style={{
              color: (colors as any).link || colors.primary,
              fontWeight: '700',
            }}
          >
            Đăng ký
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: spacing.lg },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  btn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  btnText: { fontWeight: '700' },
});
