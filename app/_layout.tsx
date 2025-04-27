// This file organises the app. It shows a splash screen until the fonts have loaded, controls styling to match the selected theme, and updates the styles in real time.

// Import necessary modules and components. These include: custom fonts, colours, the navigation container, splash screen, system status bar appearance.

import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

// Import files I created for retrieving the user's settings.
import { SettingsProvider, useSettings } from "@/constants/settingsContext";

// Prevent the splash screen from auto-hiding until everything is ready
SplashScreen.preventAutoHideAsync();

function ThemedRootStack() {
  // Get user preferred dark mode setting and device's system mode, and set the final theme
  const { darkMode } = useSettings();
  const systemTheme = useColorScheme(); 
  const effectiveTheme = darkMode === 'system' ? systemTheme : darkMode;

  // Choose the navigation theme for react-navigation stack & tabs
  const navTheme = effectiveTheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={navTheme}>
      {/* Stack Navigator controls which main screen(s) are visible */}
      <Stack>
        {/* Removed headers because tabs have their own titles */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Fallback route for non-existent paths */}
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* StatusBar color adapts to dark/light theme */}
      <StatusBar style={effectiveTheme === 'dark' ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // Load a custom font; returns true when it's ready
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Once fonts finish loading, hide splash screen
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // While fonts are loading, show nothing (splash screen remains)
  if (!loaded) {
    return null;
  }

  // Provide settings (like dark mode, text size, etc) to the whole app tree
  return (
    <SettingsProvider>
      <ThemedRootStack />
    </SettingsProvider>
  );
}