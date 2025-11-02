import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ProfileStack from '../navigation/ProfileStack';
import KnowledgeStack from '../navigation/KnowledgeStack';
import { useAppTheme } from '../theme/ThemeProvider';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.outline },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Bản đồ' }} />
      <Tab.Screen name="Learn" component={KnowledgeStack} options={{ title: 'Kiến thức' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}
