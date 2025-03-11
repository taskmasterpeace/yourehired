import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    enabled: true,
    browserNotifications: true,
    inAppNotifications: true,
    defaultReminderTime: '30', // minutes before event
    emailNotifications: false, // Marked with asterisk as placeholder
    notifyOnNewEvents: true,
    notifyOnEventUpdates: true,
    notifyOnEventReminders: true,
    notifyOnSystemUpdates: false // Marked with asterisk as placeholder
  });
  
  // Load notifications and settings from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        try {
          // Add extra validation to ensure it's valid JSON
          const parsed = JSON.parse(savedNotifications);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          } else {
            console.error('Invalid notifications format in localStorage, resetting');
            localStorage.removeItem('notifications');
          }
        } catch (parseError) {
          console.error('Error parsing notifications from localStorage:', parseError);
          localStorage.removeItem('notifications');
        }
      }
      
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        try {
          // Add extra validation to ensure it's valid JSON
          const parsed = JSON.parse(savedSettings);
          if (parsed && typeof parsed === 'object') {
            setSettings(parsed);
          } else {
            console.error('Invalid notification settings format in localStorage, resetting');
            localStorage.removeItem('notificationSettings');
          }
        } catch (parseError) {
          console.error('Error parsing notification settings from localStorage:', parseError);
          localStorage.removeItem('notificationSettings');
        }
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
  }, []);
  
  // Save notifications to localStorage when they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }, [notifications]);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings to localStorage:', error);
    }
  }, [settings]);
  
  // Add a new notification
  const addNotification = useCallback((notification) => {
    // Check if notifications are enabled
    if (!settings.enabled) return null;
    
    // Check if this type of notification is enabled
    if (notification.type === 'event_reminder' && !settings.notifyOnEventReminders) return null;
    if (notification.type === 'new_event' && !settings.notifyOnNewEvents) return null;
    if (notification.type === 'event_update' && !settings.notifyOnEventUpdates) return null;
    if (notification.type === 'system' && !settings.notifyOnSystemUpdates) return null;
    
    const newNotification = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show browser notification if enabled
    if (settings.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`Hey, You're Hired!: ${notification.title}`, {
          body: notification.message,
          icon: '/logo-small.png'
        });
      } catch (error) {
        console.error('Error showing browser notification:', error);
      }
    }
    
    return newNotification.id;
  }, [settings]);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Clear a single notification
  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  }, []);
  
  // Mark a single notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);
  
  // Update notification settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  // Add event reminder notification
  const addEventReminder = useCallback((event) => {
    if (!settings.enabled || !settings.notifyOnEventReminders) return null;
    
    return addNotification({
      type: 'event_reminder',
      title: `Reminder: ${event.title}`,
      message: `This event is starting soon${event.location ? ` at ${event.location}` : ''}.`,
      eventId: event.id
    });
  }, [settings, addNotification]);
  
  // Add test notification (for admin testing)
  const addTestNotification = useCallback((minutes = 0) => {
    const testNotification = {
      type: 'test',
      title: 'Test Notification *',
      message: 'This is a test notification triggered manually',
      eventId: null
    };
    
    if (minutes === 0) {
      return addNotification(testNotification);
    } else {
      setTimeout(() => {
        addNotification({
          ...testNotification,
          message: `This is a test notification scheduled for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
        });
      }, minutes * 60 * 1000);
      
      return 'scheduled';
    }
  }, [addNotification]);
  
  // Add backup reminder notification
  const addBackupReminder = useCallback((dataStats = {}) => {
    if (!settings.enabled) return null;
    
    const { daysSinceBackup = 7, newEntries = 10, totalSize = '5MB' } = dataStats;
    
    let title = 'Time to Back Up Your Data';
    let message = 'It\'s been a while since your last backup.';
    
    if (daysSinceBackup > 30) {
      title = 'Backup Overdue!';
      message = `It's been ${daysSinceBackup} days since your last backup.`;
    } else if (newEntries > 20) {
      title = 'New Data Needs Backup';
      message = `You've added ${newEntries} new entries since your last backup.`;
    } else if (totalSize && totalSize.includes('MB') && parseInt(totalSize) > 10) {
      title = 'Large Data Volume';
      message = `Your data (${totalSize}) should be backed up soon.`;
    }
    
    return addNotification({
      type: 'backup_reminder',
      title,
      message,
      eventId: null,
      actionUrl: '/settings?tab=backup'
    });
  }, [settings, addNotification]);
  
  // Get unread notifications count
  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);
  
  const value = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    clearAllNotifications,
    clearNotification,
    markAllAsRead,
    markAsRead,
    updateSettings,
    addEventReminder,
    addTestNotification,
    addBackupReminder
  };
  
  // Debug log
  console.log('NotificationContext value:', {
    notificationsCount: notifications.length,
    unreadCount,
    hasAddTestNotification: !!addTestNotification
  });
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
