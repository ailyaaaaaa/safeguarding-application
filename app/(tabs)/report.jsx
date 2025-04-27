// This file handles the report page. Here, users can report a crime in their area.

// Import necessary modules and components. These include: hooks to use state and side effects, components and APIs from React Native to render the UI, providing access to device location, retrieving the theme, and using a colour palette.
import React, { useEffect, useState } from 'react';
import { Text, TextInput, ActivityIndicator, Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Import files I created for creating a uniform UI using a centralised stylesheet, and a file for retrieving the user's settings.
import { useCommonStyles } from '@/constants/commonStyles';
import { useSettings } from '@/constants/settingsContext';

const Report = () => {
  // Define constants for the page's functionality. Creates states for the user's location (including street name), date and time, crime type, description, and a loading indicator.
  const [location, setLocation] = useState(null); 
  const [streetName, setStreetName] = useState('Fetching location...');
  const [dateTime, setDateTime] = useState(new Date()); 
  const [crimeType, setCrimeType] = useState('anti-social-behaviour');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // Define constants for customisation logic. Retrieve the user's colour and text size preference, apply the theme, apply styles from the global stylesheet, adjust font size, and adjust background and text colour.
  const { darkMode, textSize } = useSettings();
  const systemTheme = useColorScheme();
  const effectiveTheme = darkMode === 'system' ? systemTheme : darkMode;
  const styles = useCommonStyles();

  const dynamicTextSize = { small: 12, medium: 16, large: 20 }[textSize] || 16;

  const backgroundColor = effectiveTheme === 'dark' ? '#000' : '#fff';
  const textColor = effectiveTheme === 'dark' ? '#fff' : '#000';

  const inputBackground = effectiveTheme === 'dark' ? '#222' : '#fff';
  const inputTextColor = effectiveTheme === 'dark' ? '#fff' : '#111';

  // Fetch user's location and address for the report (runs initially and when refreshed)
  const updateLocationAndTime = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setStreetName('Permission denied');
      setLoading(false);
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);

    try {
      let address = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (address.length > 0) {
        const place = address[0];
        // Try to display the most useful, specific address information available
        setStreetName( place.street || place.name || place.district || place.city || place.region || 'Unknown location' );
      } else {
        setStreetName('Unknown location');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setStreetName('Unknown location');
    }

    setDateTime(new Date());
    setLoading(false);
  };

  // On mount, get current location and address
  useEffect(() => {
    updateLocationAndTime();
  }, []);

  //Reset the form once submitted successfully
  const resetForm = () => {
    setCrimeType('anti-social-behaviour');
    setDescription('');
    updateLocationAndTime();
  };

  // Handles sending your crime report to the backend API
  const handleSubmit = async () => {
    // Return an error if no location
    if (!location) {
      Alert.alert('Error', 'Location not available. Try again later.');
      return;
    }

    // Package up the data as URL query parameters
    const queryParams = new URLSearchParams({
      crime_type: crimeType,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      description: description.trim() || '',
      date_time: dateTime.toISOString(),
    });

    const url = `https://doc.gold.ac.uk/usr/697/api/report?${queryParams.toString()}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        Alert.alert('Success', 'Report submitted successfully.');
        resetForm();
      } else {
        Alert.alert('Error', 'Failed to submit report.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Could not submit report. Check your connection.');
    }
  };

  return (
    // Allows keyboard dismissal when clicking outside inputs
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {/* KeyboardAvoidingView lifts inputs on iOS so they're not hidden */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor }]}
      >
        <Text style={[styles.title, { color: textColor, fontSize: dynamicTextSize + 8 }]}>
          Report a Crime
        </Text>
        {loading && (
          <ActivityIndicator size="large" color={Colors[systemTheme].tint} />
        )}

        {/* Location/address */}
        <Text style={[styles.label, { color: textColor, fontSize: dynamicTextSize }]}>Location:</Text>
        <Text style={[styles.text, { color: textColor, fontSize: dynamicTextSize }]}>{streetName}</Text>

        {/* Date and time */}
        <Text style={[styles.label, { color: textColor, fontSize: dynamicTextSize }]}>Date & Time:</Text>
        <Text style={[styles.text, { color: textColor, fontSize: dynamicTextSize }]}>
          {dateTime.toLocaleString()}
        </Text>

        {/* Allow user to refresh GPS and time */}
        <TouchableOpacity style={styles.bluePill} onPress={updateLocationAndTime}>
          <Text style={styles.pillButtonText}>Refresh Location & Time</Text>
        </TouchableOpacity>

        {/* Crime type selection dropdown */}
        <Text style={[styles.label, { color: textColor, fontSize: dynamicTextSize }]}>Crime Type:</Text>
        <Picker
          selectedValue={crimeType}
          onValueChange={setCrimeType}
          style={[styles.picker, { fontSize: dynamicTextSize }]}
          dropdownIconColor={textColor}
        >
          <Picker.Item label="Anti Social Behaviour" value="anti-social-behaviour" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Bicycle Theft" value="bicycle-theft" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Burglary" value="burglary" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Criminal Damage Arson" value="criminal-damage-arson" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Drugs" value="drugs" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Other Theft" value="other-theft" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Possession of Weapons" value="possession-of-weapons" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Public Order" value="public-order" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Robbery" value="robbery" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Shoplifting" value="shoplifting" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Theft from the Person" value="theft-from-the-person" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Vehicle Crime" value="vehicle-crime" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Violent Crime" value="violent-crime" color={textColor} style={{ fontSize: dynamicTextSize }} />
          <Picker.Item label="Other" value="other-crime" color={textColor} style={{ fontSize: dynamicTextSize }} />
        </Picker>

        {/* Optional description by user */}
        <Text style={[styles.label, { color: textColor, fontSize: dynamicTextSize }]}>Description (Optional):</Text>
        <TextInput
          style={[
            styles.input,
            {
              height: 80,
              backgroundColor: inputBackground,
              color: inputTextColor,
              fontSize: dynamicTextSize,
            },
          ]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the crime (optional)"
          placeholderTextColor={effectiveTheme === 'dark' ? "#999" : "#888"}
        />

        {/* Submit the report */}
        <TouchableOpacity style={styles.redPill} onPress={handleSubmit}>
          <Text style={styles.pillButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Report;