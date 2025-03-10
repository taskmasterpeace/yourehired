import React from 'react';
import { SettingsScreen } from '../components/settings/SettingsScreen';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <SettingsScreen 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
    </div>
  );
}
