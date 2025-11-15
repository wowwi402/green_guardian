import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../services/firebase';
import { useAppTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme';

export default function RegisterScreen() {
  const nav = useNavigation<any>();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  const onSignUp = async () => {
    if (!email.trim() || !pw) { Alert.alert('Thiếu thông tin', 'Nhập email & mật khẩu.'); return; }
    if (pw !== pw2) { Alert.alert('Lỗi', 'Mật khẩu nhập lại không khớp.'); return; }
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), pw);
      Alert.alert('Thành công', 'Tạo tài khoản thành công!'); // RootNavigator sẽ tự chuyển sang MainTabs
    } catch (e: any) {
      Alert.alert('Đăng ký thất bại', e?.message ?? 'Không rõ lỗi');
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Đăng ký</Text>

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
        placeholder="Mật khẩu (≥ 6 ký tự)"
        placeholderTextColor={colors.subtext}
        secureTextEntry
        value={pw}
        onChangeText={setPw}
        style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.card }]}
      />

      <TextInput
        placeholder="Nhập lại mật khẩu"
        placeholderTextColor={colors.subtext}
        secureTextEntry
        value={pw2}
        onChangeText={setPw2}
        style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.card }]}
      />

      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={onSignUp}>
        <Text style={[styles.btnText, { color: colors.onPrimary }]}>Tạo tài khoản</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => nav.goBack()} style={{ marginTop: spacing.md, alignSelf: 'center' }}>
        <Text style={{ color: (colors as any).link ?? colors.primary, fontWeight: '700' }}>Quay lại đăng nhập</Text>
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
