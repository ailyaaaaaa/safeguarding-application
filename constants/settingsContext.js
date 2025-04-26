import React, { createContext, useEffect, useState, useContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState("system");
  const [textSize, setTextSize] = useState("medium");
  const [crimeSource, setCrimeSource] = useState("both");
  const [notifications, setNotifications] = useState(true);

  // On mount, load settings
  useEffect(() => {
    (async () => {
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
      if (savedDarkMode) setDarkMode(savedDarkMode);
      if (savedTextSize) setTextSize(savedTextSize);
      if (savedCrimeSource) setCrimeSource(savedCrimeSource);
      if (savedNotifications !== null)
        setNotifications(savedNotifications === "true");
    })();
  }, []);

  // Persist changes
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

  const value = {
    darkMode,
    setDarkMode,
    textSize,
    setTextSize,
    crimeSource,
    setCrimeSource,
    notifications,
    setNotifications,
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
};

// Custom hook:
export const useSettings = () => useContext(SettingsContext);