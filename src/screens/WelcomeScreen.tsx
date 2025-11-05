import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthProvider';
import { colors, spacing, radius } from '../theme';

const ONBOARDED_KEY = 'gg:onboarded:v1';

export default function WelcomeScreen() {
  const nav = useNavigation<any>();
  const { signInGuest } = useAuth();

  const goLogin = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, '1');
    nav.reset({ index: 0, routes: [{ name: 'AuthFlow' }] });
  };

  const goGuest = async () => {
    await signInGuest();
    await AsyncStorage.setItem(ONBOARDED_KEY, '1');
    nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <View style={[styles.wrap]}>
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <Image source={require('../../assets/icon.png')}
               style={{ width: 120, height: 120, borderRadius: 24 }} />
        <Text style={styles.title}>Green Guardian</Text>
        <Text style={styles.sub}>Ứng dụng xanh hoá cuộc sống: theo dõi chất lượng không khí, bản đồ điểm xanh và báo cáo ô nhiễm.</Text>
      </View>

      <View style={{ height: spacing.lg }} />

      <TouchableOpacity style={[styles.btnPrimary]} onPress={goGuest}>
        <Text style={styles.btnPrimaryText}>Tiếp tục với tư cách Khách</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btnGhost]} onPress={goLogin}>
        <Text style={styles.btnGhostText}>Đăng nhập / Đăng ký</Text>
      </TouchableOpacity>

      <Text style={styles.note}>Bạn có thể chuyển sang đăng nhập sau trong tab Hồ sơ.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginTop: spacing.md },
  sub: { color: colors.subtext, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  btnPrimary: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.xl, alignItems: 'center' },
  btnPrimaryText: { color: colors.onPrimary, fontWeight: '800' },
  btnGhost: {
    marginTop: spacing.md, borderRadius: radius.xl, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.card
  },
  btnGhostText: { color: colors.text, fontWeight: '800' },
  note: { textAlign: 'center', color: colors.subtext, marginTop: spacing.md }
});
