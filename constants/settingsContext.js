//Import necessary modules and components. 
import React, { createContext, useEffect, useState, useContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a React Context for user settings, accessible app-wide
const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // App's settings states, including theme, text size, data source, and notifications
  const [darkMode, setDarkMode] = useState("system");
  const [textSize, setTextSize] = useState("medium");
  const [crimeSource, setCrimeSource] = useState("both");
  const [notifications, setNotifications] = useState(true);

  // Load settings when the app starts
  useEffect(() => {
    (async () => {
      // Fetch all saved settings in parallel for performance
      const [
        savedDarkMode,
        savedTextSize,
        savedCrimeSource,
        savedNotifications,
      ] = await Promise.all([
        AsyncStorage.getItem("darkMode"),
        AsyncStorage.getItem("textSize"),
        AsyncStorage.getItem("crimeSource"),
        AsyncStorage.getItem("notifyHighRisk"),
      ]);
      // Only overwrite defaults if a value exists in storage
      if (savedDarkMode) setDarkMode(savedDarkMode);
      if (savedTextSize) setTextSize(savedTextSize);
      if (savedCrimeSource) setCrimeSource(savedCrimeSource);
      if (savedNotifications !== null)
        setNotifications(savedNotifications === "true"); 
    })();
  }, []);

  // Save settings when changed
  useEffect(() => {
    AsyncStorage.setItem("darkMode", darkMode);
  }, [darkMode]);
  useEffect(() => {
    AsyncStorage.setItem("textSize", textSize);
  }, [textSize]);
  useEffect(() => {
    AsyncStorage.setItem("crimeSource", crimeSource);
  }, [crimeSource]);
  useEffect(() => {
    AsyncStorage.setItem("notifyHighRisk", notifications.toString());
  }, [notifications]);

  // Bundle state and setter functions to provide app-wide
  const value = { darkMode, setDarkMode, textSize, setTextSize, crimeSource, setCrimeSource, notifications, setNotifications, };

  // Make the settings/context available to all children components
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);