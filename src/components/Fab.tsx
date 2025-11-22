import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeProvider';

type Props = { onPress: () => void; icon?: keyof typeof Ionicons.glyphMap; style?: ViewStyle; label?: string };

export default function Fab({ onPress, icon = 'add', style, label }: Props) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.fab, { backgroundColor: colors.primary }, style]}>
      <Ionicons name={icon as any} size={22} color={colors.onPrimary} />
      {label ? <Text style={[styles.label, { color: colors.onPrimary }]}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', right: 20, bottom: 24, borderRadius: 28, height: 56, paddingHorizontal: 16,
         alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, elevation: 4 },
  label: { fontWeight: '800' },
});
