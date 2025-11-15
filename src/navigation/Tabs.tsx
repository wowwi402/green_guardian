// src/navigation/Tabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import KnowledgeScreen from '../screens/KnowledgeScreen'; 
import ProfileScreen from '../screens/ProfileScreen';

import { useAppTheme } from '../theme/ThemeProvider';

type TabParamList = {
  Home: undefined;
  Map: undefined;
  Knowledge: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function Tabs() {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bgSoft },          
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.text,
        headerShadowVisible: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.outline,
          height: 60,
        },
        tabBarLabelStyle: { fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === 'Home'
              ? 'home'
              : route.name === 'Map'
              ? 'map'
              : route.name === 'Knowledge'
              ? 'book'
              : 'person';
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Bản đồ' }} />
      <Tab.Screen name="Knowledge" component={KnowledgeScreen} options={{ title: 'Kiến thức' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}
