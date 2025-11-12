import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { colors, spacing, radius } from '../../theme';
import { useNavigation } from '@react-navigation/native';

const mapAuthError = (code?: string) => {
  switch (code) {
    case 'auth/operation-not-allowed': return 'Hãy bật Email/Password trong Firebase → Authentication → Sign-in method.';
    case 'auth/email-already-in-use': return 'Email đã được sử dụng.';
    case 'auth/invalid-email': return 'Email không hợp lệ.';
    case 'auth/weak-password': return 'Mật khẩu quá yếu (≥ 6 ký tự).';
    default: return `Lỗi: ${code ?? 'không xác định'}`;
  }
};

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert('Thành công', 'Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Đăng ký thất bại', mapAuthError(e?.code));
      console.log('Register error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Đăng ký</Text>

      <TextInput value={email} onChangeText={setEmail} placeholder="Email"
        autoCapitalize="none" keyboardType="email-address" style={styles.input} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Mật khẩu"
        secureTextEntry style={styles.input} />

      <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={onRegister} disabled={loading}>
        <Text style={styles.btnTxt}>{loading ? 'Đang tạo…' : 'Đăng ký'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.outline,
    borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 12,
    color: colors.text, marginBottom: spacing.md
  },
  btn: { backgroundColor: colors.primary, borderRadius: radius.xl, alignItems: 'center', paddingVertical: 14 },
  btnTxt: { color: colors.onPrimary, fontWeight: '800' },
});
