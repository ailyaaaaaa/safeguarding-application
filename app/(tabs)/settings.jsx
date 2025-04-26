import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useCommonStyles } from '@/constants/commonStyles';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const RadioGroup = ({ options, value, onChange }) => {
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
            {value === option.value && (
              <View style={styles.radioInner} />
            )}
          </View>
          <Text style={styles.radioLabel}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const Settings = () => {
  const styles = useCommonStyles();
  const [darkMode, setDarkMode] = useState('system');
  const [textSize, setTextSize] = useState('medium');
  const [mapType, setMapType] = useState('standard');
  const [locationAccuracy, setLocationAccuracy] = useState('balanced');
  const [crimeSource, setCrimeSource] = useState('both');
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={[styles.container, { alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 30 }]}>
      <Text style={[styles.title, { alignSelf: "center", marginBottom: 24 }]}>Settings</Text>
  
      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Dark Mode</Text>
        <RadioGroup
          options={[
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
            { label: "System Default", value: "system" },
          ]}
          value={darkMode}
          onChange={setDarkMode}
        />
      </View>
  
      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Text Size</Text>
        <RadioGroup
          options={[
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ]}
          value={textSize}
          onChange={setTextSize}
        />
      </View>
  
      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Map Type</Text>
        <RadioGroup
          options={[
            { label: "Standard", value: "standard" },
            { label: "Satellite", value: "satellite" },
            { label: "Hybrid", value: "hybrid" },
          ]}
          value={mapType}
          onChange={setMapType}
        />
      </View>
  
      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Location Accuracy</Text>
        <RadioGroup
          options={[
            { label: "Low", value: "low" },
            { label: "Balanced", value: "balanced" },
            { label: "High", value: "high" },
          ]}
          value={locationAccuracy}
          onChange={setLocationAccuracy}
        />
      </View>
  
      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Crime Data Source</Text>
        <RadioGroup
          options={[
            { label: "Met Police", value: "met" },
            { label: "User Reports", value: "report" },
            { label: "Both", value: "both" },
          ]}
          value={crimeSource}
          onChange={setCrimeSource}
        />
      </View>
  
      <View style={styles.settingGroup}>
        <View style={styles.switchRow}>
          <Text style={[styles.settingLabel, { marginRight: 12 }]}>
            Notify for High-Risk Areas
          </Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>
      </View>
    </View>
  );
};

export default Settings;