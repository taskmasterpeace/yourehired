import React, { useEffect, useState } from 'react';
import { useToast } from "../ui/use-toast";
import { Bell, BellOff } from 'lucide-react';
import { Button } from "../ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../ui/card";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

/**
 * NotificationService component for managing calendar event notifications
 * This component handles browser notifications and in-app reminders
 */
const NotificationService = ({ 
  events = [], 
  preferences = {}, 
  onUpdatePreferences = () => {},
  user = null
}) => {
  const { toast } = useToast();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [settings, setSettings] = useState({
    enabled: true,
    browserNotifications: false,
    inAppNotifications: true,
    reminderTimes: [30], // minutes before event
    ...preferences
  });

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        
        // Update settings if permission granted
        if (permission === 'granted') {
          const updatedSettings = {
            ...settings,
            browserNotifications: true
          };
          setSettings(updatedSettings);
          onUpdatePreferences(updatedSettings);
          
          // Show success toast
          toast({
            title: "Hey! Notifications Enabled",
            description: "You'll now receive notifications for upcoming events.",
            duration: 3000,
          });
        }
      });
    }
  };

  // Toggle notification settings
  const toggleSetting = (setting) => {
    const updatedSettings = {
      ...settings,
      [setting]: !settings[setting]
    };
    
    // If enabling browser notifications, check permission
    if (setting === 'browserNotifications' && 
        updatedSettings.browserNotifications && 
        notificationPermission !== 'granted') {
      requestPermission();
      return;
    }
    
    setSettings(updatedSettings);
    onUpdatePreferences(updatedSettings);
  };

  // Check for upcoming events
  useEffect(() => {
    if (!settings.enabled) return;
    
    const checkEvents = () => {
      const now = new Date();
      const upcomingEvents = events.filter(event => {
        try {
          const eventStart = new Date(event.startDate || event.date);
          if (isNaN(eventStart.getTime())) return false;
          
          const diffMs = eventStart - now;
          const diffMins = Math.floor(diffMs / 60000);
          
          // Check if event is starting within any of the reminder times
          return settings.reminderTimes.some(minutes => 
            diffMins > 0 && diffMins <= minutes
          );
        } catch (error) {
          console.error("Error checking event time:", error);
          return false;
        }
      });
      
      // Show notifications for upcoming events
      upcomingEvents.forEach(event => {
        // In-app notifications (toast)
        if (settings.inAppNotifications) {
          toast({
            title: `Hey! Upcoming: ${event.title}`,
            description: `This event is starting soon. - Hey You're Hired! v0.41`,
            duration: 5000,
          });
        }
        
        // Browser notifications
        if (settings.browserNotifications && notificationPermission === 'granted') {
          try {
            const notification = new Notification("Hey You're Hired! - Upcoming Event", {
              body: `${event.title} is starting soon.`,
              icon: "/logo-small.png"
            });
            
            // Close notification after 10 seconds
            setTimeout(() => notification.close(), 10000);
            
            // Handle notification click
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          } catch (error) {
            console.error("Error showing browser notification:", error);
          }
        }
      });
    };
    
    // Check immediately and then set interval
    checkEvents();
    const intervalId = setInterval(checkEvents, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [events, settings, notificationPermission, toast]);

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center">
          {settings.enabled ? 
            <Bell className="w-5 h-5 mr-2 text-blue-500" /> : 
            <BellOff className="w-5 h-5 mr-2 text-gray-500" />}
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how you want to be notified about your calendar events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Turn all notifications on or off
            </p>
          </div>
          <Switch
            id="notifications-enabled"
            checked={settings.enabled}
            onCheckedChange={() => toggleSetting('enabled')}
          />
        </div>
        
        {settings.enabled && (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Show notifications within the application
                </p>
              </div>
              <Switch
                id="in-app-notifications"
                checked={settings.inAppNotifications}
                onCheckedChange={() => toggleSetting('inAppNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-notifications">Browser Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Show notifications even when the app is in the background
                </p>
              </div>
              <Switch
                id="browser-notifications"
                checked={settings.browserNotifications}
                disabled={notificationPermission !== 'granted'}
                onCheckedChange={() => toggleSetting('browserNotifications')}
              />
            </div>
            
            {notificationPermission !== 'granted' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={requestPermission}
                className="w-full mt-2"
              >
                <Bell className="w-4 h-4 mr-2" />
                Enable Browser Notifications
              </Button>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500 dark:text-gray-400">
        Notifications will be shown 30 minutes before events start
      </CardFooter>
    </Card>
  );
};

export default NotificationService;
