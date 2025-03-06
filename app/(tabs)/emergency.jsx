import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

const Emergency = () => {
  const [location, setLocation] = useState(null);
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
          Longitude: {location.longitude}
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
 