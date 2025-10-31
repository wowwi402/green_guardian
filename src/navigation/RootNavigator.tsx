import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import Tabs from './Tabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome">
        {({ navigation }) => (
          <WelcomeScreen onContinueGuest={() => navigation.replace('MainTabs')} />
        )}
      </Stack.Screen>
      <Stack.Screen name="MainTabs" component={Tabs} />
    </Stack.Navigator>
  );
}
