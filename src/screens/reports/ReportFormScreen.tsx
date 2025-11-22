import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';
import {
  getReport,
  updateReport,
  CATEGORIES,
  type Category,
  type Report,
} from '../../services/reports';

type RouteParams = { id?: string };

export default function ReportFormScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useAppTheme();

  const id: string | undefined = (route.params as RouteParams | undefined)?.id;

  // ----- local state (QUAN TRỌNG: có category/description) -----
  const [report, setReport] = useState<Report | null>(null);
  const [category, setCategory] = useState<Category>('khác');
  const [description, setDescription] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // ----- load bản ghi khi có id -----
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      const r = await getReport(id);
      if (mounted && r) {
        setReport(r);
        setCategory(r.category);
        setDescription(r.description ?? '');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // ----- Save -----
  const onSave = async () => {
    try {
      if (!id) {
        Alert.alert('Thiếu ID', 'Không tìm thấy báo cáo để cập nhật.');
        return;
      }
      setSaving(true);
      // category/description lấy từ state ở trên → KHÔNG còn lỗi undefined
      await updateReport(id, { category, description });
      Alert.alert('Đã lưu', 'Báo cáo đã được cập nhật.');
      nav.goBack();
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không cập nhật được báo cáo.');
    } finally {
      setSaving(false);
    }
  };

  // ----- nút Lưu trên header -----
  useLayoutEffect(() => {
    nav.setOptions({
      headerTitle: 'Chỉnh sửa báo cáo',
      headerRight: () => (
        <TouchableOpacity
          onPress={onSave}
          disabled={saving}
          accessibilityLabel="Lưu"
          style={{ paddingHorizontal: 8, paddingVertical: 6 }}
        >
          <Text style={{ color: colors.link ?? colors.primary, fontWeight: '800' }}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [colors.link, colors.primary, saving, category, description]);

  // ----- UI -----
  return (
    <ScrollView style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Category */}
      <Text style={[styles.label, { color: colors.subtext }]}>Loại</Text>
      <View style={styles.chipsRow}>
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(c)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.outline,
                },
              ]}
            >
              <Text
                style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '800' }}
              >
                {c.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Description */}
      <Text style={[styles.label, { color: colors.subtext }]}>Mô tả</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Mô tả ngắn gọn tình trạng…"
        placeholderTextColor={colors.subtext}
        multiline
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.card,
            borderColor: colors.outline,
          },
        ]}
      />

      {/* Nút Lưu dự phòng (nếu không muốn bấm trên header) */}
      <TouchableOpacity
        onPress={onSave}
        disabled={saving}
        style={[styles.btn, { backgroundColor: colors.primary }]}
      >
        <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>
          {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl },
  label: { fontSize: 12, fontWeight: '700', marginTop: spacing.md },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    minHeight: 90,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  btn: {
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
    paddingVertical: 14,
  },
});
