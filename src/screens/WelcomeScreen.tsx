// src/screens/WelcomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { spacing } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';
import { useAuth } from '../auth/AuthProvider';

export default function WelcomeScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const { continueAsGuest, signInMock } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Green Guardian 🌿</Text>
      <Text style={{ color: colors.subtext, marginTop: spacing.sm, textAlign: 'center' }}>
        Ứng dụng bảo vệ môi trường — bắt đầu với chế độ Khách để khám phá nhanh.
      </Text>

      <View style={{ height: spacing.xl * 1.5 }} />

      <PrimaryButton label="Tiếp tục với tư cách Khách" onPress={continueAsGuest} />

      <View style={{ height: spacing.md }} />
      <PrimaryButton
        label="Đăng nhập / Đăng ký (sau)"
        variant="outline"
        onPress={() => navigation.navigate('Login')}
      />

      <View style={{ height: spacing.xl }} />
      <Text style={{ color: colors.subtext, fontSize: 12 }}>
        (Demo: màn hình Login phía sau chỉ là mock — bấm đăng nhập để vào app)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '900' },
});
