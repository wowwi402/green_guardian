import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import KnowledgeListScreen from '../screens/KnowledgeListScreen';
import KnowledgeDetailScreen from '../screens/KnowledgeDetailScreen';

const Stack = createNativeStackNavigator();

export default function KnowledgeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="KnowledgeList" component={KnowledgeListScreen} options={{ title: 'Kiến thức' }} />
      <Stack.Screen name="ArticleDetail" component={KnowledgeDetailScreen} options={{ title: 'Bài viết' }} />
    </Stack.Navigator>
  );
}
