import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AuthProvider } from './src/auth/AuthProvider';
import RootNavigator from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
        <RootNavigator />
           <StatusBar style="dark" />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
