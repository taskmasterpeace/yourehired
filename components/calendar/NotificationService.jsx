import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from "../ui/use-toast";
import { differenceInMinutes, isPast, addMinutes } from 'date-fns';

const useNotificationService = (events = [], notificationPreferences = {}) => {
  const { toast } = useToast();
  const [activeNotifications, setActiveNotifications] = useState([]);
  const notificationTimers = useRef({});
  
  // Default preferences if none provided
  const preferences = {
    enabled: true,
    browserNotifications: true,
    inAppNotifications: true,
    defaultReminderTime: '30', // minutes before event
    ...notificationPreferences
  };
  
  // Clear all existing timers when component unmounts or preferences change
  const clearAllTimers = useCallback(() => {
    Object.values(notificationTimers.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    notificationTimers.current = {};
  }, []);
  
  // Function to show a browser notification
  const showBrowserNotification = useCallback((event) => {
    if (!preferences.browserNotifications || !('Notification' in window)) {
      return;
    }
    
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(`Upcoming: ${event.title}`, {
          body: `${event.description || ''}\n${event.location ? `Location: ${event.location}` : ''}`,
          icon: '/logo-small.png',
          tag: `event-${event.id}`, // Prevents duplicate notifications
          requireInteraction: true // Notification persists until user interacts with it
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
          // You could add navigation to the event details here
        };
      } catch (error) {
        console.error("Error showing browser notification:", error);
      }
    }
  }, [preferences.browserNotifications]);
  
  // Function to show an in-app notification
  const showInAppNotification = useCallback((event) => {
    if (!preferences.inAppNotifications) {
      return;
    }
    
    toast({
      title: `Upcoming: ${event.title}`,
      description: `${event.location ? `Location: ${event.location}` : 'Starting soon'}`,
      duration: 10000, // 10 seconds
      action: (
        <button 
          onClick={() => {
            // You could add navigation to the event details here
            console.log("Notification clicked for event:", event.id);
          }}
          className="bg-primary text-white px-3 py-1 rounded-md text-xs"
        >
          View
        </button>
      ),
    });
    
    // Add to active notifications
    setActiveNotifications(prev => [...prev, event.id]);
    
    // Remove from active notifications after 10 seconds
    setTimeout(() => {
      setActiveNotifications(prev => prev.filter(id => id !== event.id));
    }, 10000);
  }, [preferences.inAppNotifications, toast]);
  
  // Schedule notifications for all events
  const scheduleNotifications = useCallback(() => {
    if (!preferences.enabled || !events || events.length === 0) {
      return;
    }
    
    // Clear existing timers
    clearAllTimers();
    
    // Get the reminder time in minutes
    const reminderMinutes = parseInt(preferences.defaultReminderTime, 10) || 30;
    
    // Current time
    const now = new Date();
    
    // Schedule notifications for each event
    events.forEach(event => {
      try {
        // Skip if event has no valid start date
        if (!event.startDate && !event.date) {
          return;
        }
        
        // Get the event start time
        const eventStartTime = new Date(event.startDate || event.date);
        
        // Skip past events
        if (isPast(eventStartTime)) {
          return;
        }
        
        // Calculate when to show the notification
        const notificationTime = addMinutes(eventStartTime, -reminderMinutes);
        
        // If notification time is in the past, skip this event
        if (isPast(notificationTime)) {
          return;
        }
        
        // Calculate delay in milliseconds
        const delayMs = notificationTime.getTime() - now.getTime();
        
        // Schedule the notification
        notificationTimers.current[event.id] = setTimeout(() => {
          // Show browser notification
          showBrowserNotification(event);
          
          // Show in-app notification
          showInAppNotification(event);
          
          // Remove this timer reference
          delete notificationTimers.current[event.id];
        }, delayMs);
        
        console.log(`Scheduled notification for "${event.title}" in ${Math.round(delayMs / 60000)} minutes`);
      } catch (error) {
        console.error(`Error scheduling notification for event ${event.id}:`, error);
      }
    });
  }, [events, preferences, clearAllTimers, showBrowserNotification, showInAppNotification]);
  
  // Set up notifications when events or preferences change
  useEffect(() => {
    scheduleNotifications();
    
    // Clean up timers when component unmounts
    return clearAllTimers;
  }, [events, preferences, scheduleNotifications, clearAllTimers]);
  
  // Request notification permission if needed
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }, []);
  
  // Check for upcoming events (for immediate notifications)
  const checkUpcomingEvents = useCallback(() => {
    if (!preferences.enabled || !events || events.length === 0) {
      return [];
    }
    
    const reminderMinutes = parseInt(preferences.defaultReminderTime, 10) || 30;
    const now = new Date();
    
    return events.filter(event => {
      try {
        if (!event.startDate && !event.date) return false;
        
        const eventStartTime = new Date(event.startDate || event.date);
        if (isPast(eventStartTime)) return false;
        
        const minutesUntilEvent = differenceInMinutes(eventStartTime, now);
        return minutesUntilEvent > 0 && minutesUntilEvent <= reminderMinutes;
      } catch (error) {
        console.error("Error checking upcoming event:", error);
        return false;
      }
    });
  }, [events, preferences]);
  
  return {
    activeNotifications,
    requestNotificationPermission,
    checkUpcomingEvents,
    rescheduleNotifications: scheduleNotifications
  };
};

export default useNotificationService;
