import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { spacing, radius } from '../theme';

export default function ProfileHomeScreen() {
  const { user, signOut } = useAuth();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.box, { backgroundColor: colors.bg }]}>
      <Text style={[styles.h1, { color: colors.text }]}>
        Xin chào{user?.displayName ? `, ${user.displayName}` : ''}!
      </Text>
      <Text style={{ color: colors.subtext, marginBottom: spacing.xl }}>
        {user?.email}
      </Text>

      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.outline }]}
        onPress={signOut}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, padding: spacing.xl },
  h1: { fontSize: 22, fontWeight: '900', marginBottom: spacing.sm },
  btn: { borderWidth: 1, borderRadius: radius.xl, paddingVertical: 12, alignItems: 'center' },
});
