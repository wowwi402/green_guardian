import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Tabs from './Tabs';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { useAuth } from '../auth/AuthProvider';
import { View, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';

const Root = createNativeStackNavigator();
const Auth = createNativeStackNavigator();
const ONBOARDED_KEY = 'gg:onboarded:v1';

function AuthStack() {
  return (
    <Auth.Navigator screenOptions={{ headerTitleStyle: { fontWeight: '800' } }}>
      <Auth.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
      <Auth.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
    </Auth.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading, isGuest } = useAuth();
  const { colors } = useAppTheme();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [initial, setInitial] = useState<'Welcome' | 'AuthFlow' | 'MainTabs' | null>(null);

  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(ONBOARDED_KEY);
      setOnboarded(v === '1');
    })();
  }, []);

  // Quyết định route mở đầu
  useEffect(() => {
    if (onboarded === null) return;
    if (!onboarded) {
      setInitial('Welcome');
    } else if (user || isGuest) {
      setInitial('MainTabs');
    } else {
      setInitial('AuthFlow');
    }
  }, [onboarded, user, isGuest]);

  if (loading || onboarded === null || initial === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false }} initialRouteName={initial}>
      {/* Luôn đăng ký đủ 3 screen */}
      <Root.Screen name="Welcome" component={WelcomeScreen} />
      <Root.Screen name="AuthFlow" component={AuthStack} />
      <Root.Screen name="MainTabs" component={Tabs} />
    </Root.Navigator>
  );
}
