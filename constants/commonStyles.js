// This is a global stylesheet for the app, ensuring uniformity.

// Import necessary modules and components. 
import { StyleSheet } from 'react-native';
import { Colors } from './Colors'; 
import { useColorScheme } from '@/hooks/useColorScheme';

// This hook returns the common styles shared throughout the app, adapting the colours to the current theme (light/dark).
export const useCommonStyles = () => {
  // Get the current colour scheme from the system or app settings
  const colorScheme = useColorScheme();

  // Create and return themed styles using React Native StyleSheet
  return StyleSheet.create({
    // General flex container, centred
    container: {
      flex: 1,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Large bold screen title
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: Colors[colorScheme].text,
      marginBottom: 10,
      textAlign: 'center',
    },
    // Form labels
    label: {
      fontSize: 22,
      marginBottom: 5,
      color: Colors[colorScheme].text,
      textAlign: 'center',
    },
    // Standard body text
    text: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      textAlign: 'center',
      marginBottom: 10,
    },
    // For center-aligning text
    centerText: {
      textAlign: 'center',
    },
    // Generic TextInput styling (borders, rounded, spacing)
    input: {
      borderWidth: 1,
      borderColor: '#CCC',
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      fontSize: 16,
      width: '80%',
    },
    // Picker/dropdown styling
    picker: {
      marginBottom: 10,
      alignItems: 'stretch',
      width: '80%',
    },
    // For displaying a one-line location/address
    location: {
      fontSize: 18,
      color: Colors[colorScheme].text,
      textAlign: 'center',
    },
    // Error messages (theme-independent red color)
    error: {
      fontSize: 18,
      color: 'red',
      textAlign: 'center',
    },
    // Container for emergency numbers/info blocks
    emergencyInfo: {
      marginTop: 20,
      alignItems: 'center',
      color: Colors[colorScheme].text,
    },
    // Titles in emergency section
    infoTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: Colors[colorScheme].text,
      textAlign: 'center',
    },
    // Each emergency service row/container
    serviceContainer: {
      marginBottom: 10,
      alignItems: 'center',
    },
    // Subtitle/section header
    subtitle: {
      fontSize: 20,
      fontWeight: '600',
      color: Colors[colorScheme].text,
      textAlign: 'center',
      marginBottom: 10,
    },
    // Styles for the MapView element
    map: {
      width: '90%',
      height: '50%',
      marginTop: 10,
    },
    // Crime label in the map or list
    crime: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      marginTop: 5,
    },
    // Generic button styling
    button: {
      marginHorizontal: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: '#F5F5F5',
    },
    buttonText: {
      fontSize: 14,
      fontWeight: 'bold',
      textTransform: 'capitalize',
    },
    // Horizontal/row container for "pill" filter buttons
    pillContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      paddingHorizontal: 10,
      gap: 8, // Modern React Native gap support
      marginVertical: 10,
    },
    // Generic pill button (small, rounded, soft background)
    pill: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#CCC',
      backgroundColor: '#FFF',
    },
    // Styling for a selected pill (highlighted)
    pillSelected: {
      backgroundColor: '#E6F0FF',
      borderColor: '#007AFF',
    },
    // Text style for pills
    pillText: {
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    // Red pill/button for important actions (e.g., emergency call)
    redPill: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: 'red',
      marginVertical: 5,
      width: '80%',
    },
    // Blue pill/button for call-to-action
    bluePill: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: '#007AFF',
      marginVertical: 5,
      width: '80%',
    },
    // Text inside the pill buttons
    pillButtonText: {
      color: 'white',
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '600',
    },
    // Container for each settings block
    settingGroup: {
      marginBottom: 20,
    },
    // Label for each settings section
    settingLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 5,
      color: Colors[colorScheme].text,
    },
    // One radio button group option (row per option)
    radioGroupOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 0,
      marginRight: 18,
      paddingVertical: 4,
    },
    // Circle for radio - not selected
    radioOuter: {
      height: 22,
      width: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: '#888',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    // Circle for radio - selected
    radioOuterSelected: {
      borderColor: '#007AFF',
    },
    // Filled inner circle for a selected radio
    radioInner: {
      height: 12,
      width: 12,
      borderRadius: 6,
      backgroundColor: '#007AFF',
    },
    radioLabel: {
      fontSize: 16,
      color: Colors[colorScheme].text,
    },
    // Whole group row for radios
    radioGroupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: 8,
      marginTop: 2,
    },
    // Container for toggle and its label
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
};