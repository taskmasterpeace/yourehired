import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from './NotificationContext';
import { checkBackupNeeded, calculateLocalStorageSize, getNewEntriesCount } from '../utils/backupReminders';

const BackupReminderContext = createContext();

export const useBackupReminder = () => useContext(BackupReminderContext);

export const BackupReminderProvider = ({ children }) => {
  const [isLocalStorageOnly, setIsLocalStorageOnly] = useState(true);
  const [lastBackupDate, setLastBackupDate] = useState(null);
  const { addBackupReminder } = useNotifications();
  
  // Load last backup date from localStorage on mount
  useEffect(() => {
    const storedDate = localStorage.getItem('lastBackupDate');
    if (storedDate) {
      setLastBackupDate(storedDate);
    }
    
    // Check for backup needed on initial load
    checkForBackupNeeded();
    
    // Set up interval to check daily
    const intervalId = setInterval(checkForBackupNeeded, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Check if backup is needed
  const checkForBackupNeeded = () => {
    if (!isLocalStorageOnly) return;
    
    const backupNeeded = checkBackupNeeded({
      lastBackupDate,
      newEntriesSinceBackup: getNewEntriesCount(lastBackupDate),
      dataSize: calculateLocalStorageSize(),
      isLocalStorageOnly
    });
    
    if (backupNeeded) {
      addBackupReminder(backupNeeded);
    }
  };
  
  // Record a backup
  const recordBackup = () => {
    const now = new Date().toISOString();
    localStorage.setItem('lastBackupDate', now);
    setLastBackupDate(now);
  };
  
  // Toggle storage mode
  const setStorageMode = (isLocal) => {
    setIsLocalStorageOnly(isLocal);
  };
  
  const value = {
    isLocalStorageOnly,
    lastBackupDate,
    checkForBackupNeeded,
    recordBackup,
    setStorageMode
  };
  
  return (
    <BackupReminderContext.Provider value={value}>
      {children}
    </BackupReminderContext.Provider>
  );
};
