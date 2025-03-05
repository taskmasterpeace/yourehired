import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if user has a preference stored
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Check if user prefers dark mode at the OS level
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set dark mode based on saved preference or OS preference
    const initialDarkMode = savedDarkMode || prefersDarkMode;
    setIsDarkMode(initialDarkMode);
    document.documentElement.classList.toggle('dark', initialDarkMode);
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    setIsDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
    localStorage.setItem('darkMode', checked.toString());
  };

  return { isDarkMode, toggleDarkMode };
};
