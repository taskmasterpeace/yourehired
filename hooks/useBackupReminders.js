import { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { checkBackupNeeded, calculateLocalStorageSize, getNewEntriesCount } from '../utils/backupReminders';

/**
 * Hook to check if backup reminders should be shown
 * @param {Object} options - Options for the hook
 * @param {boolean} options.isLocalStorageOnly - Whether the app is in local storage only mode
 * @param {boolean} options.enabled - Whether to enable the hook
 * @param {number} options.checkInterval - How often to check in milliseconds (default: 24 hours)
 */
export const useBackupReminders = (options = {}) => {
  const { 
    isLocalStorageOnly = false, 
    enabled = true,
    checkInterval = 24 * 60 * 60 * 1000 // 24 hours
  } = options;
  
  const { addBackupReminder } = useNotifications();
  
  useEffect(() => {
    if (!enabled || !isLocalStorageOnly) return;
    
    // Check immediately on mount
    checkForBackupNeeded();
    
    // Set up interval for regular checks
    const intervalId = setInterval(checkForBackupNeeded, checkInterval);
    
    return () => clearInterval(intervalId);
  }, [enabled, isLocalStorageOnly, checkInterval]);
  
  const checkForBackupNeeded = () => {
    // Get the last backup date from localStorage
    const lastBackupDate = localStorage.getItem('lastBackupDate');
    
    // Check if backup is needed
    const backupNeeded = checkBackupNeeded({
      lastBackupDate,
      newEntriesSinceBackup: getNewEntriesCount(lastBackupDate),
      dataSize: calculateLocalStorageSize(),
      isLocalStorageOnly
    });
    
    // If backup is needed, show a notification
    if (backupNeeded) {
      addBackupReminder(backupNeeded);
    }
  };
  
  return { checkForBackupNeeded };
};
