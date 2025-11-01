import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

type Props = {
  title?: string;
  aqi: number;
  category: string;
  color: string;
  subtitle?: string;
  note?: string;
};

export default function AqiCard({
  title = 'Chỉ số AQI',
  aqi,
  category,
  color,
  subtitle,
  note,
}: Props) {
  return (
    <View style={[styles.card, { borderColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {/* Hàng hiển thị số AQI – PHẢI bọc trong <Text> */}
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: color }]} />
        <Text style={styles.aqiText}>
          {aqi} — {category}
        </Text>
      </View>

      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.xl,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  subtitle: { color: colors.subtext, marginTop: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  badge: { width: 16, height: 16, borderRadius: 999, marginRight: spacing.md },
  aqiText: { color: colors.text, fontSize: 24, fontWeight: '900' },
  note: { color: colors.subtext, marginTop: spacing.md, lineHeight: 20 },
});
