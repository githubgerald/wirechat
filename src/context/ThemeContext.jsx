import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  const [colors, setColors] = useLocalStorage('themeColors', {
    primary: '#66CCDA',
    secondary: '#0394BB',
    user: '#DD8E32',
    others: '#13801D',
    admin: '#467592',
    mention: '#3a3af8'
  });

  useEffect(() => {
    // Apply theme class to body
    document.body.className = `theme-${theme}`;
    
    // Apply CSS custom properties for colors
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--colour-${key}`, value);
    });

    // Set primary color variations
    root.style.setProperty(
      '--colour-primary-low-opacity', 
      `color-mix(in srgb, ${colors.primary} 30%, transparent)`
    );

    // Set semantic colors
    root.style.setProperty('--border-color', colors.primary);
    root.style.setProperty('--navbar-bg', colors.primary);

  }, [theme, colors]);

  const updateColor = (colorType, hexColor) => {
    setColors(prev => ({
      ...prev,
      [colorType]: hexColor
    }));
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const resetColors = () => {
    setColors({
      primary: '#66CCDA',
      secondary: '#0394BB',
      user: '#DD8E32',
      others: '#13801D',
      admin: '#467592',
      mention: '#3a3af8'
    });
  };

  const value = {
    theme,
    colors,
    updateTheme,
    updateColor,
    resetColors,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isOled: theme === 'oled'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};