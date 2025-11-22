// src/screens/KnowledgeScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { spacing, radius } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';
import * as K from '../services/knowledge';
import type { KnowledgeArticle } from '../data/knowledge';
import { useNavigation } from '@react-navigation/native';

const CATEGORIES: Array<KnowledgeArticle['category'] | 'Tất cả' | 'Yêu thích'> = [
  'Tất cả', 'Yêu thích', 'AQI', 'Sức khỏe', 'Tái chế', 'Mẹo sống xanh', 'Chuẩn & khuyến nghị'
];

export default function KnowledgeScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();

  const [q, setQ] = useState('');
  const [tab, setTab] = useState<(typeof CATEGORIES)[number]>('Tất cả');
  const [data, setData] = useState<KnowledgeArticle[]>([]);
  const [fav, setFav] = useState<Set<string>>(new Set());

  useEffect(() => {
    setData(K.listAll());
    K.getFavorites().then(setFav);
  }, []);

  const list = useMemo(() => {
    const norm = (s: string) => s.toLowerCase();
    const all = data.filter(a => {
      const inCat = tab === 'Tất cả'
        ? true
        : tab === 'Yêu thích'
          ? fav.has(a.id)
          : a.category === tab;
      if (!inCat) return false;

      if (!q.trim()) return true;
      const qq = norm(q);
      return norm(a.title).includes(qq) ||
             norm(a.summary).includes(qq) ||
             a.tags.some(t => norm(t).includes(qq));
    });
    // ưu tiên yêu thích trên cùng
    return all.sort((x, y) => Number(fav.has(y.id)) - Number(fav.has(x.id)));
  }, [data, q, tab, fav]);

  const onToggleFav = async (id: string) => {
    const now = await K.toggleFavorite(id);
    setFav(prev => {
      const n = new Set(prev);
      if (now) n.add(id); else n.delete(id);
      return n;
    });
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Search */}
      <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Ionicons name="search" size={16} color={colors.subtext} style={{ marginRight: 8 }} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Tìm bài viết, thẻ, chủ đề…"
          placeholderTextColor={colors.subtext}
          style={{ color: colors.text, flex: 1, paddingVertical: 8 }}
        />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
          {CATEGORIES.map(c => {
            const active = tab === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setTab(c)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.outline,
                  },
                ]}
              >
                <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '800' }}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* List */}
      <ScrollView style={{ marginTop: spacing.md }}>
        {list.map(a => (
          <TouchableOpacity
            key={a.id}
            onPress={() => nav.navigate('KnowledgeDetail', { id: a.id })}
            style={[styles.item, { borderColor: colors.outline, backgroundColor: colors.card }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: '700' }}>{a.category}</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '900', marginTop: 2 }}>{a.title}</Text>
              <Text style={{ color: colors.subtext, marginTop: 4 }} numberOfLines={2}>{a.summary}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {a.tags.map(t => (
                  <View key={t} style={[styles.tag, { borderColor: colors.outline, backgroundColor: colors.bg }]}>
                    <Text style={{ color: colors.subtext, fontSize: 11 }}>#{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={() => onToggleFav(a.id)} hitSlop={10} style={{ marginLeft: spacing.md }}>
              <Ionicons
                name={fav.has(a.id) ? 'heart' : 'heart-outline'}
                size={22}
                color={fav.has(a.id) ? '#E11D48' : colors.subtext}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {list.length === 0 && (
          <Text style={{ color: colors.subtext, textAlign: 'center', marginTop: spacing.lg }}>
            Không có bài nào khớp bộ lọc/từ khóa.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
  },
  item: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tag: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
});
