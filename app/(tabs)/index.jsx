import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useCommonStyles } from '@/constants/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const crimeTypes = {
  'anti-social-behaviour': 'darkred',
  'bicycle-theft': 'crimson',
  'burglary': 'red',
  'criminal-damage-arson': 'orange',
  'drugs': 'goldenrod',
  'other-theft': 'limegreen',
  'possession-of-weapons': 'green',
  'public-order': 'mediumturquoise',
  'robbery': 'blue',
  'shoplifting': 'darkblue',
  'theft-from-the-person': 'purple',
  'vehicle-crime': 'darkorchid',
  'violent-crime': 'grey',
  'other-crime': 'black',
};

function getSquareCoordinates(lat, lon, size) {
  const R = 6378137;
  const d = size / 2;
  const latRad = lat * Math.PI / 180;
  const dLat = d / R;
  const dLon = d / (R * Math.cos(latRad));

  return {
    topLeft: { lat: lat + (dLat * 180 / Math.PI), lon: lon - (dLon * 180 / Math.PI) },
    topRight: { lat: lat + (dLat * 180 / Math.PI), lon: lon + (dLon * 180 / Math.PI) },
    bottomLeft: { lat: lat - (dLat * 180 / Math.PI), lon: lon - (dLon * 180 / Math.PI) },
    bottomRight: { lat: lat - (dLat * 180 / Math.PI), lon: lon + (dLon * 180 / Math.PI) },
  };
}

const getRiskLevel = (count) => {
  //if (count < 150) return 'Low';
  //if (count < 300) return 'Medium';
  return 'High';
};

const notifyIfHighRisk = async () => {
  const now = Date.now();
  const lastNotifiedStr = await AsyncStorage.getItem('lastHighRiskNotification');
  const lastNotified = lastNotifiedStr ? parseInt(lastNotifiedStr, 10) : 0;
  const fiveMinutes = 0.25 * 60 * 1000;

  if (now - lastNotified > fiveMinutes) {
    await AsyncStorage.setItem('lastHighRiskNotification', now.toString());
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ High-Risk Area Detected',
        body: 'You are currently in a high-risk area based on recent crimes.',
        sound: true,
      },
      trigger: null,
    });
  }
};

const Index = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [crimeData, setCrimeData] = useState([]);
  const [error, setError] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [initialRegionSet, setInitialRegionSet] = useState(false);
  const [selectedCrimeType, setSelectedCrimeType] = useState('all-crime');
  const [riskLevel, setRiskLevel] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const colorScheme = useColorScheme();
  const styles = useCommonStyles();

  useEffect(() => {
    AsyncStorage.getItem('notifyHighRisk').then(value => {
      if (value !== null) {
        setNotificationsEnabled(value === 'true');
      }
    });

    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    })();
  }, []);

  useEffect(() => {
    let locationSubscription;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          setLoading(false);

          if (!initialRegionSet) {
            setMapRegion({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
            setInitialRegionSet(true);
          }
        }
      );
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [initialRegionSet]);

  useEffect(() => {
    if (location) {
      const size = 1500;
      const fetchAllCrimes = async () => {
        const [policeData, backendData] = await Promise.all([
          fetchCrimesFromMetAPI(getSquareCoordinates(location.latitude, location.longitude, size)),
          fetchCrimesFromBackend(location, size),
        ]);
        const allCrimes = [...policeData, ...backendData];
        setCrimeData(allCrimes);
        const risk = getRiskLevel(allCrimes.length);
        setRiskLevel(risk);

        if (risk === 'High' && notificationsEnabled) {
          notifyIfHighRisk();
        }
      };
      fetchAllCrimes();
    }
  }, [location, notificationsEnabled]);

  async function fetchCrimesFromMetAPI(squareCoords) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const date = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    const url = encodeURI(
      `https://data.police.uk/api/crimes-street/all-crime?poly=${squareCoords.topLeft.lat},${squareCoords.topLeft.lon}:${squareCoords.topRight.lat},${squareCoords.topRight.lon}:${squareCoords.bottomRight.lat},${squareCoords.bottomRight.lon}:${squareCoords.bottomLeft.lat},${squareCoords.bottomLeft.lon}&date=${date}`
    );

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Met API error ${response.status}`);
      const data = await response.json();
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

  const filteredCrimes = selectedCrimeType === 'all-crime'
    ? crimeData
    : crimeData.filter(crime => (crime.category || crime.crime_type) === selectedCrimeType);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Map</Text>
      {loading && <ActivityIndicator size="large" color={Colors[colorScheme].tint} />}
      {error && <Text style={[styles.error, { color: 'red' }]}>{error}</Text>}
      <View style={styles.pillContainer}>
        <TouchableOpacity
          style={[styles.pill, selectedCrimeType === 'all-crime' && styles.pillSelected]}
          onPress={() => setSelectedCrimeType('all-crime')}
        >
          <Text style={styles.pillText}>All</Text>
        </TouchableOpacity>
        {Object.entries(crimeTypes).map(([type, color]) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.pill,
              selectedCrimeType === type && [styles.pillSelected, { borderColor: color }],
            ]}
            onPress={() => setSelectedCrimeType(type)}
          >
            <Text style={[styles.pillText, { color }]}>{type.replace(/-/g, ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.text, { color: Colors[colorScheme].text }]}>Crimes Shown: {filteredCrimes.length}</Text>
      {riskLevel && (
        <Text style={[styles.text, { color: riskLevel === 'High' ? 'red' : riskLevel === 'Medium' ? 'orange' : 'green' }]}>
          Risk Level: {riskLevel}
        </Text>
      )}

      {mapRegion && (
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={true}
        >
          {filteredCrimes.map((crime, index) => {
            const category = crime.category || crime.crime_type;
            const pinColor = crimeTypes[category] || 'grey';
            const latitude = parseFloat(crime.location?.latitude || crime.latitude);
            const longitude = parseFloat(crime.location?.longitude || crime.longitude);
            if (!latitude || !longitude) return null;
            return (
              <Marker
                key={crime.id || index}
                coordinate={{ latitude, longitude }}
                pinColor={pinColor}
                title={category}
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
