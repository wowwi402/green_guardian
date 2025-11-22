import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyReportsScreen from '../screens/reports/MyReportsScreen';
import ReportDetailScreen from '../screens/reports/ReportDetailScreen';
import ReportFormScreen from '../screens/reports/ReportFormScreen';

export type ReportsStackParamList = {
  MyReports: undefined;
  ReportDetail: { id: string };
  ReportForm: { id: string } | { draft?: true };   // dùng cho sửa hoặc tạo mới
};

const Stack = createNativeStackNavigator<ReportsStackParamList>();

export default function ReportsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'Báo cáo của tôi' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Chi tiết báo cáo' }} />
      <Stack.Screen name="ReportForm" component={ReportFormScreen} options={{ title: 'Sửa báo cáo' }} />
    </Stack.Navigator>
  );
}
