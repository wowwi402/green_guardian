import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import Tabs from './Tabs';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { useAuth } from '../auth/AuthProvider';

export type RootStackParamList = {
  Welcome: undefined;
  AuthFlow: undefined;
  MainTabs: undefined;
};

const Root = createNativeStackNavigator<RootStackParamList>();
const Auth = createNativeStackNavigator();

function AuthFlow() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login" component={LoginScreen} />
      <Auth.Screen name="Register" component={RegisterScreen} />
    </Auth.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // ĐÃ đăng nhập -> vào app chính
        <Root.Screen name="MainTabs" component={Tabs} />
      ) : (
        // CHƯA đăng nhập -> Welcome + AuthFlow
        <>
          <Root.Screen name="Welcome" component={WelcomeScreen} />
          <Root.Screen name="AuthFlow" component={AuthFlow} />
        </>
      )}
    </Root.Navigator>
  );
}
