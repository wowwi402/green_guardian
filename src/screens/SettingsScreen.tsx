import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { spacing, radius } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';

const PALETTE = ['#62E39A', '#4CC9F0', '#FFB703', '#F25F5C', '#8E44AD', '#27AE60', '#E67E22'];

export default function SettingsScreen() {
  const { settings, colors, setMode, setPrimary } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.section, { color: colors.text }]}>Chế độ giao diện</Text>
      <View style={styles.row}>
        <Text style={{ color: colors.text, flex: 1 }}>Sáng/Tối</Text>
        <Switch
          value={settings.mode === 'dark'}
          onValueChange={(v) => setMode(v ? 'dark' : 'light')}
        />
      </View>

      <Text style={[styles.section, { color: colors.text, marginTop: spacing.xl }]}>Màu chủ đạo</Text>
      <View style={styles.paletteRow}>
        {PALETTE.map((hex) => {
          const active = hex.toLowerCase() === settings.primary.toLowerCase();
          return (
            <TouchableOpacity
              key={hex}
              style={[
                styles.swatch,
                { backgroundColor: hex, borderColor: active ? colors.text : 'transparent' },
              ]}
              onPress={() => setPrimary(hex)}
              activeOpacity={0.8}
            />
          );
        })}
      </View>

      <View style={{ height: spacing.xl }} />
      <Text style={{ color: colors.subtext }}>
        * Header, thanh tab và các nút chính sẽ phản ứng ngay với cài đặt này.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  section: { fontSize: 18, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  paletteRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
  swatch: {
    width: 36, height: 36, borderRadius: radius.lg, marginRight: spacing.md, marginBottom: spacing.md,
    borderWidth: 2,
  },
});
