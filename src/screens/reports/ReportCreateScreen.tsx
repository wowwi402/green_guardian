import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createReport, CATEGORIES, type Category } from '../../services/reports';
import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';

export default function ReportCreateScreen() {
  const { colors } = useAppTheme();
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<Category>('khác');
  const [photo, setPhoto] = useState<string | null>(null);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert('Thiếu quyền', 'Cần cấp quyền thư viện ảnh'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled && res.assets?.[0]?.uri) setPhoto(res.assets[0].uri);
  };

  const onSave = async () => {
    if (!photo) { Alert.alert('Thiếu ảnh', 'Vui lòng chọn ảnh'); return; }
    if (!desc.trim()) { Alert.alert('Thiếu mô tả', 'Nhập mô tả ngắn'); return; }
    const r = await createReport({ description: desc.trim(), category: cat }, photo);
    Alert.alert('OK', 'Đã lưu báo cáo');
    setDesc(''); setPhoto(null); setCat('khác');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={[styles.label, { color: colors.text }]}>Ảnh</Text>
      {photo ? <Image source={{ uri: photo }} style={styles.image} /> : (
        <TouchableOpacity style={[styles.pick, { borderColor: colors.outline }]} onPress={pickImage}>
          <Text style={{ color: colors.subtext }}>Chọn ảnh từ thư viện</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.label, { color: colors.text }]}>Loại</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCat(c)}
            style={[
              styles.chip,
              { borderColor: colors.outline, backgroundColor: c === cat ? colors.primary : colors.card }
            ]}
          >
            <Text style={{ color: c === cat ? colors.onPrimary : colors.text, fontWeight: '700' }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Mô tả</Text>
      <TextInput
        placeholder="Mô tả ngắn…"
        placeholderTextColor={colors.subtext}
        value={desc}
        onChangeText={setDesc}
        multiline
        numberOfLines={4}
        style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.card }]}
      />

      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={onSave}>
        <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>Lưu báo cáo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '800', marginBottom: 6, marginTop: spacing.md },
  image: { width: '100%', height: 220, borderRadius: radius.lg, marginBottom: spacing.md },
  pick: {
    borderWidth: 1, borderRadius: radius.lg, paddingVertical: 18, alignItems: 'center', marginBottom: spacing.md
  },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.lg, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: radius.lg, padding: 12, minHeight: 100, textAlignVertical: 'top' },
  btn: { marginTop: spacing.lg, paddingVertical: 14, alignItems: 'center', borderRadius: radius.lg },
});
