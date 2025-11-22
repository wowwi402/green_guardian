import React, { useState } from 'react';
import {
  Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { CATEGORIES, type Category, createReport } from '../../services/reports';
import { useNavigation } from '@react-navigation/native';

export default function ReportCreateScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const { coords, request: requestLocation } = useCurrentLocation();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('rác');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thiếu quyền', 'Hãy cho phép truy cập Ảnh để chọn ảnh báo cáo.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thiếu quyền', 'Hãy cho phép Camera để chụp ảnh báo cáo.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const ensureLocation = async () => {
    if (!coords) await requestLocation();
  };

  const onSave = async () => {
    if (!imageUri) { Alert.alert('Thiếu ảnh', 'Vui lòng chọn hoặc chụp một ảnh.'); return; }
    if (!description.trim()) { Alert.alert('Thiếu mô tả', 'Hãy nhập mô tả ngắn gọn.'); return; }

    setSaving(true);
    try {
      const report = await createReport(
        {
          description: description.trim(),
          category,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        },
        imageUri
      );
      Alert.alert('Đã lưu', 'Báo cáo của bạn đã được lưu trong máy.', [
        { text: 'Xem', onPress: () => nav.navigate('Reports', { screen: 'MyReports' }) },
        { text: 'OK', onPress: () => nav.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không lưu được báo cáo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.xl }}>
      <Text style={[styles.h1, { color: colors.text }]}>Tạo báo cáo</Text>

      {/* Ảnh */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200, borderRadius: radius.lg }} />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.bg }]} />
        )}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={takePhoto}>
            <Text style={[styles.btnText, { color: colors.onPrimary }]}>Chụp ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.outline, borderWidth: 1 }]}
            onPress={pickImage}
          >
            <Text style={[styles.btnText, { color: colors.text }]}>Chọn ảnh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loại + mô tả */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.label, { color: colors.subtext }]}>Danh mục</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.bg, borderColor: active ? colors.primary : colors.outline },
                ]}
              >
                <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '700' }}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.subtext, marginTop: spacing.md }]}>Mô tả</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Nhập mô tả ngắn gọn…"
          placeholderTextColor={colors.subtext}
          style={[
            styles.input,
            { backgroundColor: colors.bg, borderColor: colors.outline, color: colors.text, minHeight: 90, textAlignVertical: 'top' },
          ]}
          multiline
        />
      </View>

      {/* Vị trí */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}>
        <Text style={[styles.label, { color: colors.subtext }]}>Vị trí</Text>
        <Text style={{ color: colors.text, marginTop: 6 }}>
          {coords
            ? `Lat: ${coords.latitude.toFixed(5)}  ·  Lon: ${coords.longitude.toFixed(5)}`
            : 'Chưa có vị trí'}
        </Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.outline, borderWidth: 1, marginTop: spacing.md }]}
          onPress={ensureLocation}
        >
          <Text style={[styles.btnText, { color: colors.text }]}>Lấy vị trí hiện tại</Text>
        </TouchableOpacity>
      </View>

      {/* Lưu */}
      <TouchableOpacity
        disabled={saving}
        style={[styles.btn, { backgroundColor: colors.primary, marginTop: spacing.md }]}
        onPress={onSave}
      >
        <Text style={[styles.btnText, { color: colors.onPrimary }]}>{saving ? 'Đang lưu…' : 'Lưu báo cáo'}</Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '900', marginBottom: spacing.md },
  card: { borderWidth: 1, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.lg },
  placeholder: { width: '100%', height: 200, borderRadius: radius.lg, opacity: 0.5 },
  label: { fontSize: 12, fontWeight: '700' },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginTop: 8 },
  btn: { borderRadius: radius.xl, paddingVertical: 12, alignItems: 'center' },
  btnText: { fontWeight: '800' },
});
