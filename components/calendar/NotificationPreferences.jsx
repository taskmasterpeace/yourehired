import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Bell, BellOff, Clock, Info } from 'lucide-react';
import { useToast } from "../ui/use-toast";

const NotificationPreferences = ({ isOpen, onClose, preferences, onSave, onTestNotification }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    enabled: true,
    browserNotifications: true,
    inAppNotifications: true,
    defaultReminderTime: '30', // minutes before event
    emailNotifications: false,
  });
  
  // Admin controls state
  const [showAdminControls, setShowAdminControls] = useState(false);
  
  // Handle test notification
  const handleTestNotification = (minutes) => {
    if (onTestNotification) {
      onTestNotification(minutes);
      toast({
        title: "Test Notification *",
        description: `A test notification will appear in ${minutes === 0 ? 'a few seconds' : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`}.`,
        duration: 3000,
      });
    }
  };

  // Initialize form with user preferences
  useEffect(() => {
    if (preferences) {
      setSettings({
        ...settings,
        ...preferences
      });
    }
  }, [preferences]);

  // Handle form input changes
  const handleChange = (field, value) => {
    setSettings(prev => ({
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(settings);
    
    toast({
      title: "Notification Preferences Saved",
      description: settings.enabled 
        ? "You'll be notified about upcoming events." 
        : "Event notifications have been disabled.",
      duration: 3000,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Preferences
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
                checked={settings.enabled}
                onCheckedChange={(checked) => handleChange('enabled', checked)}
              />
            </div>
            
            {settings.enabled && (
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
                        checked={settings.browserNotifications}
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
                    checked={settings.inAppNotifications}
                    onCheckedChange={(checked) => handleChange('inAppNotifications', checked)}
                  />
                </div>
                
                {/* Email Notifications */}
                <div className="flex items-center justify-between pl-4 border-l-2 border-gray-100">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive email reminders for important events
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
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
                    value={settings.defaultReminderTime} 
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
              </>
            )}
          </div>
          
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
          
          <DialogFooter className="relative">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Preferences
            </Button>
            
            {/* Admin toggle button */}
            <div className="absolute bottom-2 right-2">
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-gray-600"
                onClick={() => setShowAdminControls(!showAdminControls)}
              >
                {showAdminControls ? "Hide Admin Controls" : "•"}
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPreferences;
