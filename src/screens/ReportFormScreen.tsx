import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PrimaryButton from '../components/PrimaryButton';
import { spacing, radius } from '../theme';
import { useAppTheme } from '../theme/ThemeProvider';
import { CATEGORIES, type Category, createReport, updateReport, getReport } from '../services/reports';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

type Props = { navigation: any; route: { params?: { editId?: string } } };

export default function ReportFormScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const { coords, request } = useCurrentLocation();

  const editId = route.params?.editId;
  const isEdit = Boolean(editId);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('rác');
  const [busy, setBusy] = useState(false);

  // Prefill nếu sửa
  useEffect(() => {
    (async () => {
      if (!editId) return;
      const r = await getReport(editId);
      if (r) {
        setPhotoUri(r.photoUri);
        setDescription(r.description);
        setCategory(r.category);
      }
    })();
  }, [editId]);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  }

  async function onSave() {
    try {
      if (!photoUri) return Alert.alert('Thiếu ảnh', 'Hãy chọn hoặc chụp một ảnh.');
      setBusy(true);

      if (isEdit && editId) {
        await updateReport(editId, {
          description,
          category,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          photoUri: photoUri, // nếu khác ảnh cũ sẽ tự copy thay
        });
      } else {
        await createReport(
          {
            description,
            category,
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          },
          photoUri
        );
      }

      setBusy(false);
      navigation.goBack();
    } catch (e: any) {
      setBusy(false);
      Alert.alert('Lỗi lưu báo cáo', e?.message ?? 'Không lưu được báo cáo');
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>{isEdit ? 'Sửa báo cáo' : 'Tạo báo cáo'}</Text>

      <PrimaryButton label="Chọn ảnh từ thư viện" variant="outline" onPress={pickImage} />
      <View style={{ height: spacing.md }} />
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : (
        <Text style={{ color: colors.subtext }}>(Chưa có ảnh)</Text>
      )}

      <View style={{ height: spacing.xl }} />
      <Text style={[styles.label, { color: colors.text }]}>Mô tả</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Nhập mô tả ngắn…"
        placeholderTextColor={colors.subtext}
        style={[styles.input, { color: colors.text, borderColor: colors.outline }]}
        multiline
      />

      <View style={{ height: spacing.xl }} />
      <Text style={[styles.label, { color: colors.text }]}>Danh mục</Text>
      <View style={styles.catRow}>
        {CATEGORIES.map((c) => (
          <PrimaryButton
            key={c}
            label={c.toUpperCase()}
            variant={c === category ? 'solid' : 'outline'}
            onPress={() => setCategory(c)}
            style={{ marginRight: spacing.sm }}
          />
        ))}
      </View>

      <View style={{ height: spacing.xl }} />
      <PrimaryButton label={busy ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Lưu báo cáo'} onPress={onSave} disabled={busy} />
      <View style={{ height: spacing.md }} />
      <PrimaryButton label="Lấy lại vị trí" variant="outline" onPress={request} />
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  title: { fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  label: { fontWeight: '700', marginBottom: spacing.sm },
  input: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, minHeight: 80 },
  preview: { width: '100%', height: 220, borderRadius: radius.lg, marginTop: spacing.sm, resizeMode: 'cover' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
