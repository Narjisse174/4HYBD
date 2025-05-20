import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import authService from './src/services/auth';
import socketService from './src/services/socket';

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text style={{ marginTop: 10 }}>Chargement...</Text>
  </View>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Démarrage de l\'application...');
        console.log('📱 Initialisation de l\'authentification...');
        await authService.initialize();
        const authState = authService.getAuthState();
        console.log('📊 État d\'authentification:', authState);
        setIsAuthenticated(authState.isAuthenticated);

        if (authState.isAuthenticated) {
          console.log('🔌 Connexion au socket...');
          await socketService.connect();
          console.log('✅ Socket connecté avec succès');
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        setIsAuthenticated(false);
      }
    };

    initializeApp();
  }, []);

  if (isAuthenticated === null) {
    console.log('⏳ Affichage de l\'écran de chargement...');
    return <LoadingScreen />;
  }

  console.log('🎯 Navigation vers:', isAuthenticated ? 'AppNavigator' : 'AuthNavigator');
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App; 