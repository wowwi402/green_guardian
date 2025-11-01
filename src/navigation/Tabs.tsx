import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import KnowledgeStack from '../navigation/KnowledgeStack'; // dùng stack
import { colors } from '../theme';
import ProfileStack from '../navigation/ProfileStack'; // thêm import

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.card },
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
