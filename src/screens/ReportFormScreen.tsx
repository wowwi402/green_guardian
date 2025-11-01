import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius } from '../theme';
import PrimaryButton from '../components/PrimaryButton';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { CATEGORIES, Category, createReport } from '../services/reports';

export default function ReportFormScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<Category>('rác');
  const [saving, setSaving] = useState(false);
  const { coords, loading: locLoading, request } = useCurrentLocation();

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Thiếu quyền', 'Hãy cho phép truy cập thư viện ảnh.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  }

  async function captureFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Thiếu quyền', 'Hãy cho phép sử dụng camera.'); return; }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  }

  async function onSave() {
    if (!imageUri) { Alert.alert('Thiếu ảnh', 'Vui lòng chụp hoặc chọn một ảnh.'); return; }
    if (desc.trim().length < 5) { Alert.alert('Mô tả quá ngắn', 'Vui lòng nhập tối thiểu 5 ký tự.'); return; }

    try {
      setSaving(true);
      const report = await createReport(
        {
          description: desc.trim(),
          category: cat,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        },
        imageUri
      );
      setSaving(false);
      Alert.alert('Đã lưu', 'Báo cáo đã được lưu trong máy.', [
        { text: 'Xem danh sách', onPress: () => navigation.replace('ReportList') },
        { text: 'OK' },
      ]);
    } catch (e: any) {
      setSaving(false);
      Alert.alert('Lỗi', e?.message ?? 'Không lưu được báo cáo.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <Text style={styles.title}>Tạo báo cáo mới</Text>
      <Text style={styles.sub}>Đính kèm ảnh + vị trí hiện tại + mô tả ngắn.</Text>

      <View style={{ height: spacing.lg }} />

      {/* Ảnh */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={{ color: colors.subtext }}>Chưa có ảnh</Text>
        </View>
      )}
      <View style={{ height: spacing.sm }} />
      <View style={{ flexDirection: 'row' }}>
        <PrimaryButton label="Chụp ảnh" onPress={captureFromCamera} style={{ flex: 1, marginRight: spacing.sm }} />
        <PrimaryButton label="Chọn ảnh" variant="outline" onPress={pickFromLibrary} style={{ flex: 1, marginLeft: spacing.sm }} />
      </View>

      <View style={{ height: spacing.lg }} />

      {/* Danh mục */}
      <Text style={styles.label}>Danh mục</Text>
      <View style={styles.catRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} style={[styles.cat, cat === c && styles.catActive]} onPress={() => setCat(c)}>
            <Text style={[styles.catText, cat === c && { color: colors.bg }]}>{c.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: spacing.lg }} />

      {/* Mô tả */}
      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        placeholder="Ví dụ: Đống rác tự phát cạnh số nhà 12, có mùi hôi nặng…"
        placeholderTextColor={colors.subtext}
        value={desc}
        onChangeText={setDesc}
        multiline
        style={styles.input}
      />

      <View style={{ height: spacing.lg }} />

      {/* Tọa độ */}
      <Text style={styles.label}>Vị trí hiện tại</Text>
      {locLoading && !coords ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ActivityIndicator />
          <Text style={{ color: colors.subtext, marginLeft: 8 }}>Đang lấy vị trí…</Text>
        </View>
      ) : (
        <Text style={styles.coords}>
          {coords ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : 'Chưa có vị trí — nhấn lấy lại'}
        </Text>
      )}
      <View style={{ height: spacing.sm }} />
      <PrimaryButton label="Lấy lại vị trí" variant="outline" onPress={request} />

      <View style={{ height: spacing.xl }} />

      <PrimaryButton label={saving ? 'Đang lưu...' : 'Lưu báo cáo'} onPress={onSave} disabled={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  sub: { color: colors.subtext, marginTop: spacing.xs },
  photo: { width: '100%', height: 220, borderRadius: radius.lg, backgroundColor: colors.card },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.outline },
  label: { color: colors.text, fontWeight: '700', marginBottom: 6 },
  input: { minHeight: 90, borderWidth: 1, borderColor: colors.outline, borderRadius: 12, padding: 12, color: colors.text, backgroundColor: colors.card, textAlignVertical: 'top' },
  coords: { color: colors.subtext },
  catRow: { flexDirection: 'row', flexWrap: 'wrap' },
  cat: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.outline, borderRadius: 999, marginRight: 8, marginTop: 8 },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { color: colors.subtext, fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
});
