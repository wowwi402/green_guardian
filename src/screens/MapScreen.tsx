import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bản đồ</Text>
      <Text style={styles.text}>Sau này sẽ hiển thị vị trí, AQI quanh bạn và điểm gom rác.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  text: { color: colors.subtext, lineHeight: 20 },
});
