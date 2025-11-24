import React, { createContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotifications } from '../hooks/useNotifications';
import { hslToHex, hexToHsl } from '../utils/colorUtils';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // Get current username from localStorage (set by LoginPage)
  const currentUsername = localStorage.getItem('username');
  const userSettingsFromLogin = localStorage.getItem('userSettings');
  
  const defaultSettings = {
    // General
    username: null,
    statusMessage: '',

    // Privacy
    showOnline: true,
    readReceipts: true,
    typingIndicator: true,
    lastSeen: false,

    // Notifications
    notifications: true,
    soundNotifications: true,
    desktopNotifications: false,
    mentionNotifications: true,

    // Chat
    fontSize: 'medium',
    messageDisplay: 'cozy',
    enterToSend: true,
    showTimestamps: true,
    groupMessages: true,

    // Appearance
    theme: 'dark',

    // Personalization
    primaryColor: '#66CCDA',
    secondaryColor: '#0394BB',
    userColor: '#DD8E32',
    othersColor: '#13801D',

    // Data
    autoDownload: false,
    saveHistory: true,
  };

  // Initialize settings from userSettings (from login) or default
  let initialSettings = defaultSettings;
  if (userSettingsFromLogin) {
    try {
      const parsed = JSON.parse(userSettingsFromLogin);
      initialSettings = { ...defaultSettings, ...parsed };
    } catch (e) {
      initialSettings = defaultSettings;
    }
  }

  const [settings, setSettings] = useState(initialSettings);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { requestPermission, showNotification, playNotificationSound } = useNotifications();

  // When username changes (logout/login), reset settings to the new user's settings
  useEffect(() => {
    if (userSettingsFromLogin) {
      try {
        const parsed = JSON.parse(userSettingsFromLogin);
        const newSettings = { ...defaultSettings, ...parsed };
        setSettings(newSettings);
        // Also update localStorage chatSettings
        localStorage.setItem('chatSettings', JSON.stringify(newSettings));
      } catch (e) {
        setSettings(defaultSettings);
        localStorage.setItem('chatSettings', JSON.stringify(defaultSettings));
      }
    } else {
      setSettings(defaultSettings);
      localStorage.setItem('chatSettings', JSON.stringify(defaultSettings));
    }
  }, [currentUsername, userSettingsFromLogin]);

  // Apply settings when they change
  useEffect(() => {
    applySettings();
  }, [settings]);

  // Save settings to backend when they change (if user is logged in)
  // Use debouncing to avoid spamming the backend
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentUsername && settings) {
        saveSettingsToBackend(currentUsername, settings);
      }
    }, 500); // Wait 500ms after last change before saving

    return () => clearTimeout(debounceTimer);
  }, [settings, currentUsername]);

  const saveSettingsToBackend = async (username, newSettings) => {
    try {
      const response = await fetch('http://localhost:5000/api/v0/auth/save-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          settings: newSettings
        })
      });

      if (!response.ok) {
        console.error('Failed to save settings to backend:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving settings to backend:', error);
    }
  };

  const applySettings = () => {
    // Apply theme
    document.body.className = `theme-${settings.theme}`;
    
    // Apply font size
    const fontSizeMap = {
      small: '1.0rem',
      medium: '1.5rem',
      large: '2.0rem'
    };
    document.documentElement.style.setProperty(
      '--message-font-size',
      fontSizeMap[settings.fontSize] || '1.5rem'
    );

    // Apply message spacing
    const spacingMap = {
      compact: '20px',
      cozy: '40px',
      spacious: '60px'
    };
    document.documentElement.style.setProperty(
      '--message-gap',
      spacingMap[settings.messageDisplay] || '40px'
    );

    // Apply privacy settings
    document.documentElement.style.setProperty(
      '--typing-indicator-display',
      settings.typingIndicator ? 'block' : 'none'
    );
    document.documentElement.style.setProperty(
      '--read-receipts-display',
      settings.readReceipts ? 'block' : 'none'
    );
    document.documentElement.style.setProperty(
      '--online-status-display',
      settings.showOnline ? 'inline-block' : 'none'
    );

    // Apply color settings
    document.documentElement.style.setProperty('--colour-primary', settings.primaryColor);
    document.documentElement.style.setProperty('--colour-secondary', settings.secondaryColor);
    document.documentElement.style.setProperty('--colour-user', settings.userColor);
    document.documentElement.style.setProperty('--colour-others', settings.othersColor);

    // Request notification permission if enabled
    if (settings.desktopNotifications) {
      requestPermission();
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateMultipleSettings = (updates) => {
    setSettings(prev => ({
      ...prev,
      ...updates
    }));
  };

  const resetSettings = () => {
    setSettings({
      username: null,
      statusMessage: '',
      showOnline: true,
      readReceipts: true,
      typingIndicator: true,
      lastSeen: false,
      notifications: true,
      soundNotifications: true,
      desktopNotifications: false,
      mentionNotifications: true,
      fontSize: 'medium',
      messageDisplay: 'cozy',
      enterToSend: true,
      showTimestamps: true,
      groupMessages: true,
      theme: 'dark',
      primaryColor: '#66CCDA',
      secondaryColor: '#0394BB',
      userColor: '#DD8E32',
      othersColor: '#13801D',
      autoDownload: false,
      saveHistory: true,
    });
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const showSettingsNotification = (title, message) => {
    if (settings.notifications) {
      if (settings.soundNotifications) {
        playNotificationSound();
      }
      if (settings.desktopNotifications) {
        showNotification(title, { body: message });
      }
    }
  };

  const value = {
    settings,
    isSettingsOpen,
    updateSetting,
    updateMultipleSettings,
    resetSettings,
    openSettings,
    closeSettings,
    showSettingsNotification,
    hslToHex,
    hexToHsl
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};