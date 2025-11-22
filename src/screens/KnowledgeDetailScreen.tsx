// src/screens/KnowledgeDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Share } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { spacing, radius } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';
import * as K from '../services/knowledge';
import type { KnowledgeArticle } from '../data/knowledge';

type Params = { KnowledgeDetail: { id: string } };

export default function KnowledgeDetailScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<Params, 'KnowledgeDetail'>>();

  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const id = route.params?.id;
    const a = id ? K.getById(id) : undefined;
    if (a) {
      setArticle(a);
      nav.setOptions({ headerShown: true, title: a.title });
      K.isFavorite(a.id).then(setFav);
    } else {
      nav.goBack();
    }
  }, [route.params?.id]);

  if (!article) return null;

  const onFav = async () => {
    const now = await K.toggleFavorite(article.id);
    setFav(now);
  };

  const onShare = () => {
    Share.share({
      title: article.title,
      message: `${article.title}\n\n${article.summary}\n\n#GreenGuardian`,
    }).catch(() => {});
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.head, { borderColor: colors.outline, backgroundColor: colors.card }]}>
        <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: '700' }}>{article.category}</Text>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{article.title}</Text>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {article.tags.map(t => (
            <View key={t} style={[styles.tag, { borderColor: colors.outline, backgroundColor: colors.bg }]}>
              <Text style={{ color: colors.subtext, fontSize: 11 }}>#{t}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
          <TouchableOpacity onPress={onFav} style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.outline }]}>
            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={18} color={fav ? '#E11D48' : colors.text} />
            <Text style={{ color: colors.text, fontWeight: '800', marginLeft: 8 }}>{fav ? 'Bỏ yêu thích' : 'Yêu thích'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare} style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.outline }]}>
            <Ionicons name="share-social-outline" size={18} color={colors.text} />
            <Text style={{ color: colors.text, fontWeight: '800', marginLeft: 8 }}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ padding: spacing.xl }}>
        {article.content.split('\n').map((line, i) =>
          line.trim().length === 0 ? <View key={i} style={{ height: 8 }} /> :
          <Text key={i} style={{ color: colors.text, lineHeight: 22 }}>{line}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: {
    margin: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  tag: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  btn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.lg, borderWidth: 1,
    paddingVertical: 8, paddingHorizontal: spacing.md,
  },
});
