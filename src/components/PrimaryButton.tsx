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
      : { backgroundColor: 'transparent', borderColor: colors.outline },
    disabled && { opacity: 0.6 },
    style,
  ];
  return (
    <TouchableOpacity style={base} onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <Text style={[styles.text, { color: variant === 'solid' ? colors.bg : colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  text: { fontWeight: '700' },
});
