import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { spacing, radius } from '../theme';
import { auth } from '../services/firebase';
import { listReports } from '../services/reports';
import {
  sendEmailVerification,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

export default function ProfileHomeScreen() {
  const { user, signOut } = useAuth();
  const { colors } = useAppTheme();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [reportsCount, setReportsCount] = useState<number>(0);

  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // load thống kê báo cáo (trên máy)
    (async () => {
      try {
        const list = await listReports();
        setReportsCount(list.length);
      } catch { /* ignore */ }
    })();
  }, []);

  const onSaveName = async () => {
    try {
      if (!auth.currentUser) return;
      setBusy(true);
      await updateProfile(auth.currentUser, { displayName: displayName.trim() || undefined });
      Alert.alert('Thành công', 'Đã cập nhật tên hiển thị.');
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể cập nhật tên.');
    } finally {
      setBusy(false);
    }
  };

  const onVerifyEmail = async () => {
    try {
      if (!auth.currentUser) return;
      await sendEmailVerification(auth.currentUser);
      Alert.alert('Đã gửi email', 'Hãy kiểm tra hộp thư để xác minh email.');
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không gửi được email xác minh.');
    }
  };

  const onChangePassword = async () => {
    if (!auth.currentUser?.email) return Alert.alert('Lỗi', 'Không tìm thấy email tài khoản.');
    if (newPw.length < 6) return Alert.alert('Mật khẩu yếu', 'Mật khẩu phải từ 6 ký tự.');
    try {
      setBusy(true);
      // re-authenticate (Firebase yêu cầu gần đây đăng nhập)
      const cred = EmailAuthProvider.credential(auth.currentUser.email, oldPw);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPw);
      setOldPw(''); setNewPw('');
      Alert.alert('Thành công', 'Đã đổi mật khẩu.');
    } catch (e: any) {
      Alert.alert('Đổi mật khẩu thất bại', e?.message ?? 'Kiểm tra mật khẩu hiện tại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <Text style={[styles.title, { color: colors.text }]}>Hồ sơ</Text>

      {/* Greeting card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.hi, { color: colors.text }]}>
          Xin chào{user?.displayName ? `, ${user.displayName}` : ''}!
        </Text>
        <Text style={{ color: colors.subtext, marginBottom: spacing.sm }}>{user?.email}</Text>

        {!user?.emailVerified && (
          <View style={[styles.banner, { backgroundColor: '#FFF8E1', borderColor: '#FACC15' }]}>
            <Text style={{ color: '#6B4F00', marginRight: spacing.md, flex: 1 }}>
              Email chưa xác minh
            </Text>
            <TouchableOpacity style={[styles.btnMini, { backgroundColor: '#FACC15' }]} onPress={onVerifyEmail}>
              <Text style={{ color: '#1B1B1B', fontWeight: '800' }}>Gửi xác minh</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Personal info */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.section, { color: colors.text }]}>Thông tin cá nhân</Text>
        <Text style={{ color: colors.subtext, marginBottom: 6 }}>Tên hiển thị</Text>
        <View style={[styles.input, { borderColor: colors.outline, backgroundColor: colors.bg }]}>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Ví dụ: Huy"
            placeholderTextColor={colors.subtext}
            style={{ color: colors.text, paddingVertical: 8 }}
          />
        </View>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={onSaveName}
          disabled={busy}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>
            {busy ? 'Đang lưu…' : 'Lưu tên hiển thị'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Security */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.section, { color: colors.text }]}>Bảo mật</Text>
        <Text style={{ color: colors.subtext, marginBottom: 6 }}>Mật khẩu hiện tại</Text>
        <View style={[styles.input, { borderColor: colors.outline, backgroundColor: colors.bg }]}>
          <TextInput
            value={oldPw}
            onChangeText={setOldPw}
            secureTextEntry
            placeholder="••••••"
            placeholderTextColor={colors.subtext}
            style={{ color: colors.text, paddingVertical: 8 }}
          />
        </View>

        <Text style={{ color: colors.subtext, marginBottom: 6 }}>Mật khẩu mới</Text>
        <View style={[styles.input, { borderColor: colors.outline, backgroundColor: colors.bg }]}>
          <TextInput
            value={newPw}
            onChangeText={setNewPw}
            secureTextEntry
            placeholder="Tối thiểu 6 ký tự"
            placeholderTextColor={colors.subtext}
            style={{ color: colors.text, paddingVertical: 8 }}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={onChangePassword}
          disabled={busy}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>
            {busy ? 'Đang đổi…' : 'Đổi mật khẩu'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats & Sign out */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.section, { color: colors.text }]}>Thống kê</Text>
        <Text style={{ color: colors.text }}>
          Báo cáo đã lưu trên máy: <Text style={{ fontWeight: '800' }}>{reportsCount}</Text>
        </Text>
      </View>

      <TouchableOpacity style={[styles.btnGhost, { borderColor: colors.outline, backgroundColor: colors.card }]} onPress={signOut}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Đăng xuất</Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xl }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  title: { fontSize: 22, fontWeight: '900', marginBottom: spacing.md },
  card: {
    borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  hi: { fontSize: 18, fontWeight: '900', marginBottom: spacing.xs },
  banner: {
    marginTop: spacing.md, borderWidth: 1, borderRadius: radius.md,
    paddingVertical: 8, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center',
  },
  btnMini: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: 999 },
  section: { fontSize: 16, fontWeight: '800', marginBottom: spacing.md },
  input: { borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  btn: { alignItems: 'center', paddingVertical: 12, borderRadius: radius.xl },
  btnGhost: { alignItems: 'center', paddingVertical: 12, borderRadius: radius.xl, borderWidth: 1 },
});
