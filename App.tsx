import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { TabNavigator } from './src/navigation/TabNavigator';
import { OnboardingScreen } from './src/screens';

function AppContent() {
  const { state } = useApp();

  if (!state.hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return <TabNavigator />;
}

export default function App() {
  return (
    <View style={styles.container}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <AppContent />
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
