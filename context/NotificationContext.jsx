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
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
  }, []);
  
  // Save notifications to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }, [notifications]);
  
  // Save settings to localStorage when they change
  useEffect(() => {
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
        new Notification(`Hey You're Hired!: ${notification.title}`, {
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
    addTestNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
