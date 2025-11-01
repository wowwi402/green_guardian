import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileHomeScreen from '../screens/ProfileHomeScreen';
import ReportFormScreen from '../screens/ReportFormScreen';
import ReportListScreen from '../screens/ReportListScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} options={{ title: 'Hồ sơ' }} />
      <Stack.Screen name="ReportForm" component={ReportFormScreen} options={{ title: 'Tạo báo cáo' }} />
      <Stack.Screen name="ReportList" component={ReportListScreen} options={{ title: 'Báo cáo của tôi' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Chi tiết báo cáo' }} />
    </Stack.Navigator>
  );
}
