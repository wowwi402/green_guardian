import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';
import { CATEGORIES, createReport, getReport, updateReport, type Category } from '../../services/reports';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';

type Params = { id?: string; fromFab?: boolean };

export default function ReportFormScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const { params } = useRoute<any>() as { params: Params };
  const id = params?.id;
  const fromFab = !!params?.fromFab;

  const { coords } = useCurrentLocation();
  const [category, setCategory] = useState<Category>('rác');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const r = await getReport(id);
      if (r) {
        setCategory(r.category);
        setDescription(r.description);
        setPhotoUri(r.photoUri);
      }
    })();
  }, [id]);

  const title = useMemo(() => (id ? 'Sửa báo cáo' : 'Báo cáo mới'), [id]);

  useLayoutEffect(() => {
    nav.setOptions?.({
      title,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            if (nav.canGoBack()) nav.goBack();
            else if (fromFab) nav.navigate('MainTabs', { screen: 'Home' });
            else nav.navigate('MainTabs', { screen: 'Profile' });
          }}
          style={{ paddingHorizontal: 8, paddingVertical: 6 }}
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [colors.text, fromFab, nav, title]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8,
    });
    if (!res.canceled && res.assets?.length) setPhotoUri(res.assets[0].uri);
  };

  const onSave = async () => {
    try {
      setSaving(true);
      if (id) {
        await updateReport(id, { category, description, photoUri: photoUri ?? undefined });
        Alert.alert('Đã lưu', 'Báo cáo đã được cập nhật.');
      } else {
        if (!photoUri) { Alert.alert('Thiếu ảnh', 'Hãy chọn 1 bức ảnh.'); return; }
        await createReport(
          { category, description, latitude: coords?.latitude, longitude: coords?.longitude },
          photoUri
        );
        Alert.alert('Thành công', 'Đã tạo báo cáo mới.');
      }
      // quay lại hợp lý
      if (nav.canGoBack()) nav.goBack();
      else if (fromFab) nav.navigate('MainTabs', { screen: 'Home' });
      else nav.navigate('MainTabs', { screen: 'Profile' });
    } catch (e: any) {
      Alert.alert('Lưu thất bại', e?.message ?? 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <TouchableOpacity onPress={pickImage} style={[styles.imageBox, { borderColor: colors.outline, backgroundColor: colors.card }]}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', borderRadius: radius.lg }} />
        ) : (
          <Text style={{ color: colors.subtext }}>Nhấn để chọn ảnh…</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.subtext }]}>Loại vi phạm</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(c)}
              style={[
                styles.chip,
                { borderColor: active ? colors.primary : colors.outline, backgroundColor: active ? colors.primary : colors.card },
              ]}
            >
              <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '700' }}>{c.toUpperCase()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.label, { color: colors.subtext }]}>Mô tả</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Mô tả ngắn…"
        placeholderTextColor={colors.subtext}
        multiline
        style={[styles.input, { borderColor: colors.outline, backgroundColor: colors.card, color: colors.text }]}
      />

      <TouchableOpacity onPress={onSave} disabled={saving} style={[styles.btn, { backgroundColor: colors.primary }]}>
        <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>{saving ? 'Đang lưu…' : 'Lưu'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl },
  title: { fontSize: 20, fontWeight: '900', marginBottom: spacing.lg },
  imageBox: { height: 180, borderWidth: 1, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: '700', marginTop: spacing.md },
  chip: { borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: spacing.md },
  input: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, minHeight: 80, textAlignVertical: 'top' },
  btn: { marginTop: spacing.lg, borderRadius: radius.xl, alignItems: 'center', paddingVertical: 14 },
});
