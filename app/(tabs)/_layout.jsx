// This file handles the bottom navigation bar, used to traverse the app. 

// Import necessary modules and components. Tabs provides a navigation bar and Platform is used to adapt the UI based on the OS
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// Import files that style the navigation bar, provided by Expo. These include haptic feedback, icons, colour definitions for themes, and returning the user's preferred colour scheme.
import { HapticTab } from '@/components/HapticTab';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Import a file I created, used to follow the user's settings selections (i.e. theme, font size) within the app.
import { useSettings } from '@/constants/settingsContext';

// Main functional component exported as default for use in the app
export default function TabLayout() {
  // Get current theme setting (light/dark/system), and the system's preference (light/dark)
  const { darkMode } = useSettings();
  const systemTheme = useColorScheme();

  // Ternary to decide which theme to use. If "system", use the device's current settings, else use the user's chosen setting.
  const effectiveTheme = darkMode === 'system' ? systemTheme : darkMode;

  // Render the tab bar with customisations
  return (
    <Tabs
      // Customise the appearance and behaviour of the navigation tabs. This includes: the colour of the current tab, colour for the other tabs, removing the headers for a cleaner UI, adding haptic feedback, using the custom tab bar background, and giving it an absolute position.
      screenOptions={{
        tabBarActiveTintColor: Colors[effectiveTheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[effectiveTheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
    >
      {/* Each <Tabs.Screen> represents a tab at the bottom of the app. The first one is commented as an example. */}
      
      <Tabs.Screen
        name="index" // Load the content for the "index" (home/map) screen
        options={{
          title: 'Map', // Label shown under the icon
          tabBarIcon: ({ color, size }) => (
            // Use a map icon, adapting size and colour to the selection
            <MaterialCommunityIcons name="map" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="emergency"
        options={{
          title: 'Emergency',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alert" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}