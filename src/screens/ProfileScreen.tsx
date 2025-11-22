import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  sendEmailVerification,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
} from 'firebase/auth';

import { auth } from '../services/firebase';
import { listReports } from '../services/reports';
import { useAppTheme } from '../theme/ThemeProvider';
import { spacing, radius } from '../theme';
import { useNavigation } from '@react-navigation/native';

// Bảng màu cảnh báo/nguy hiểm (fallback độc lập theme)
const useLocalPalette = (colors: any) => ({
  warnBg:  colors?.warnBg  ?? '#FEF3C7', // amber-100
  warn:    colors?.warn    ?? '#F59E0B', // amber-500
  warnText:colors?.warnText?? '#92400E', // amber-800
  onWarn:  colors?.onWarn  ?? '#111827', // gray-900
  danger:  colors?.danger  ?? '#EF4444', // red-500
  onDanger:colors?.onDanger?? '#FFFFFF', // white
});

// Màu chủ đạo gợi ý
const PRIMARY_PRESETS = [
  { hex: '#16A34A', name: 'Green' },
  { hex: '#0EA5E9', name: 'Sky' },
  { hex: '#8B5CF6', name: 'Violet' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#E11D48', name: 'Rose' },
  { hex: '#0D9488', name: 'Teal' },
];

export default function ProfileScreen() {
  const { colors, settings, setMode, setPrimary } = useAppTheme();
  const p = useLocalPalette(colors);
  const nav = useNavigation<any>();
  const user = auth.currentUser;

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [savingName, setSavingName] = useState(false);

  const [verifySending, setVerifySending] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const [reportCount, setReportCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listReports();
        if (mounted) setReportCount(data.length);
      } catch {
        if (mounted) setReportCount(0);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const email = user?.email ?? '';
  const verified = !!user?.emailVerified;

  const greeting = useMemo(() => {
    const name = user?.displayName || email?.split('@')[0] || 'bạn';
    return `Xin chào, ${name}!`;
  }, [user?.displayName, email]);

  const onSendVerify = async () => {
    if (!user) return;
    try {
      setVerifySending(true);
      await sendEmailVerification(user);
      Alert.alert('Đã gửi email xác minh', 'Vui lòng kiểm tra hộp thư của bạn.');
    } catch (e: any) {
      Alert.alert('Gửi xác minh thất bại', e?.message ?? 'Có lỗi xảy ra.');
      console.log('sendEmailVerification error', e);
    } finally {
      setVerifySending(false);
    }
  };

  const onSaveName = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      Alert.alert('Thiếu tên hiển thị', 'Vui lòng nhập tên hiển thị.');
      return;
    }
    try {
      setSavingName(true);
      await updateProfile(user, { displayName: displayName.trim() });
      Alert.alert('Đã lưu', 'Tên hiển thị đã được cập nhật.');
    } catch (e: any) {
      Alert.alert('Lưu thất bại', e?.message ?? 'Có lỗi xảy ra.');
      console.log('updateProfile error', e);
    } finally {
      setSavingName(false);
    }
  };

  const onChangePassword = async () => {
    if (!user?.email) {
      Alert.alert('Không thể đổi mật khẩu', 'Tài khoản hiện tại không có email.');
      return;
    }
    if (newPw.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu mới tối thiểu 6 ký tự.');
      return;
    }
    try {
      setChangingPw(true);
      const cred = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPw);
      setCurrentPw('');
      setNewPw('');
      setPwOpen(false);
      Alert.alert('Thành công', 'Mật khẩu đã được đổi.');
    } catch (e: any) {
      Alert.alert('Đổi mật khẩu thất bại', e?.message ?? 'Có lỗi xảy ra.');
      console.log('change password error', e);
    } finally {
      setChangingPw(false);
    }
  };

  const onSignOut = async () => {
    try {
      await signOut(auth);
      nav.reset({ index: 0, routes: [{ name: 'AuthFlow' }] });
    } catch (e: any) {
      Alert.alert('Đăng xuất thất bại', e?.message ?? 'Có lỗi xảy ra.');
    }
  };

  const bgColor = (colors as any).bgSoft || colors.bg;

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: bgColor }]}>

      {/* Card: tài khoản */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.h1, { color: colors.text }]}>{greeting}</Text>
        <Text style={{ color: colors.subtext, marginTop: 4 }}>{email}</Text>

        {!verified && (
          <View style={[styles.banner, { backgroundColor: p.warnBg, borderColor: p.warn }]}>
            <Text style={{ color: p.warnText, flex: 1 }}>Email chưa xác minh</Text>
            <TouchableOpacity
              style={[styles.btnSm, { backgroundColor: p.warn }]}
              onPress={onSendVerify}
              disabled={verifySending}
            >
              <Text style={[styles.btnSmText, { color: p.onWarn }]}>
                {verifySending ? 'Đang gửi…' : 'Gửi xác minh'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Card: GIAO DIỆN (mới) */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.h2, { color: colors.text }]}>Giao diện</Text>

        {/* Chế độ Sáng / Tối */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => setMode('light')}
            style={[
              styles.modeBtn,
              { borderColor: colors.outline, backgroundColor: settings.mode === 'light' ? colors.primary : colors.card },
            ]}
          >
            <Text style={{ color: settings.mode === 'light' ? colors.onPrimary : colors.text, fontWeight: '800' }}>
              Sáng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode('dark')}
            style={[
              styles.modeBtn,
              { borderColor: colors.outline, backgroundColor: settings.mode === 'dark' ? colors.primary : colors.card },
            ]}
          >
            <Text style={{ color: settings.mode === 'dark' ? colors.onPrimary : colors.text, fontWeight: '800' }}>
              Tối
            </Text>
          </TouchableOpacity>
        </View>

        {/* Màu chủ đạo */}
        <Text style={[styles.label, { color: colors.subtext, marginTop: spacing.md }]}>Màu chủ đạo</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
          {PRIMARY_PRESETS.map(preset => {
            const active = preset.hex.toLowerCase() === settings.primary.toLowerCase();
            return (
              <TouchableOpacity
                key={preset.hex}
                onPress={() => setPrimary(preset.hex)}
                style={[
                  styles.colorChip,
                  {
                    borderColor: active ? preset.hex : colors.outline,
                    backgroundColor: active ? preset.hex : colors.bg,
                  },
                ]}
              >
                <View style={[styles.colorDot, { backgroundColor: preset.hex }]} />
                <Text style={{ color: active ? '#FFFFFF' : colors.text, fontWeight: '800' }}>
                  {preset.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Card: thông tin cá nhân */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.h2, { color: colors.text }]}>Thông tin cá nhân</Text>

        <Text style={[styles.label, { color: colors.subtext }]}>Tên hiển thị</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Nhập tên hiển thị"
          placeholderTextColor={colors.subtext}
          style={[
            styles.input,
            { backgroundColor: colors.bg, borderColor: colors.outline, color: colors.text },
          ]}
        />

        <TouchableOpacity
          onPress={onSaveName}
          disabled={savingName}
          style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.btnPrimaryText, { color: colors.onPrimary }]}>
            {savingName ? 'Đang lưu…' : 'Lưu tên hiển thị'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card: bảo mật */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.h2, { color: colors.text }]}>Bảo mật</Text>

        {!pwOpen ? (
          <TouchableOpacity
            onPress={() => setPwOpen(true)}
            style={[styles.rowBtn, { borderColor: colors.outline }]}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>Đổi mật khẩu</Text>
            <Text style={{ color: colors.subtext }}>Nhấn để mở</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={[styles.label, { color: colors.subtext }]}>Mật khẩu hiện tại</Text>
            <TextInput
              value={currentPw}
              onChangeText={setCurrentPw}
              placeholder="********"
              placeholderTextColor={colors.subtext}
              secureTextEntry
              style={[
                styles.input,
                { backgroundColor: colors.bg, borderColor: colors.outline, color: colors.text },
              ]}
            />

            <Text style={[styles.label, { color: colors.subtext }]}>Mật khẩu mới</Text>
            <TextInput
              value={newPw}
              onChangeText={setNewPw}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor={colors.subtext}
              secureTextEntry
              style={[
                styles.input,
                { backgroundColor: colors.bg, borderColor: colors.outline, color: colors.text },
              ]}
            />

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity
                onPress={() => { setPwOpen(false); setCurrentPw(''); setNewPw(''); }}
                style={[styles.btnGhost, { borderColor: colors.outline }]}
              >
                <Text style={{ color: colors.text, fontWeight: '800' }}>Huỷ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onChangePassword}
                disabled={changingPw}
                style={[styles.btnPrimary, { backgroundColor: colors.primary, flex: 1 }]}
              >
                <Text style={[styles.btnPrimaryText, { color: colors.onPrimary }]}>
                  {changingPw ? 'Đang đổi…' : 'Đổi mật khẩu'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Card: thống kê */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.h2, { color: colors.text }]}>Thống kê</Text>
        <View style={styles.kpiRow}>
          <View style={[styles.kpi, { backgroundColor: colors.bg }]}>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{reportCount ?? '—'}</Text>
            <Text style={{ color: colors.subtext }}>Báo cáo của tôi</Text>
          </View>
        </View>
      </View>

      {/* Card: đăng xuất */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <TouchableOpacity onPress={onSignOut} style={[styles.btnDanger, { backgroundColor: p.danger }]}>
          <Text style={[styles.btnPrimaryText, { color: p.onDanger }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  card: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  h1: { fontSize: 20, fontWeight: '900' },
  h2: { fontSize: 16, fontWeight: '900', marginBottom: spacing.md },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  label: { fontSize: 12, fontWeight: '700', marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginTop: spacing.sm,
  },
  rowBtn: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnPrimary: {
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnGhost: {
    flex: 1,
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: spacing.md,
  },
  btnDanger: {
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSm: { borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 8 },
  btnSmText: { fontWeight: '800' },
  btnPrimaryText: { fontWeight: '800' },
  kpiRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  kpi: { flex: 1, borderRadius: radius.lg, padding: spacing.md },
  kpiValue: { fontSize: 22, fontWeight: '900', marginBottom: 2 },

  // Giao diện
  modeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingVertical: 12,
    alignItems: 'center',
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  colorDot: { width: 14, height: 14, borderRadius: 99 },
});
