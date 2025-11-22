import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createReport, Category } from '../../services/reports';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';

export default function NewReportScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const { coords } = useCurrentLocation();

  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<Category>('khác');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled && res.assets?.[0]?.uri) setImageUri(res.assets[0].uri);
  };

  const onSave = async () => {
    if (!imageUri) { Alert.alert('Thiếu ảnh'); return; }
    setSaving(true);
    try {
      await createReport(
        {
          description: desc.trim(),
          category: cat,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        },
        imageUri
      );

      
      nav.goBack(); 
    } catch (e: any) {
      Alert.alert('Lưu thất bại', e?.message ?? 'Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: spacing.xl, backgroundColor: colors.bg }}>
      <TextInput
        placeholder="Mô tả ngắn…"
        placeholderTextColor={colors.subtext}
        value={desc}
        onChangeText={setDesc}
        style={{ color: colors.text, backgroundColor: colors.card, borderColor: colors.outline, borderWidth: 1, borderRadius: radius.lg, padding: 12 }}
      />

      <TouchableOpacity onPress={pickImage} style={{ marginTop: spacing.md, padding: 12, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.outline }}>
        <Text style={{ color: colors.text }}>{imageUri ? 'Đã chọn ảnh' : 'Chọn ảnh'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSave} disabled={saving} style={{ marginTop: spacing.lg, padding: 14, borderRadius: radius.xl, alignItems: 'center', backgroundColor: colors.primary }}>
        <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>{saving ? 'Đang lưu…' : 'Lưu báo cáo'}</Text>
      </TouchableOpacity>
    </View>
  );
}
