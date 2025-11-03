import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthProvider';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileHomeScreen from '../screens/ProfileHomeScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: '800' } }}>
      {user ? (
        <>
          <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} options={{ title: 'Hồ sơ' }} />
          {/* thêm màn khác trong hồ sơ nếu có */}
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
