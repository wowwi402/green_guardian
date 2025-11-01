import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '../theme';
import TagChip from '../components/TagChip';
import type { Article } from '../data/articles';

export default function KnowledgeDetailScreen({ route }: any) {
  const article = route.params.article as Article;
  const paragraphs = article.content.split('\n\n');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <Text style={styles.title}>{article.title}</Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap', marginTop:6 }}>
        {article.tags.map(t => <TagChip key={t} label={t} />)}
      </View>
      <View style={{ height: spacing.lg }} />
      {paragraphs.map((p, i) => <Text key={i} style={styles.body}>{p}</Text>)}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:colors.bg, padding:spacing.xl },
  title:{ color:colors.text, fontSize:22, fontWeight:'800' },
  body:{ color:colors.subtext, marginTop:spacing.md, lineHeight:22 },
});
