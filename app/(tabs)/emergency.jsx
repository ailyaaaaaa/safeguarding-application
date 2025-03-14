import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

const Emergency = () => {
  const [location, setLocation] = useState(null);
  const [streetName, setStreetName] = useState('Fetching street name...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      // Reverse geocode to get address
      try {
        let address = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        console.log("Full reverse geocode response:", address); // Log full response

        if (address.length > 0) {
          const place = address[0];

          setStreetName(
            place.street ||
            place.name ||
            place.district ||
            place.city ||
            place.region ||
            'Unknown location'
          );
        } else {
          setStreetName('Unknown location');
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setStreetName('Unknown location');
      }

      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency</Text>
      {loading && <ActivityIndicator size="large" color="blue" />}
      {error && <Text style={styles.error}>{error}</Text>}
      {location && (
        <Text style={styles.location}>
          Latitude: {location.latitude} {'\n'}
          Longitude: {location.longitude} {'\n'}
          Street: {streetName}
        </Text>
      )}
    </View>
  );
};

export default Emergency;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  location: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});
