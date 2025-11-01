import React, { useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, FlatList } from 'react-native';
import { colors, spacing } from '../theme';
import { ARTICLES } from '../data/articles';
import ArticleCard from '../components/ArticleCard';

export default function KnowledgeListScreen({ navigation }: any) {
  const [q, setQ] = useState('');
  const data = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return ARTICLES;
    return ARTICLES.filter(a =>
      a.title.toLowerCase().includes(k) ||
      a.summary.toLowerCase().includes(k) ||
      a.tags.some(t => t.toLowerCase().includes(k))
    );
  }, [q]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Tìm kiếm (tiêu đề, tag)…"
        placeholderTextColor={colors.subtext}
        style={styles.input}
        value={q}
        onChangeText={setQ}
      />
      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <ArticleCard item={item} onPress={() => navigation.navigate('ArticleDetail', { article: item })} />
        )}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:colors.bg, padding:spacing.xl },
  input:{ borderWidth:1,borderColor:colors.outline,borderRadius:12,paddingHorizontal:spacing.lg,paddingVertical:10,color:colors.text, marginBottom:spacing.lg, backgroundColor:colors.card },
});
