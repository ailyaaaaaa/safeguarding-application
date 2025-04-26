// commonStyles.js
import { StyleSheet } from 'react-native';
import { Colors } from './Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export const useCommonStyles = () => {
  const colorScheme = useColorScheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: Colors[colorScheme].text,
      marginBottom: 10,
      textAlign: 'center',
    },
    label: {
    fontSize: 22,
    marginBottom: 5,
    color: Colors[colorScheme].text,
    textAlign: 'center',
    },
    text: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      textAlign: 'center',
      marginBottom: 10,
    },
    centerText: {
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      fontSize: 16,
      width: '80%',
    },
    picker: {
      marginBottom: 10,
      alignItems: 'stretch', 
      width: '80%',
    },
    location: {
      fontSize: 18,
      color: Colors[colorScheme].text,
      textAlign: 'center',
    },
    error: {
      fontSize: 18,
      color: 'red',
      textAlign: 'center',
    },
    emergencyInfo: {
      marginTop: 20,
      alignItems: 'center',
      color: Colors[colorScheme].text,
    },
    infoTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: Colors[colorScheme].text,
      textAlign: 'center',
    },
    serviceContainer: {
      marginBottom: 10,
      alignItems: 'center',
    },
    subtitle: {
      fontSize: 20,
      fontWeight: '600',
      color: Colors[colorScheme].text,
      textAlign: 'center',
      marginBottom: 10,
    },
    map: {
      width: '90%',
      height: '50%',
      marginTop: 10,
    },
    crime: {
      fontSize: 16,
      color: 'black',
      marginTop: 5,
    },

    button: {
      marginHorizontal: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: '#f5f5f5',
    },
    buttonText: {
      fontSize: 14,
      fontWeight: 'bold',
      textTransform: 'capitalize',
    },
    pillContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      paddingHorizontal: 10,
      gap: 8,
      marginVertical: 10,
    },
    pill: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#f9f9f9',
    },
    pillSelected: {
      backgroundColor: '#e6f0ff',
      borderColor: '#007aff',
    },  
    pillText: {
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    // Add these to your useCommonStyles StyleSheet.create
    redPill: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: 'red',
      marginVertical: 5,
      width: '80%',
    },
    bluePill: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: '#007AFF',
      marginVertical: 5,
      width: '80%',
    },
    pillButtonText: {
      color: 'white',
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '600',
    },
    settingGroup: {
      marginBottom: 20,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 5,
      color: Colors[colorScheme].text,
    },
    //Settings
    radioGroupOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 0, // Remove vertical spacing since it's now horizontal
      marginRight: 18, // Add more space between items
      paddingVertical: 4,
    },
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
    radioOuterSelected: {
      borderColor: '#007AFF',
    },
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
    radioGroupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap', // Allows wrapping if there are many options/small screen
      marginBottom: 8,
      marginTop: 2
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
};