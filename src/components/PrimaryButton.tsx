import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radius } from '../theme';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outline';
  style?: ViewStyle;
};

export default function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'filled',
  style,
}: Props) {
  const isFilled = variant === 'filled';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        isFilled ? styles.filled : styles.outline,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.text, !isFilled && { color: colors.primary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: colors.primary,
  },
  outline: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  text: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '700',
  },
});
