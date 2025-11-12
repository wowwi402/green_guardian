// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import Tabs from './Tabs';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

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
  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      <Root.Screen name="Welcome" component={WelcomeScreen} />
      <Root.Screen name="AuthFlow" component={AuthFlow} />
      <Root.Screen name="MainTabs" component={Tabs} />
    </Root.Navigator>
  );
}
