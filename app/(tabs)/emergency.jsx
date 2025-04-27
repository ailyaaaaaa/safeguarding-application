// This file handles the emergency page, used to provide the user with emergency contact information, and allow them to call these numbers.

// Import necessary modules and components. These include: hooks to use state and side effects, components and APIs from React Native to render the UI, providing access to device location, retrieving the theme, and using a colour palette.
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location'; 
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Import files I created for creating a uniform UI using a centralised stylesheet, and a file for retrieving the user's settings.
import { useCommonStyles } from '@/constants/commonStyles'; 
import { useSettings } from '@/constants/settingsContext'; 


//Emergency creates states for finds the user's location (null until fetched), keeps track of the user's country (null until fetched), 
const Emergency = () => {
  // Define constants for the page's functionality. Creates states for the user's location, country code, emergency number information (structured as Ambulance, Fire, Police, Dispatch), a loading indicator, and an error message state.
  const [location, setLocation] = useState(null);
  const [countryCode, setCountryCode] = useState(null);
  const [emergencyInfo, setEmergencyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define constants for customisation logic. Retrieve the user's colour and text size preference, apply the theme, apply styles from the global stylesheet, adjust font size, and adjust background and text colour.
  const { darkMode, textSize } = useSettings();
  const systemTheme = useColorScheme();
  const effectiveTheme = darkMode === 'system' ? systemTheme : darkMode;
  const styles = useCommonStyles();

  const dynamicTextSize = { small: 12, medium: 16, large: 20, }[textSize] || 16;

  const backgroundColor = effectiveTheme === 'dark' ? '#000' : '#fff';
  const textColor = effectiveTheme === 'dark' ? '#fff' : '#000';

  // Fetch location and emergency data.
  useEffect(() => {
    // An immediately-run async function fetches user location and country code
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      // If user denies location, show error and stop loading
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Fetch device coordinates (lat/lon)
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      try {
        // Use OpenCage API to translate coordinates to a country code
        const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${loc.coords.latitude}+${loc.coords.longitude}&key=e8f3831d70994ef994ff852d41569356`;
        const openCageResponse = await fetch(openCageUrl);
        if (!openCageResponse.ok)
          throw new Error(`OpenCage API error ${openCageResponse.status}`);
        const openCageData = await openCageResponse.json();
        // Extract the ISO alpha-2 country code (e.g. "GB", "IE")
        const cc = openCageData.results[0].components['ISO_3166-1_alpha-2'];
        setCountryCode(cc);
        // Fetch emergency numbers with country code
        await fetchEmergencyInfo(cc); 
      } catch (error) {
        // If location-based lookup fails, leave country null
        console.error('Error fetching country code:', error);
        setCountryCode(null);
      }
      setLoading(false);
    })();
  }, []);

  // Fetch emergency numbers by country
  const fetchEmergencyInfo = async (code) => {
    try {
      // Use EmergencyNumberAPI to map country codes to emergency numbers
      const emergencyUrl = `https://emergencynumberapi.com/api/country/${code}`;
      const response = await fetch(emergencyUrl);
      if (!response.ok)
        throw new Error(`Emergency Number API error ${response.status}`);
      const data = await response.json();
      // Each service can have multiple numbers (strip out empty entries)
      const ambulanceNumbers = (data.data.ambulance?.all || []).filter(Boolean);
      const fireNumbers = (data.data.fire?.all || []).filter(Boolean);
      const policeNumbers = (data.data.police?.all || []).filter(Boolean);
      const dispatchNumbers = (data.data.dispatch?.all || []).filter(Boolean);

      setEmergencyInfo({
        Ambulance: ambulanceNumbers,
        Fire: fireNumbers,
        Police: policeNumbers,
        Dispatch: dispatchNumbers,
      });
    } catch (error) {
      // If any error fetching, report empty numbers
      console.error('Error fetching emergency info:', error);
      setEmergencyInfo({
        Ambulance: [],
        Fire: [],
        Police: [],
        Dispatch: [],
      });
    }
  };

  // Make a call to the first valid number
  const dialNumber = (numbers) => {
    // Find the first non-empty phone number for a service and dial it
    const validNumber = numbers.find((n) => !!n && n.trim() !== '');
    if (validNumber) {
      Linking.openURL(`tel:${validNumber}`);
    }
  };

  // Render main content
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header Title */}
      <Text style={[styles.title, { color: textColor, fontSize: dynamicTextSize + 8 }]}> Emergency </Text>
      {/* Loading spinner for while everything is being fetched */}
      {loading && <ActivityIndicator size="large" color={Colors[systemTheme].tint} />}
      {/* Error Message if location is denied */}
      {error && <Text style={[styles.error, { fontSize: dynamicTextSize, color: textColor }]}>{error}</Text>}
      {/* Show current location & country code if available */}
      {location && (
        <Text style={[styles.location, { color: textColor, fontSize: dynamicTextSize }]}>
          Latitude: {location.latitude} {'\n'}
          Longitude: {location.longitude} {'\n'}
          Country Code: {countryCode || 'Fetching...'}
        </Text>
      )}

      {/* Emergency Information */}
      {emergencyInfo &&
        (() => {
          // Check which services have numbers present
          const hasAmbulance = Array.isArray(emergencyInfo.Ambulance) && emergencyInfo.Ambulance.length > 0;
          const hasFire = Array.isArray(emergencyInfo.Fire) && emergencyInfo.Fire.length > 0;
          const hasPolice = Array.isArray(emergencyInfo.Police) && emergencyInfo.Police.length > 0;
          const hasDispatch = Array.isArray(emergencyInfo.Dispatch) && emergencyInfo.Dispatch.length > 0;
          const hasAny = hasAmbulance || hasFire || hasPolice || hasDispatch;
          
          // If there are no numbers available for the country
          if (!hasAny) {
            return (
              <View style={styles.emergencyInfo}>
                <Text style={[styles.infoTitle, { color: textColor, fontSize: dynamicTextSize + 2 }]}>
                  No emergency services available for your location.
                </Text>
              </View>
            );
          }

          // For each available service, show number(s) and a call button
          return (
            <View style={styles.emergencyInfo}>
              <Text style={[styles.infoTitle, { color: textColor, fontSize: dynamicTextSize + 2 }]}>
                Emergency Numbers:
              </Text>
              {hasAmbulance && (
                <View style={styles.serviceContainer}>
                  <Text style={{ color: textColor, fontSize: dynamicTextSize }}>
                    Ambulance: {emergencyInfo.Ambulance.join(', ')}
                  </Text>
                  <TouchableOpacity
                    style={styles.redPill}
                    onPress={() => dialNumber(emergencyInfo.Ambulance)}
                  >
                    <Text style={styles.pillButtonText}>Call Ambulance</Text>
                  </TouchableOpacity>
                </View>
              )}
              {hasFire && (
                <View style={styles.serviceContainer}>
                  <Text style={{ color: textColor, fontSize: dynamicTextSize }}>
                    Fire: {emergencyInfo.Fire.join(', ')}
                  </Text>
                  <TouchableOpacity
                    style={styles.redPill}
                    onPress={() => dialNumber(emergencyInfo.Fire)}
                  >
                    <Text style={styles.pillButtonText}>Call Fire</Text>
                  </TouchableOpacity>
                </View>
              )}
              {hasPolice && (
                <View style={styles.serviceContainer}>
                  <Text style={{ color: textColor, fontSize: dynamicTextSize }}>
                    Police: {emergencyInfo.Police.join(', ')}
                  </Text>
                  <TouchableOpacity
                    style={styles.redPill}
                    onPress={() => dialNumber(emergencyInfo.Police)}
                  >
                    <Text style={styles.pillButtonText}>Call Police</Text>
                  </TouchableOpacity>
                </View>
              )}
              {hasDispatch && (
                <View style={styles.serviceContainer}>
                  <Text style={{ color: textColor, fontSize: dynamicTextSize }}>
                    Dispatch: {emergencyInfo.Dispatch.join(', ')}
                  </Text>
                  <TouchableOpacity
                    style={styles.redPill}
                    onPress={() => dialNumber(emergencyInfo.Dispatch)}
                  >
                    <Text style={styles.pillButtonText}>Call Dispatch</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })()}
    </View>
  );
};

export default Emergency;