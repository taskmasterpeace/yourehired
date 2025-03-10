import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Button } from "../ui/button";
import { Bell, BellOff, Clock, Info } from 'lucide-react';
import { useToast } from "../ui/use-toast";

const NotificationSettings = () => {
  const { settings, updateSettings, addTestNotification } = useNotifications();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState({
    enabled: true,
    browserNotifications: true,
    inAppNotifications: true,
    defaultReminderTime: '30',
    emailNotifications: false,
    notifyOnNewEvents: true,
    notifyOnEventUpdates: true,
    notifyOnEventReminders: true,
    notifyOnSystemUpdates: false
  });
  
  // Admin controls state
  const [showAdminControls, setShowAdminControls] = useState(false);
  
  // Initialize form with user preferences
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        ...localSettings,
        ...settings
      });
    }
  }, [settings]);
  
  // Handle form input changes
  const handleChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Check if browser notifications are supported and permission is granted
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  
  useEffect(() => {
    // Check if browser notifications are supported
    const supported = 'Notification' in window;
    setNotificationsSupported(supported);
    
    if (supported) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Request notification permission
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive notifications for upcoming events.",
          duration: 3000,
        });
        
        // Show a test notification
        new Notification("Notification Test", {
          body: "Event reminders are now enabled!",
          icon: "/logo-small.png"
        });
        
        handleChange('browserNotifications', true);
      } else {
        toast({
          title: "Notification Permission Denied",
          description: "You won't receive browser notifications for events.",
          variant: "destructive",
          duration: 4000,
        });
        
        handleChange('browserNotifications', false);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Error Enabling Notifications",
        description: "There was a problem enabling notifications.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Handle test notification
  const handleTestNotification = (minutes) => {
    if (addTestNotification) {
      addTestNotification(minutes);
      toast({
        title: "Test Notification",
        description: `A test notification will appear in ${minutes === 0 ? 'a few seconds' : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`}.`,
        duration: 3000,
      });
    }
  };
  
  // Save settings
  const handleSave = () => {
    updateSettings(localSettings);
    toast({
      title: "Notification Preferences Saved",
      description: localSettings.enabled 
        ? "You'll be notified about upcoming events." 
        : "Event notifications have been disabled.",
      duration: 3000,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Enable/Disable All Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-enabled" className="text-base">
                Enable Event Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Receive reminders about upcoming events
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={localSettings.enabled}
              onCheckedChange={(checked) => handleChange('enabled', checked)}
            />
          </div>
          
          {localSettings.enabled && (
            <>
              {/* Browser Notifications */}
              <div className="flex items-center justify-between pl-4 border-l-2 border-gray-100">
                <div>
                  <Label htmlFor="browser-notifications" className="text-base">
                    Browser Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications even when the app is in background
                  </p>
                </div>
                
                {notificationsSupported ? (
                  notificationPermission === 'granted' ? (
                    <Switch
                      id="browser-notifications"
                      checked={localSettings.browserNotifications}
                      onCheckedChange={(checked) => handleChange('browserNotifications', checked)}
                    />
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={requestPermission}
                    >
                      Enable
                    </Button>
                  )
                ) : (
                  <div className="text-sm text-amber-600 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Not supported
                  </div>
                )}
              </div>
              
              {/* In-App Notifications */}
              <div className="flex items-center justify-between pl-4 border-l-2 border-gray-100">
                <div>
                  <Label htmlFor="in-app-notifications" className="text-base">
                    In-App Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Show notifications within the application
                  </p>
                </div>
                <Switch
                  id="in-app-notifications"
                  checked={localSettings.inAppNotifications}
                  onCheckedChange={(checked) => handleChange('inAppNotifications', checked)}
                />
              </div>
              
              {/* Default Reminder Time */}
              <div className="mt-2">
                <Label htmlFor="reminder-time" className="text-base flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Default Reminder Time
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  How far in advance should we notify you?
                </p>
                
                <Select 
                  value={localSettings.defaultReminderTime} 
                  onValueChange={(value) => handleChange('defaultReminderTime', value)}
                >
                  <SelectTrigger id="reminder-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="10">10 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="120">2 hours before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Notification Types */}
              <div className="mt-4">
                <Label className="text-base">Notification Types</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Choose which types of notifications you want to receive
                </p>
                
                <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-reminders" className="text-sm">
                      Event Reminders
                    </Label>
                    <Switch
                      id="notify-reminders"
                      checked={localSettings.notifyOnEventReminders}
                      onCheckedChange={(checked) => handleChange('notifyOnEventReminders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-new-events" className="text-sm">
                      New Events
                    </Label>
                    <Switch
                      id="notify-new-events"
                      checked={localSettings.notifyOnNewEvents}
                      onCheckedChange={(checked) => handleChange('notifyOnNewEvents', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-updates" className="text-sm">
                      Event Updates
                    </Label>
                    <Switch
                      id="notify-updates"
                      checked={localSettings.notifyOnEventUpdates}
                      onCheckedChange={(checked) => handleChange('notifyOnEventUpdates', checked)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Admin Testing Controls */}
          {showAdminControls && (
            <div className="mt-4 p-3 border border-dashed border-amber-300 rounded-md bg-amber-50">
              <div className="flex items-center mb-2">
                <Info className="h-4 w-4 mr-2 text-amber-500" />
                <Label className="text-base font-medium text-amber-700">Admin Testing Controls</Label>
              </div>
              <p className="text-sm text-amber-600 mb-3">
                Test notification system with different timing options
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTestNotification(0)}
                  className="bg-white"
                >
                  Test Now
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTestNotification(1)}
                  className="bg-white"
                >
                  Test in 1 min
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTestNotification(5)}
                  className="bg-white"
                >
                  Test in 5 min
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
          
          {/* Admin toggle button */}
          <div className="text-right">
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-gray-600"
              onClick={() => setShowAdminControls(!showAdminControls)}
            >
              {showAdminControls ? "Hide Admin Controls" : "•"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
