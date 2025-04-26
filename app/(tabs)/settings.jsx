import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useCommonStyles } from '@/constants/commonStyles';
import { useSettings } from '@/constants/settingsContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const RadioGroup = ({ options, value, onChange, textColor, dynamicTextSize }) => {
  const styles = useCommonStyles();
  return (
    <View style={styles.radioGroupRow}>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          style={styles.radioGroupOption}
        >
          <View
            style={[
              styles.radioOuter,
              value === option.value && styles.radioOuterSelected,
            ]}
          >
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

const Settings = () => {
  const styles = useCommonStyles();
  const {
    darkMode,
    setDarkMode,
    textSize,
    setTextSize,
    crimeSource,
    setCrimeSource,
    notifications,
    setNotifications,
  } = useSettings();

  const systemTheme = useColorScheme(); // <-- actual system theme, 'light' or 'dark'
  // True theme: use user's override, or system
  const effectiveTheme = darkMode === 'system' ? systemTheme : darkMode;

  const dynamicTextSize = {
    small: 12,
    medium: 16,
    large: 20,
  }[textSize] || 16;
  const backgroundColor = effectiveTheme === 'dark' ? '#000' : '#fff';
  const textColor = effectiveTheme === 'dark' ? '#fff' : '#000';

  return (
    <View style={[styles.container, { backgroundColor, alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 30 }]}>
      <Text style={[styles.title, { alignSelf: "center", marginBottom: 24, color: textColor, fontSize: dynamicTextSize + 8 }]}>
        Settings
      </Text>

      <View style={styles.settingGroup}>
        <Text style={[styles.settingLabel, { color: textColor, fontSize: dynamicTextSize }]}>Dark Mode</Text>
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

      <View style={styles.settingGroup}>
        <Text style={[styles.settingLabel, { color: textColor, fontSize: dynamicTextSize }]}>Text Size</Text>
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

      <View style={styles.settingGroup}>
        <Text style={[styles.settingLabel, { color: textColor, fontSize: dynamicTextSize }]}>Crime Data Source</Text>
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

      <View style={styles.settingGroup}>
        <View style={styles.switchRow}>
          <Text style={[styles.settingLabel, { marginRight: 12, color: textColor, fontSize: dynamicTextSize }]}>
            Notify for High-Risk Areas
          </Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            thumbColor={notifications ? (effectiveTheme === "dark" ? "#fff" : "#0a7ea4") : "#ccc"}
            trackColor={{ false: "#767577", true: effectiveTheme === "dark" ? "#444" : "#a3d9f7" }}
          />
        </View>
      </View>
    </View>
  );
};

export default Settings;