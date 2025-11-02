import React from 'react';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';
import { ThemeProvider } from './src/theme/ThemeProvider';
import Tabs from './src/navigation/Tabs';

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    primary: colors.primary,
    text: colors.text,
    border: colors.outline,
    notification: colors.primary,
  },
};

export default function App() {
  return (
  <ThemeProvider>
    <NavigationContainer theme={navTheme}>
      <Tabs />
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  </ThemeProvider>
  );
}
