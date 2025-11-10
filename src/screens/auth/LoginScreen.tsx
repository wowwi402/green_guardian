// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {  View,  Text,  TextInput,  TouchableOpacity,  StyleSheet,  Alert,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';
import { sendPasswordResetEmail } from 'firebase/auth';


const mapAuthError = (code?: string) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Email không hợp lệ.';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản.';
    case 'auth/wrong-password':
      return 'Sai mật khẩu.';
    case 'auth/operation-not-allowed':
      return 'Hãy bật Email/Password trong Firebase → Authentication → Sign-in method.';
    case 'auth/network-request-failed':
      return 'Lỗi mạng, vui lòng thử lại.';
    case 'auth/too-many-requests':
      return 'Thử quá nhiều lần, hãy đợi một lúc rồi thử lại.';
    default:
      return `Lỗi: ${code ?? 'không xác định'}`;
  }
};

const [email, setEmail] = useState<string>('');     // tránh undefined
const [password, setPassword] = useState<string>(''); 

const onForgot = async () => {
  const em = (email ?? '').trim();                 // coalesce + trim an toàn
  if (!em) {
    Alert.alert('Thiếu email', 'Nhập email để khôi phục.');
    return;
  }
  try {
    await sendPasswordResetEmail(auth, em);
    Alert.alert('Đã gửi email khôi phục', 'Kiểm tra hộp thư đến / Spam nhé.');
  } catch (e: any) {
    let msg = e?.message ?? 'Không gửi được email khôi phục';
    if (e?.code === 'auth/user-not-found') msg = 'Email chưa được đăng ký.';
    Alert.alert('Lỗi', msg);
  }
};

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Đăng nhập ok -> vào app chính
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e: any) {
      Alert.alert('Đăng nhập thất bại', mapAuthError(e?.code));
      console.log('Login error:', e);
    } finally {
      setLoading(false);
    }
  };
  <TouchableOpacity onPress={onForgot} style={{ marginTop: 12, alignSelf: 'center' }}>
  <Text style={{ color: colors.primary, fontWeight: '700' }}>Quên mật khẩu?</Text>
  </TouchableOpacity>
  const goRegister = () => navigation.navigate('Register');

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Đăng nhập</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor={colors.subtext}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.outline,
            color: colors.text,
          },
        ]}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Mật khẩu"
        secureTextEntry
        placeholderTextColor={colors.subtext}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.outline,
            color: colors.text,
          },
        ]}
      />

      <TouchableOpacity
        onPress={onLogin}
        disabled={loading}
        style={[
          styles.btnPrimary,
          { backgroundColor: colors.primary },
          loading && { opacity: 0.6 },
        ]}
      >
        <Text style={[styles.btnPrimaryText, { color: colors.onPrimary }]}>
          {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.note, { color: colors.subtext }]}>
        Chưa có tài khoản?{' '}
        <Text
          onPress={goRegister}
          style={{ color: colors.primary, fontWeight: '800' }}
        >
          Đăng ký
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  btnPrimary: {
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnPrimaryText: {
    fontWeight: '800',
  },
  note: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
