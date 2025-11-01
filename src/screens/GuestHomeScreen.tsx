import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing } from '../theme';
import AQI, * as Aqi from '../utils/aqi';

type Props = {
  onBackToWelcome: () => void;
};


export default function GuestHomeScreen({ onBackToWelcome }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chế độ Khách</Text>
      <Text style={styles.subtitle}>
        Bạn đang ở màn hình chính (Guest). Sau này sẽ có: xem AQI theo GPS, hướng dẫn xử lý rác,
        báo cáo vi phạm kèm vị trí, v.v.
      </Text>

      <View style={{ height: spacing.xl }} />

      <PrimaryButton label="Quay lại màn hình chào" variant="outline" onPress={onBackToWelcome} />
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
    fontSize: 22,
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
