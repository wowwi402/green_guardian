// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Tabs from './Tabs'; // tabs Home/Map/Knowledge/Profile đang có
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { useAuth } from '../auth/AuthProvider';
import { View, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';

const Root = createNativeStackNavigator();
const Auth = createNativeStackNavigator();

function AuthStack() {
  return (
    <Auth.Navigator screenOptions={{ headerTitleStyle: { fontWeight: '800' } }}>
      <Auth.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
      <Auth.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
    </Auth.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const { colors } = useAppTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // ĐÃ đăng nhập → vào app chính (Tabs)
        <Root.Screen name="MainTabs" component={Tabs} />
      ) : (
        // CHƯA đăng nhập → vào flow đăng nhập/đăng ký
        <Root.Screen name="AuthFlow" component={AuthStack} />
      )}
    </Root.Navigator>
  );
}
