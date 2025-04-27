// This file handles the map page, which plots crime data from the Police API and user reports. 

// Import necessary modules and components. These include: hooks to use state and side effects, components and APIs from React Native to render the UI, providing access to device location, retrieving the theme, and using a colour palette.
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location'; 
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Import files I created for creating a uniform UI using a centralised stylesheet, and a file for retrieving the user's settings.
import { useCommonStyles } from '@/constants/commonStyles'; 
import { useSettings } from '@/constants/settingsContext'; 

// Import map components for rendering the map and pins
import MapView, { Marker } from 'react-native-maps';

// Import Expo Notifications for push-style alerts
import * as Notifications from 'expo-notifications';

// AsyncStorage for persisting when notifications last triggered
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set notification system behaviour (alert, sound, badge)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Mappings for crime type to colour for map pins
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

// Calculate the coordinates of a square around the user for map searches
function getSquareCoordinates(lat, lon, size) {
  // Earth radius in meters
  const R = 6378137; 
  // Half-side in meters 
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

// Ternary to assign "Low", "Medium", or "High" risk labels based on crime density
const getRiskLevel = count => (count > 250 ? 'High' : count > 100 ? 'Medium' : 'Low');

// Shows a notification if in high-risk area (no more than once every few minutes)
const notifyIfHighRisk = async () => {
  const now = Date.now();
  const lastNotifiedStr = await AsyncStorage.getItem('lastHighRiskNotification');
  const lastNotified = lastNotifiedStr ? parseInt(lastNotifiedStr, 10) : 0;
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes, not 0.25 min!
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

// Map components
const Index = () => {
  
  // Define constants for customisation logic. Retrieve the user's colour and text size preference, apply the theme, apply styles from the global stylesheet, adjust font size, adjust background and text colour, notification preferences, and crime data source.
  const {
    darkMode,
    textSize,
    notifications: notificationsEnabled,
    crimeSource
  } = useSettings();

  const systemTheme = useColorScheme();
  const effectiveTheme = darkMode === 'system' ? systemTheme : darkMode;
  const styles = useCommonStyles(); // Load global styles for layout

  const dynamicTextSize = { small: 12, medium: 16, large: 20, }[textSize] || 16;

  const backgroundColor = effectiveTheme === 'dark' ? '#000' : '#fff';
  const textColor = effectiveTheme === 'dark' ? '#fff' : '#000';

  // State logic - keep track of everything fetched or shown. Includes latitude and longitude, loading status, array of crimes, error message, map's centre and zoom, crime filters, and risk label.
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [crimeData, setCrimeData] = useState([]);
  const [error, setError] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [initialRegionSet, setInitialRegionSet] = useState(false);
  const [selectedCrimeType, setSelectedCrimeType] = useState('all-crime');
  const [riskLevel, setRiskLevel] = useState(null);

  // Effect for location permissions and live tracking
  useEffect(() => {
    let locationSubscription;
    (async () => {
      // Request user location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }
      // Watch location updates (high accuracy for live tracking, once per metre)
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          setLoading(false);
          // Only set initial map region on first fetch
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
    // Clean up when component unmounts
    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, [initialRegionSet]);

  // Effect to fetch crime when location/configuration changes
  useEffect(() => {
    if (location) {
      //Square size in metres
      const size = 1500;

      // Helper to fetch data from multiple APIs
      const fetchRelevantCrimes = async () => {
        let crimes = [];
        // Fetch from police.uk if required
        if (crimeSource === 'both' || crimeSource === 'met') {
          const metCrimes = await fetchCrimesFromMetAPI(getSquareCoordinates(location.latitude, location.longitude, size));
          crimes = crimes.concat(Array.isArray(metCrimes) ? metCrimes : []);
        }
        // Fetch from backend (user reports) if required
        if (crimeSource === 'both' || crimeSource === 'report') {
          const userCrimes = await fetchCrimesFromBackend(location, size);
          crimes = crimes.concat(Array.isArray(userCrimes) ? userCrimes : []);
        }
        // Remove invalid crime reports (missing category or coordinates)
        crimes = crimes.filter(
          c => c && typeof c === 'object' && ((c.category || c.crime_type) && ((c.location && c.location.latitude && c.location.longitude) ||(c.latitude && c.longitude)))
        );
        setCrimeData(crimes);

        // Set risk level according to how many crimes found
        const risk = getRiskLevel(crimes.length);
        setRiskLevel(risk);

        // Show a notification if risk is high and notifications enabled
        if (risk === 'High' && notificationsEnabled) {
          notifyIfHighRisk();
        }
      };

      fetchRelevantCrimes();
    }
  }, [location, notificationsEnabled, crimeSource]);

  
  // Fetch crimes from UK police API in a geo-boundary
  async function fetchCrimesFromMetAPI(squareCoords) {
    try {
      // Police.uk API: get data for two months ago, as often there's delay in dataset
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const date = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
      // Compose API URL using a polygon
      const url = encodeURI(`https://data.police.uk/api/crimes-street/all-crime?poly=${squareCoords.topLeft.lat},${squareCoords.topLeft.lon}:${squareCoords.topRight.lat},${squareCoords.topRight.lon}:${squareCoords.bottomRight.lat},${squareCoords.bottomRight.lon}:${squareCoords.bottomLeft.lat},${squareCoords.bottomLeft.lon}&date=${date}`);
      const response = await fetch(url);
      // If network or API error
      if (!response.ok) throw new Error(`Met API error ${response.status}`);
      const data = await response.json();
      // Attach source for later filtering/visuals
      return Array.isArray(data) ? data.map(crime => ({ ...crime, source: 'met' })) : [];
    } catch (error) {
      console.error('Met API error:', error);
      return [];
    }
  }

  // Fetch app user-reported crimes from backend API (hosted on doc.gold.ac.uk/usr/697)
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

  // Crime list filtered by selected type ("all-crime" = show all available)
  const filteredCrimes = selectedCrimeType === 'all-crime'
    ? crimeData
    : crimeData.filter(
        crime =>
          (crime.category || crime.crime_type) === selectedCrimeType
      );

  // Render main content
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Title and status */}
      <Text style={[styles.title, { color: textColor, fontSize: dynamicTextSize + 4 }]}>
        Map
      </Text>
      {loading && (<ActivityIndicator size="large" color={Colors[systemTheme].tint} />)}
      {error && (
        <Text style={[styles.error, { color: 'red', fontSize: dynamicTextSize }]}>
          {error}
        </Text>
      )}

      {/* Pills for filtering what crimes to show */}
      <View style={styles.pillContainer}>
        <TouchableOpacity
          style={[styles.pill, selectedCrimeType === 'all-crime' && styles.pillSelected]}
          onPress={() => setSelectedCrimeType('all-crime')}
        >
          <Text style={[styles.pillText, { fontSize: dynamicTextSize }]}>All</Text>
        </TouchableOpacity>
        {/* One pill per crime category */}
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
    
          {/* Display the number of crimes and risk level */}
          <Text style={[styles.text, { color: textColor, fontSize: dynamicTextSize }]}>
            Crimes Shown: {filteredCrimes.length}
          </Text>
          {riskLevel && (
            <Text style={[styles.text, {color: riskLevel === 'High' ? 'red' : riskLevel === 'Medium' ? 'orange': 'green', fontSize: dynamicTextSize, },]}>
              Risk Level: {riskLevel}
            </Text>
          )}
    
          {/* Map with crime pins */}
          {mapRegion && (
            <MapView
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              // Blue dot for user location
              showsUserLocation={true} 
            >
              {/* Place a pin for each crime */}
              {filteredCrimes.map((crime, index) => {
                if (!crime) return null;
                // Get type/category and colour for this pin
                const category = crime.category || crime.crime_type || 'other-crime';
                const pinColor = crimeTypes[category] || 'grey';
                // Look up where to place the pin on the map
                const latitude = parseFloat(crime.location?.latitude || crime.latitude);
                const longitude = parseFloat(crime.location?.longitude || crime.longitude);
                if (!latitude || !longitude) return null; // Don't show if missing information
    
                return (
                  <Marker
                    key={crime.id || index}
                    coordinate={{ latitude, longitude }}
                    pinColor={pinColor}
                    title={category.replace(/-/g, " ")}
                    description={ crime.location?.street?.name || crime.description || 'No description'}
                  />
                );
              })}
            </MapView>
          )}
      </View>
  );
};

export default Index;