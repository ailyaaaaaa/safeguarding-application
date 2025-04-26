import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useCommonStyles } from '@/constants/commonStyles';
import * as Notifications from 'expo-notifications';
import { useSettings } from '@/constants/settingsContext';

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

const getRiskLevel = (count) => (count > 250 ? 'High' : count > 100 ? 'Medium' : 'Low'); // demo logic

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
  const {
    darkMode,
    textSize,
    notifications: notificationsEnabled,
    crimeSource
  } = useSettings();

  // Key update: get system theme and compute effectiveTheme like in other files
  const systemTheme = useColorScheme();
  const effectiveTheme = darkMode === 'system' ? systemTheme : darkMode;

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [crimeData, setCrimeData] = useState([]);
  const [error, setError] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [initialRegionSet, setInitialRegionSet] = useState(false);
  const [selectedCrimeType, setSelectedCrimeType] = useState('all-crime');
  const [riskLevel, setRiskLevel] = useState(null);

  const styles = useCommonStyles();

  const dynamicTextSize = {
    small: 12,
    medium: 16,
    large: 20,
  }[textSize] || 16;
  const backgroundColor = effectiveTheme === 'dark' ? '#000' : '#fff';
  const textColor = effectiveTheme === 'dark' ? '#fff' : '#000';

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
      const fetchRelevantCrimes = async () => {
        let crimes = [];
        if (crimeSource === 'both' || crimeSource === 'met') {
          const metCrimes = await fetchCrimesFromMetAPI(getSquareCoordinates(location.latitude, location.longitude, size));
          crimes = crimes.concat(Array.isArray(metCrimes) ? metCrimes : []);
        }
        if (crimeSource === 'both' || crimeSource === 'report') {
          const userCrimes = await fetchCrimesFromBackend(location, size);
          crimes = crimes.concat(Array.isArray(userCrimes) ? userCrimes : []);
        }
        crimes = crimes.filter(
          c =>
            c &&
            (typeof c === 'object') &&
            ((c.category || c.crime_type) && ((c.location && c.location.latitude && c.location.longitude) || (c.latitude && c.longitude)))
        );
        setCrimeData(crimes);
        const risk = getRiskLevel(crimes.length);
        setRiskLevel(risk);
        if (risk === 'High' && notificationsEnabled) {
          notifyIfHighRisk();
        }
      };
      fetchRelevantCrimes();
    }
  }, [location, notificationsEnabled, crimeSource]);

  async function fetchCrimesFromMetAPI(squareCoords) {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const date = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
      const url = encodeURI(
        `https://data.police.uk/api/crimes-street/all-crime?poly=${squareCoords.topLeft.lat},${squareCoords.topLeft.lon}:${squareCoords.topRight.lat},${squareCoords.topRight.lon}:${squareCoords.bottomRight.lat},${squareCoords.bottomRight.lon}:${squareCoords.bottomLeft.lat},${squareCoords.bottomLeft.lon}&date=${date}`
      );
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Met API error ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data.map(crime => ({ ...crime, source: 'met' })) : [];
    } catch (error) {
      console.error('Met API error:', error);
      return [];
    }
  }
  async function fetchCrimesFromBackend(location, size) {
    try {
      const url = `https://doc.gold.ac.uk/usr/697/api/nearby?lat=${location.latitude}&lng=${location.longitude}&size=${size}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Backend API error ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data.map(crime => ({ ...crime, source: 'report' })) : [];
    } catch (error) {
      console.error('Backend API error:', error);
      return [];
    }
  }

  const filteredCrimes = selectedCrimeType === 'all-crime'
    ? crimeData
    : crimeData.filter(
        crime =>
          (crime.category || crime.crime_type) === selectedCrimeType
      );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor, fontSize: dynamicTextSize + 4 }]}>
        Map
      </Text>
      {loading && (
        <ActivityIndicator size="large" color={Colors[systemTheme].tint} />
      )}
      {error && (
        <Text style={[styles.error, { color: 'red', fontSize: dynamicTextSize }]}>
          {error}
        </Text>
      )}

      <View style={styles.pillContainer}>
        <TouchableOpacity
          style={[styles.pill, selectedCrimeType === 'all-crime' && styles.pillSelected]}
          onPress={() => setSelectedCrimeType('all-crime')}
        >
          <Text style={[styles.pillText, { fontSize: dynamicTextSize }]}>All</Text>
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
            <Text style={[styles.pillText, { color, fontSize: dynamicTextSize }]}>
              {type.replace(/-/g, ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.text, { color: textColor, fontSize: dynamicTextSize }]}>
        Crimes Shown: {filteredCrimes.length}
      </Text>
      {riskLevel && (
        <Text
          style={[
            styles.text,
            {
              color:
                riskLevel === 'High'
                  ? 'red'
                  : riskLevel === 'Medium'
                  ? 'orange'
                  : 'green',
              fontSize: dynamicTextSize,
            },
          ]}
        >
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
            if (!crime) return null;
            const category = crime.category || crime.crime_type || 'other-crime';
            const pinColor = crimeTypes[category] || 'grey';
            const latitude = parseFloat(
              crime.location?.latitude || crime.latitude
            );
            const longitude = parseFloat(
              crime.location?.longitude || crime.longitude
            );
            if (!latitude || !longitude) return null;
            return (
              <Marker
                key={crime.id || index}
                coordinate={{ latitude, longitude }}
                pinColor={pinColor}
                title={category}
                description={
                  crime.location?.street?.name ||
                  crime.description ||
                  'No description'
                }
              />
            );
          })}
        </MapView>
      )}
    </View>
  );
};

export default Index;