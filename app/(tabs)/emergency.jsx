import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Linking, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useCommonStyles } from '@/constants/commonStyles';

const Emergency = () => {
  const [location, setLocation] = useState(null);
  const [countryCode, setCountryCode] = useState(null);
  const [emergencyInfo, setEmergencyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const colorScheme = useColorScheme();
  const styles = useCommonStyles(); // Call the function to get styles


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

      try {
        const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${loc.coords.latitude}+${loc.coords.longitude}&key=e8f3831d70994ef994ff852d41569356`;
        const openCageResponse = await fetch(openCageUrl);
        if (!openCageResponse.ok) throw new Error(`OpenCage API error ${openCageResponse.status}`);
        const openCageData = await openCageResponse.json();
        const countryCode = openCageData.results[0].components['ISO_3166-1_alpha-2'];
        setCountryCode(countryCode);
        fetchEmergencyInfo(countryCode);
      } catch (error) {
        console.error('Error fetching country code:', error);
        setCountryCode(null);
      }

      setLoading(false);
    })();
  }, []);

  const fetchEmergencyInfo = async (code) => {
    try {
      const emergencyUrl = `https://emergencynumberapi.com/api/country/${code}`;
      const response = await fetch(emergencyUrl);
      if (!response.ok) throw new Error(`Emergency Number API error ${response.status}`);
      const data = await response.json();

      const ambulanceNumbers = (data.data.ambulance?.all || []).filter(n => !!n && n.trim() !== '');
      const fireNumbers = (data.data.fire?.all || []).filter(n => !!n && n.trim() !== '');
      const policeNumbers = (data.data.police?.all || []).filter(n => !!n && n.trim() !== '');
      const dispatchNumbers = (data.data.dispatch?.all || []).filter(n => !!n && n.trim() !== '');

      setEmergencyInfo({
        Ambulance: ambulanceNumbers,
        Fire: fireNumbers,
        Police: policeNumbers,
        Dispatch: dispatchNumbers,
      });
    } catch (error) {
      console.error('Error fetching emergency info:', error);
      setEmergencyInfo({
        Ambulance: [],
        Fire: [],
        Police: [],
        Dispatch: [],
      });
    }
  };

  const dialNumber = (numbers) => {
    const validNumber = numbers.find(n => !!n && n.trim() !== '');
    if (validNumber) {
      Linking.openURL(`tel:${validNumber}`);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={[styles.title]}>Emergency</Text>
      {loading && <ActivityIndicator size="large" color={Colors[colorScheme].tint} />}
      {error && <Text style={[styles.error]}>{error}</Text>}
      {location && (
        <Text style={[styles.location]}>
          Latitude: {location.latitude} {'\n'}
          Longitude: {location.longitude} {'\n'}
          Country Code: {countryCode || 'Fetching...'}
        </Text>
      )}

      {emergencyInfo && (() => {
        const hasAmbulance = Array.isArray(emergencyInfo.Ambulance) && emergencyInfo.Ambulance.length > 0;
        const hasFire = Array.isArray(emergencyInfo.Fire) && emergencyInfo.Fire.length > 0;
        const hasPolice = Array.isArray(emergencyInfo.Police) && emergencyInfo.Police.length > 0;
        const hasDispatch = Array.isArray(emergencyInfo.Dispatch) && emergencyInfo.Dispatch.length > 0;
        const hasAny = hasAmbulance || hasFire || hasPolice || hasDispatch;

        if (!hasAny) {
          return (
            <View style={styles.emergencyInfo}>
              <Text style={styles.infoTitle}>No emergency services available for your location.</Text>
            </View>
          );
        }

        return (
          <View style={styles.emergencyInfo}>
            <Text style={styles.infoTitle}>Emergency Numbers:</Text>

            {hasAmbulance && (
              <View style={styles.serviceContainer}>
                <Text>Ambulance: {emergencyInfo.Ambulance.join(', ')}</Text>
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
              <Text>Fire: {emergencyInfo.Fire.join(', ')}</Text>
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
              <Text>Police: {emergencyInfo.Police.join(', ')}</Text>
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
              <Text>Dispatch: {emergencyInfo.Dispatch.join(', ')}</Text>
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