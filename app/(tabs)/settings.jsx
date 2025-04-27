// This file handles the settings page. Users can adjust various settings on this page, including the app's theme and font size, the map's crime data source, and notifications for high risk areas.

// Import necessary modules and components. These include: hooks to use state and side effects, components and APIs from React Native to render the UI, retrieving the theme, and using a colour palette.
import React from 'react';
import { View, Text, Switch, TouchableOpacity, Linking } from 'react-native';
import { useCommonStyles } from '@/constants/commonStyles';
import { useColorScheme } from '@/hooks/useColorScheme';

// Import files I created for creating a uniform UI using a centralised stylesheet, and a file for retrieving the user's settings.
import { useSettings } from '@/constants/settingsContext';

// Created a radio group. This is a generic control for picking one of several mutually exclusive options.
const RadioGroup = ({ options, value, onChange, textColor, dynamicTextSize }) => {
  const styles = useCommonStyles();
  return (
    <View style={styles.radioGroupRow}>
      {/* Render each radio button option */}
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          style={styles.radioGroupOption}
        >
          {/* Highlight outer circle if selected */}
          <View
            style={[
              styles.radioOuter,
              value === option.value && styles.radioOuterSelected,
            ]}
          >
            {/* Only show the inner circle if selected */}
            {value === option.value && <View style={styles.radioInner} />}
          </View>
          <Text style={[styles.radioLabel, { color: textColor, fontSize: dynamicTextSize }]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Main Settings screen component
const Settings = () => {
  // Define constants for customisation logic. Retrieve the user's colour and text size preference, apply the theme, apply styles from the global stylesheet, adjust font size, and adjust background and text colour.  
  const { darkMode, setDarkMode, textSize, setTextSize, crimeSource, setCrimeSource, notifications, setNotifications, } = useSettings();
  const systemTheme = useColorScheme();
  const effectiveTheme = darkMode === 'system' ? systemTheme : darkMode;
  const styles = useCommonStyles();
  
  const dynamicTextSize = { small: 12, medium: 16, large: 20 }[textSize] || 16;

  const backgroundColor = effectiveTheme === 'dark' ? '#000' : '#fff';
  const textColor = effectiveTheme === 'dark' ? '#fff' : '#000';

  // Render settings categories
  return (
    <View style={[
      styles.container,
      {
        backgroundColor,
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 30,
      }
    ]}>
      {/* Screen title */}
      <Text style={[
        styles.title,
        {
          alignSelf: "center",
          marginBottom: 24,
          color: textColor,
          fontSize: dynamicTextSize + 8
        }
      ]}>
        Settings
      </Text>

      {/* Theme control */}
      <View style={styles.settingGroup}>
        <Text style={[styles.settingLabel, { color: textColor, fontSize: dynamicTextSize }]}>
          Dark Mode:
        </Text>
        <RadioGroup
          options={[
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
            { label: "System Default", value: "system" },
          ]}
          value={darkMode}
          onChange={setDarkMode}
          textColor={textColor}
          dynamicTextSize={dynamicTextSize}
        />
      </View>

      {/* Text size control */}
      <View style={styles.settingGroup}>
        <Text style={[styles.settingLabel, { color: textColor, fontSize: dynamicTextSize }]}>
          Text Size:
        </Text>
        <RadioGroup
          options={[
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ]}
          value={textSize}
          onChange={setTextSize}
          textColor={textColor}
          dynamicTextSize={dynamicTextSize}
        />
      </View>
      
      {/* Crime data source control */}
      <View style={styles.settingGroup}>
        <Text style={[styles.settingLabel, { color: textColor, fontSize: dynamicTextSize }]}>
          Crime Data Source:
        </Text>
        <RadioGroup
          options={[
            { label: "Met Police", value: "met" },
            { label: "User Reports", value: "report" },
            { label: "Both", value: "both" },
          ]}
          value={crimeSource}
          onChange={setCrimeSource}
          textColor={textColor}
          dynamicTextSize={dynamicTextSize}
        />
      </View>

      {/* Notifications toggle: */}
      <View style={styles.settingGroup}>
        <View style={styles.switchRow}>
          <Text style={[
            styles.settingLabel,
            { marginRight: 12, color: textColor, fontSize: dynamicTextSize }
          ]}>
            Notify for High-Risk Areas
          </Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            thumbColor= "#FFF"
            trackColor={{
              false: "#767577",
              true: effectiveTheme === "dark" ? "#444" : "#3478F6"
            }}
          />
        </View>
      </View>
      <View>
        <TouchableOpacity onPress={() => Linking.openURL("https://doc.gold.ac.uk/usr/697/")}>
          <Text style={{ color: '#3478F6', fontSize: dynamicTextSize, marginBottom: 12 }}>
            User Report API Information
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("https://github.com/ailyaaaaaa/safeguarding-application")}>
          <Text style={{ color: '#3478F6', fontSize: dynamicTextSize, marginBottom: 12 }}>
            Github for Application
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("https://github.com/ailyaaaaaa/safeguarding-application")}>
          <Text style={{ color: '#3478F6', fontSize: dynamicTextSize }}>
            GitHub for User Report API
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Settings;