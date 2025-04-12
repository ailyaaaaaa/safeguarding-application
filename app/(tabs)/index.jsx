import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';

// Function to calculate square coordinates
function getSquareCoordinates(lat, lon, size) {
  const R = 6378137; // Earth's radius in meters
  const d = size / 2; // Half of the square's size

  const latRad = lat * Math.PI / 180;
  const lonRad = lon * Math.PI / 180;

  const dLat = d / R;
  const dLon = d / (R * Math.cos(latRad));

  const north = lat + (dLat * 180 / Math.PI);
  const south = lat - (dLat * 180 / Math.PI);
  const east = lon + (dLon * 180 / Math.PI);
  const west = lon - (dLon * 180 / Math.PI);

  return {
    topLeft: { lat: north, lon: west },
    topRight: { lat: north, lon: east },
    bottomLeft: { lat: south, lon: west },
    bottomRight: { lat: south, lon: east },
  };
}

const Index = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [crimeData, setCrimeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let locationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Start watching the user's location
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Update every meter
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          setLoading(false);
        }
      );
    })();

    // Clean up the subscription on component unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (location) {
      const squareCoords = getSquareCoordinates(location.latitude, location.longitude, 500);
      fetchCrimes(squareCoords).then(data => setCrimeData(data));
    }
  }, [location]);

  async function fetchCrimes(squareCoords) {
    const date = '2024-01';
    const url = encodeURI(
      `https://data.police.uk/api/crimes-street/all-crime?poly=${squareCoords.topLeft.lat},${squareCoords.topLeft.lon}:${squareCoords.topRight.lat},${squareCoords.bottomLeft.lon}:${squareCoords.bottomLeft.lat},${squareCoords.bottomLeft.lon}:${squareCoords.bottomRight.lat},${squareCoords.bottomRight.lon}&date=${date}`
    );
  
    console.log("Fetching crime data from:", url); // ✅ Print URL
    console.log(squareCoords.topLeft.lat, ", ", squareCoords.topLeft.lon);
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      console.log("Crime data:", data);
      return data;
    } catch (error) {
      console.error('Error fetching crime data:', error);
      return null;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map</Text>
      {loading && <ActivityIndicator size="large" color="blue" />}
      {error && <Text style={styles.error}>{error}</Text>}
      {/* {location && (
        <Text style={styles.location}>
          Latitude: {location.latitude} {'\n'}
          Longitude: {location.longitude}
        </Text>
      )} */}
      {crimeData && <Text style={styles.crime}>Crimes Found: {crimeData.length}</Text>}
      {location && (
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01, // Smaller delta for a closer zoom
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true} // Show the user's location with the default blue dot
        />
      )}
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  map: {
    width: '80%',
    height: '70%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
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
  crime: {
    fontSize: 18,
    color: 'blue',
    textAlign: 'center',
    marginBottom: 10,
  },
});