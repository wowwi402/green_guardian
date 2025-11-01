import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../theme';
import TagChip from './TagChip';
import type { Article } from '../data/articles';

export default function ArticleCard({ item, onPress }: { item: Article; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.summary}>{item.summary}</Text>
      <View style={styles.tagsRow}>{item.tags.map(t => <TagChip key={t} label={t} />)}</View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card:{ backgroundColor:colors.card,borderRadius:radius.lg,padding:spacing.xl,marginBottom:spacing.lg,borderWidth:1,borderColor:colors.outline },
  title:{ color:colors.text,fontWeight:'800',fontSize:16,marginBottom:6 },
  summary:{ color:colors.subtext,lineHeight:20 },
  tagsRow:{ flexDirection:'row',flexWrap:'wrap',marginTop:8 },
});
