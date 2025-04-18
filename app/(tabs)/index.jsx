import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

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
  const [crimeData, setCrimeData] = useState([]);
  const [error, setError] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

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

          // Set the initial map region if it's not set yet
          if (!mapRegion) {
            setMapRegion({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      );
    })();

    // Clean up the subscription on component unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [mapRegion]);

  useEffect(() => {
    if (location) {
      const squareCoords = getSquareCoordinates(location.latitude, location.longitude, 1500);
      fetchCrimes(squareCoords).then(data => {
        console.log("Crime data length:", data.length);
        setCrimeData(data);
      });
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
      //console.log("Crime data:", data);
      return data;
    } catch (error) {
      console.error('Error fetching crime data:', error);
      return [];
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map</Text>
      {loading && <ActivityIndicator size="large" color="blue" />}
      {error && <Text style={styles.error}>{error}</Text>}
      {crimeData && <Text style={styles.crime}>Crimes Found: {crimeData.length}</Text>}
      {mapRegion && (
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion} // Update mapRegion when the user moves the map
          showsUserLocation={true} // Show the user's location with the default blue dot
        >
          {crimeData.map((crime, index) => {
            const latitude = parseFloat(crime.location.latitude) + index * 0.0001; // Slight offset
            const longitude = parseFloat(crime.location.longitude) + index * 0.0001; // Slight offset
            //console.log(`Crime ${index}:`, latitude, longitude);
            return (
              <Marker
                key={crime.id} // Use a unique identifier if available
                coordinate={{ latitude, longitude }}
                title={crime.category}
                description={crime.location.street.name}
              />
            );
          })}
        </MapView>
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