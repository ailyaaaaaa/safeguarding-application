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
      const size = 1500; // Define the size of the area to search
      const fetchAllCrimes = async () => {
        const [policeData, backendData] = await Promise.all([
          fetchCrimesFromMetAPI(getSquareCoordinates(location.latitude, location.longitude, size)),
          fetchCrimesFromBackend(location, size),
        ]);

        // Combine data from both sources
        const combinedData = [...policeData, ...backendData];
        setCrimeData(combinedData);
      };

      fetchAllCrimes();
    }
  }, [location]);

  async function fetchCrimesFromMetAPI(squareCoords) {
    const date = '2024-01';
    const url = encodeURI(
      `https://data.police.uk/api/crimes-street/all-crime?poly=${squareCoords.topLeft.lat},${squareCoords.topLeft.lon}:${squareCoords.topRight.lat},${squareCoords.topRight.lon}:${squareCoords.bottomRight.lat},${squareCoords.bottomRight.lon}:${squareCoords.bottomLeft.lat},${squareCoords.bottomLeft.lon}&date=${date}`
    );

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Met API error ${response.status}`);
      const data = await response.json();

      // Attach source tag
      return data.map(crime => ({ ...crime, source: 'met' }));
    } catch (error) {
      console.error('Met API error:', error);
      return [];
    }
  }

  async function fetchCrimesFromBackend(location, size) {
    const url = `https://doc.gold.ac.uk/usr/697/api/nearby?lat=${location.latitude}&lng=${location.longitude}&size=${size}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Backend API error ${response.status}`);
      const data = await response.json();

      return data.map(crime => ({ ...crime, source: 'report' }));
    } catch (error) {
      console.error('Backend API error:', error);
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
            const latitude = parseFloat(crime.location?.latitude || crime.latitude);
            const longitude = parseFloat(crime.location?.longitude || crime.longitude);
            if (!latitude || !longitude) return null; // Skip if location data is missing
            return (
              <Marker
                key={crime.id || index} // Use a unique identifier if available
                coordinate={{ latitude, longitude }}
                title={crime.category || crime.crime_type || 'Crime'}
                description={crime.location?.street?.name || crime.description || 'No description'}
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