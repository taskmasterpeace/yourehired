import React, { useState } from 'react';
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
import { Button } from "../ui/button";
import { Bell, BellOff, Clock, Settings } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const NotificationPreferences = ({ 
  preferences = {}, 
  onUpdatePreferences = () => {},
  user = null
}) => {
  const [settings, setSettings] = useState({
    enabled: true,
    browserNotifications: false,
    inAppNotifications: true,
    emailNotifications: false,
    reminderTimes: [30], // minutes before event
    ...preferences
  });
  
  // Toggle a boolean setting
  const toggleSetting = (setting) => {
    const updatedSettings = {
      ...settings,
      [setting]: !settings[setting]
    };
    setSettings(updatedSettings);
    onUpdatePreferences(updatedSettings);
  };
  
  // Update reminder time
  const updateReminderTime = (value) => {
    const minutes = parseInt(value, 10);
    const updatedSettings = {
      ...settings,
      reminderTimes: [minutes]
    };
    setSettings(updatedSettings);
    onUpdatePreferences(updatedSettings);
  };
  
  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const updatedSettings = {
          ...settings,
          browserNotifications: true
        };
        setSettings(updatedSettings);
        onUpdatePreferences(updatedSettings);
        
        // Show a test notification
        new Notification('Hey You\'re Hired!', {
          body: 'Notifications are now enabled!',
          icon: '/logo-small.png'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };
  
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center">
          {settings.enabled ? 
            <Bell className="w-5 h-5 mr-2 text-blue-500" /> : 
            <BellOff className="w-5 h-5 mr-2 text-gray-500" />}
          Calendar Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how you want to be reminded about your upcoming events
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
                onCheckedChange={() => toggleSetting('browserNotifications')}
              />
            </div>
            
            {!settings.browserNotifications && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={requestNotificationPermission}
                className="w-full mt-2"
              >
                <Bell className="w-4 h-4 mr-2" />
                Enable Browser Notifications
              </Button>
            )}
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive email reminders for important events
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={() => toggleSetting('emailNotifications')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-time">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Reminder Time
                </div>
              </Label>
              <Select
                value={settings.reminderTimes[0].toString()}
                onValueChange={updateReminderTime}
              >
                <SelectTrigger id="reminder-time">
                  <SelectValue placeholder="Select when to be reminded" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="120">2 hours before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Advanced Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationPreferences;
