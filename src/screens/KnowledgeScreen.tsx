import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function KnowledgeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thư viện kiến thức</Text>
      <Text style={styles.text}>
        Bài viết, mẹo phân loại rác, tái chế, tiết kiệm năng lượng…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  text: { color: colors.subtext, lineHeight: 20 },
});
