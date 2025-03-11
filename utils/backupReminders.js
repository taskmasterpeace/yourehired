import { differenceInDays } from 'date-fns';

/**
 * Checks if a backup reminder should be shown based on various criteria
 * @param {Object} options - Options for determining if a reminder is needed
 * @param {Date} options.lastBackupDate - Date of the last backup
 * @param {number} options.newEntriesSinceBackup - Number of new entries since last backup
 * @param {string} options.dataSize - Size of the data in storage (e.g., "5MB")
 * @param {boolean} options.isLocalStorageOnly - Whether the app is in local storage only mode
 * @returns {Object|null} Reminder data or null if no reminder needed
 */
export const checkBackupNeeded = (options) => {
  const { 
    lastBackupDate, 
    newEntriesSinceBackup = 0, 
    dataSize = '0KB',
    isLocalStorageOnly = false
  } = options;
  
  // If not in local storage only mode, no need for backup reminders
  if (!isLocalStorageOnly) {
    return null;
  }
  
  // If no last backup date, definitely need a backup
  if (!lastBackupDate) {
    return {
      daysSinceBackup: Infinity,
      newEntries: newEntriesSinceBackup,
      totalSize: dataSize,
      priority: 'high'
    };
  }
  
  const daysSinceBackup = differenceInDays(new Date(), new Date(lastBackupDate));
  
  // Determine priority based on criteria
  let priority = 'low';
  
  if (daysSinceBackup > 30 || newEntriesSinceBackup > 50) {
    priority = 'high';
  } else if (daysSinceBackup > 14 || newEntriesSinceBackup > 20) {
    priority = 'medium';
  }
  
  // Check if any threshold is met
  if (daysSinceBackup >= 7 || newEntriesSinceBackup >= 10) {
    return {
      daysSinceBackup,
      newEntries: newEntriesSinceBackup,
      totalSize: dataSize,
      priority
    };
  }
  
  return null;
};

/**
 * Calculates the size of data in localStorage
 * @returns {string} Size in KB or MB
 */
export const calculateLocalStorageSize = () => {
  let total = 0;
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length * 2; // UTF-16 characters are 2 bytes each
    }
  }
  
  if (total < 1024) {
    return `${total}B`;
  } else if (total < 1024 * 1024) {
    return `${Math.round(total / 1024)}KB`;
  } else {
    return `${Math.round(total / (1024 * 1024))}MB`;
  }
};

/**
 * Gets the count of new entries since last backup
 * @param {Date} lastBackupDate - Date of the last backup
 * @returns {number} Count of new entries
 */
export const getNewEntriesCount = (lastBackupDate) => {
  if (!lastBackupDate) return 0;
  
  // This is a placeholder - you would implement this based on your data structure
  // For example, you might count new job applications, events, etc. since the backup date
  try {
    const lastBackupTime = new Date(lastBackupDate).getTime();
    
    // Example: count new job applications
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const newApplications = applications.filter(app => {
      return new Date(app.createdAt).getTime() > lastBackupTime;
    }).length;
    
    // Example: count new events
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const newEvents = events.filter(event => {
      return new Date(event.createdAt).getTime() > lastBackupTime;
    }).length;
    
    return newApplications + newEvents;
  } catch (error) {
    console.error('Error counting new entries:', error);
    return 0;
  }
};
