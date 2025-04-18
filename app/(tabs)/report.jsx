import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';

const Report = () => {
  const [location, setLocation] = useState(null);
  const [streetName, setStreetName] = useState('Fetching location...');
  const [dateTime, setDateTime] = useState(new Date());
  const [crimeType, setCrimeType] = useState('Anti-social behaviour');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

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

    const reportData = {
      crime_type: crimeType,
      latitude: location.latitude,
      longitude: location.longitude,
      description: description.trim() || null,
      date_time: dateTime.toISOString(),
    };

    try {
      const response = await fetch('http://localhost:3000/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
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
    <View style={styles.container}>
      <Text style={styles.title}>Report a Crime</Text>
      {loading && <ActivityIndicator size="large" color="blue" />}
      
      <Text style={styles.label}>Location:</Text>
      <Text style={[styles.text, styles.centerText]}>{streetName}</Text>

      <Text style={styles.label}>Date & Time:</Text>
      <Text style={[styles.text, styles.centerText]}>{dateTime.toLocaleString()}</Text>

      <Button title="Refresh Location & Time" onPress={updateLocationAndTime} />

      <Text style={styles.label}>Crime Type:</Text>
      <Picker
        selectedValue={crimeType}
        onValueChange={(itemValue) => setCrimeType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Anti-social behaviour" value="Anti-social behaviour" />
        <Picker.Item label="Vehicle crime" value="Vehicle crime" />
        <Picker.Item label="Violent crime" value="Violent crime" />
      </Picker>

      <Text style={styles.label}>Description (Optional):</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the crime (optional)"
      />

      <Button title="Submit Report" onPress={handleSubmit} color="red" />
    </View>
  );
};

export default Report;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  centerText: {
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
  },
  picker: {
    marginBottom: 10,
  },
});