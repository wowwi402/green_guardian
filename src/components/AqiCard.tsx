import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, radius } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';

function withAlpha(hex: string, alpha: number) {
  // hex "#RRGGBB", alpha 0..1  →  "#RRGGBBAA"
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return hex.length === 7 ? `${hex}${a}` : hex;
}

export default function AqiCard({
  title = 'Chỉ số AQI',
  aqi,
  category,
  color,
  subtitle,
  note,
}: {
  title?: string;
  aqi: number;
  category: string;
  color: string;
  subtitle?: string;
  note?: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: withAlpha(color, 0.35),
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sub, { color: colors.subtext }]}>{subtitle}</Text> : null}

      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: withAlpha(color, 0.15), borderColor: withAlpha(color, 0.4) }]}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {aqi} — {category}
          </Text>
        </View>
      </View>

      {note ? <Text style={[styles.note, { color: colors.subtext }]}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  title: { fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },
  sub: { marginTop: 6, fontSize: 12 },
  row: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  dot: { width: 8, height: 8, borderRadius: 99, marginRight: 8 },
  badgeText: { fontWeight: '800' },
  note: { marginTop: spacing.md, lineHeight: 20 },
});
