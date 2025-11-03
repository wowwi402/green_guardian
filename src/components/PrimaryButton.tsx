import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { spacing, radius } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';

export default function PrimaryButton({
  label,
  onPress,
  variant = 'solid',
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const { colors } = useAppTheme();
  const base = [
    styles.btn,
    variant === 'solid'
      ? { backgroundColor: colors.primary, borderColor: colors.primary }
      : { backgroundColor: colors.card, borderColor: colors.outline },
    disabled && { opacity: 0.6 },
    style,
  ];

  return (
    <TouchableOpacity style={base} onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <Text style={[styles.text, { color: variant === 'solid' ? colors.onPrimary : colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    // shadow nhẹ (iOS) / elevation (Android)
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  text: { fontWeight: '700', letterSpacing: 0.2 },
});
