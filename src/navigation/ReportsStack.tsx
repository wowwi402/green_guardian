import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyReportsScreen from '../screens/reports/MyReportsScreen';
import ReportCreateScreen from '../screens/reports/ReportCreateScreen';
import ReportDetailScreen from '../screens/reports/ReportDetailScreen';

export type ReportsParamList = {
  MyReports: undefined;
  ReportCreate: undefined;
  ReportDetail: { id: string };
};

const Stack = createNativeStackNavigator<ReportsParamList>();

export default function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerTitleAlign: 'center' }}>
      <Stack.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'Báo cáo của tôi' }} />
      <Stack.Screen name="ReportCreate" component={ReportCreateScreen} options={{ title: 'Tạo báo cáo' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Chi tiết báo cáo' }} />
    </Stack.Navigator>
  );
}
