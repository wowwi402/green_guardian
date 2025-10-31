import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing } from '../theme';

type Props = {
  onContinueGuest: () => void;
};

export default function WelcomeScreen({ onContinueGuest }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Green Guardian 🌿</Text>
      <Text style={styles.subtitle}>
        Ứng dụng bảo vệ môi trường — bắt đầu với chế độ Khách để khám phá nhanh.
      </Text>

      <View style={{ height: spacing.xl }} />

      <PrimaryButton label="Tiếp tục với tư cách Khách" onPress={onContinueGuest} />

      <View style={{ height: spacing.lg }} />

      <PrimaryButton label="Đăng nhập / Đăng ký (sau)" variant="outline" />
      {/* Nút này tạm thời chưa làm, để placeholder cho tương lai */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.subtext,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 20,
  },
});
