import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthProvider';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileHomeScreen from '../screens/ProfileScreen';
import MyReportsListScreen from '../screens/MyReportsListScreen';
import MyReportDetailScreen from '../screens/MyReportDetailScreen';
const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: '800' } }}>
      {user ? (
        <>
          <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} options={{ title: 'Hồ sơ' }} />
          <Stack.Screen name="MyReportsList" component={MyReportsListScreen} options={{ title: 'Báo cáo của tôi' }} />
          <Stack.Screen name="MyReportDetail" component={MyReportDetailScreen} options={{ title: 'Chi tiết báo cáo' }} />
          </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
