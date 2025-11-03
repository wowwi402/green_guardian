// src/navigation/RootNavigator.tsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Tabs from './Tabs';
import AuthStack from './AuthStack';
import { useAuth } from '../auth/AuthProvider';
import { useAppTheme } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { mode, loading } = useAuth();
  const { colors } = useAppTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Khi chưa chọn (none) → đi qua AuthStack; còn lại → Tabs
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {mode === 'none' ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <Stack.Screen name="MainTabs" component={Tabs} />
      )}
    </Stack.Navigator>
  );
}
