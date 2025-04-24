import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useCommonStyles } from '@/constants/commonStyles';

const Report = () => {
  const [location, setLocation] = useState(null);
  const [streetName, setStreetName] = useState('Fetching location...');
  const [dateTime, setDateTime] = useState(new Date());
  const [crimeType, setCrimeType] = useState('Anti-social behaviour');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const styles = useCommonStyles(); // Call the function to get styles

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
        setStreetName(
          place.street || place.name || place.district || place.city || place.region || 'Unknown location'
        );
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

  useEffect(() => {
    updateLocationAndTime();
  }, []);

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available. Try again later.');
      return;
    }
  
    const queryParams = new URLSearchParams({
      crime_type: crimeType,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      description: description.trim() || '',
      date_time: dateTime.toISOString(),
    });
  
    const url = `https://doc.gold.ac.uk/usr/697/api/report?${queryParams.toString()}`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
  
      if (response.ok) {
        Alert.alert('Success', 'Report submitted successfully.');
      } else {
        Alert.alert('Error', 'Failed to submit report.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Could not submit report. Check your connection.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>Report a Crime</Text>
        {loading && <ActivityIndicator size="large" color="blue" />}
        
        <Text style={styles.label}>Location:</Text>
        <Text style={[styles.text, styles.text]}>{streetName}</Text>

        <Text style={styles.label}>Date & Time:</Text>
        <Text style={[styles.text, styles.text]}>{dateTime.toLocaleString()}</Text>

        <TouchableOpacity 
          style={styles.bluePill} 
          onPress={updateLocationAndTime}
        >
          <Text style={styles.pillButtonText}>Refresh Location & Time</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Crime Type:</Text>
        <Picker
          selectedValue={crimeType}
          onValueChange={(itemValue) => setCrimeType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Anti Social Behaviour" value="anti-social-behaviour" />
          <Picker.Item label="Bicycle Theft" value="bicycle-theft" />
          <Picker.Item label="Burglary" value="burglary" />
          <Picker.Item label="Criminal Damage Arson" value="criminal-damage-arson" />
          <Picker.Item label="Drugs" value="drugs" />
          <Picker.Item label="Other Theft" value="other-theft" />
          <Picker.Item label="Possession of Weapons" value="possession-of-weapons" />
          <Picker.Item label="Public Order" value="public-order" />
          <Picker.Item label="Robbery" value="robbery" />
          <Picker.Item label="Shoplifting" value="shoplifting" />
          <Picker.Item label="Theft" value="theft-from-the-person" />
          <Picker.Item label="Vehicle Crime" value="vehicle-crime" />
          <Picker.Item label="Violent Crime" value="violent-crime" />
          <Picker.Item label="Other" value="other-crime" />
        </Picker>

        <Text style={styles.label}>Description (Optional):</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the crime (optional)"
        />

        <TouchableOpacity 
          style={styles.redPill} 
          onPress={handleSubmit}
        >
          <Text style={styles.pillButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Report;