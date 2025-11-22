// src/navigation/ReportsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppTheme } from '../theme/ThemeProvider';

import MyReportsScreen from '../screens/reports/MyReportsScreen';
import ReportFormScreen from '../screens/reports/ReportFormScreen';
import ReportDetailScreen from '../screens/reports/ReportDetailScreen';

export type ReportsStackParamList = {
  MyReports: undefined;
  ReportForm: { id?: string } | undefined;
  ReportDetail: { id: string };
};

const Stack = createNativeStackNavigator<ReportsStackParamList>();

export default function ReportsStack() {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: (colors as any).bgSoft ?? colors.card },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        // Lưu ý: native-stack không có headerBackTitleVisible
      }}
    >
      <Stack.Screen
        name="MyReports"
        component={MyReportsScreen}
        options={{ title: 'Báo cáo của tôi' }}
      />
      <Stack.Screen
        name="ReportForm"
        component={ReportFormScreen}
        options={{ title: 'Sửa báo cáo' }}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{ title: 'Chi tiết báo cáo' }}
      />
    </Stack.Navigator>
  );
}
