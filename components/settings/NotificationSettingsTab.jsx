import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
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
import { Bell, Clock, Info } from 'lucide-react';
import { useToast } from "../ui/use-toast";

const NotificationSettingsTab = () => {
  const { settings, updateSettings, addTestNotification } = useNotifications();
  const { toast } = useToast();
  const [showAdminControls, setShowAdminControls] = useState(false);
  
  // Request notification permission
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ browserNotifications: true });
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive browser notifications.",
        });
      } else {
        updateSettings({ browserNotifications: false });
        toast({
          title: "Notification Permission Denied",
          description: "You won't receive browser notifications.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error Enabling Notifications",
        description: "There was a problem enabling notifications.",
        variant: "destructive",
      });
    }
  };
  
  // Handle test notification
  const handleTestNotification = (minutes) => {
    addTestNotification(minutes);
    toast({
      title: "Test Notification *",
      description: `A test notification will appear in ${minutes === 0 ? 'a few seconds' : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`}.`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Settings</h3>
        <p className="text-sm text-gray-500">
          Configure how and when you receive notifications
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Master toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notifications-enabled" className="text-base">
              Enable Notifications
            </Label>
            <p className="text-sm text-gray-500">
              Turn on/off all notifications
            </p>
          </div>
          <Switch
            id="notifications-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSettings({ enabled: checked })}
          />
        </div>
        
        {settings.enabled && (
          <>
            {/* Notification channels */}
            <div className="border rounded-md p-4 space-y-4">
              <h4 className="font-medium">Notification Channels</h4>
              
              {/* Browser Notifications */}
              <div className="flex items-center justify-between pl-4">
                <div>
                  <Label htmlFor="browser-notifications" className="text-base">
                    Browser Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications even when the app is in background
                  </p>
                </div>
                
                {'Notification' in window ? (
                  Notification.permission === 'granted' ? (
                    <Switch
                      id="browser-notifications"
                      checked={settings.browserNotifications}
                      onCheckedChange={(checked) => updateSettings({ browserNotifications: checked })}
                    />
                  ) : (
                    <Button 
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
              <div className="flex items-center justify-between pl-4">
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
                  onCheckedChange={(checked) => updateSettings({ inAppNotifications: checked })}
                />
              </div>
              
              {/* Email Notifications - Placeholder with asterisk */}
              <div className="flex items-center justify-between pl-4">
                <div className="flex items-start">
                  <Label htmlFor="email-notifications" className="text-base flex items-center">
                    Email Notifications *
                  </Label>
                  <span className="ml-1 text-amber-500 text-xs">(Coming soon)</span>
                  <p className="text-sm text-gray-500">
                    Receive email reminders for important events
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                  disabled
                />
              </div>
            </div>
            
            {/* Notification types */}
            <div className="border rounded-md p-4 space-y-4">
              <h4 className="font-medium">What to Notify Me About</h4>
              
              {/* Event Reminders */}
              <div className="flex items-center justify-between pl-4">
                <div>
                  <Label htmlFor="event-reminders" className="text-base">
                    Event Reminders
                  </Label>
                  <p className="text-sm text-gray-500">
                    Notifications for upcoming calendar events
                  </p>
                </div>
                <Switch
                  id="event-reminders"
                  checked={settings.notifyOnEventReminders}
                  onCheckedChange={(checked) => updateSettings({ notifyOnEventReminders: checked })}
                />
              </div>
              
              {/* New Events */}
              <div className="flex items-center justify-between pl-4">
                <div>
                  <Label htmlFor="new-events" className="text-base">
                    New Events
                  </Label>
                  <p className="text-sm text-gray-500">
                    Notifications when new events are added to your calendar
                  </p>
                </div>
                <Switch
                  id="new-events"
                  checked={settings.notifyOnNewEvents}
                  onCheckedChange={(checked) => updateSettings({ notifyOnNewEvents: checked })}
                />
              </div>
              
              {/* Event Updates */}
              <div className="flex items-center justify-between pl-4">
                <div>
                  <Label htmlFor="event-updates" className="text-base">
                    Event Updates
                  </Label>
                  <p className="text-sm text-gray-500">
                    Notifications when events are modified
                  </p>
                </div>
                <Switch
                  id="event-updates"
                  checked={settings.notifyOnEventUpdates}
                  onCheckedChange={(checked) => updateSettings({ notifyOnEventUpdates: checked })}
                />
              </div>
              
              {/* System Updates - Placeholder with asterisk */}
              <div className="flex items-center justify-between pl-4">
                <div className="flex items-start">
                  <Label htmlFor="system-updates" className="text-base">
                    System Updates *
                  </Label>
                  <span className="ml-1 text-amber-500 text-xs">(Coming soon)</span>
                  <p className="text-sm text-gray-500">
                    Notifications about system updates and maintenance
                  </p>
                </div>
                <Switch
                  id="system-updates"
                  checked={settings.notifyOnSystemUpdates}
                  onCheckedChange={(checked) => updateSettings({ notifyOnSystemUpdates: checked })}
                  disabled
                />
              </div>
            </div>
            
            {/* Default Reminder Time */}
            <div className="border rounded-md p-4">
              <div className="mb-2">
                <Label htmlFor="reminder-time" className="text-base flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Default Reminder Time
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  How far in advance should we notify you about events?
                </p>
              </div>
              
              <Select 
                value={settings.defaultReminderTime} 
                onValueChange={(value) => updateSettings({ defaultReminderTime: value })}
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
        <div className="mt-4 p-4 border border-dashed border-amber-300 rounded-md bg-amber-50">
          <div className="flex items-center mb-2">
            <Info className="h-4 w-4 mr-2 text-amber-500" />
            <Label className="text-base font-medium text-amber-700">Admin Testing Controls *</Label>
          </div>
          <p className="text-sm text-amber-600 mb-3">
            Test notification system with different timing options
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleTestNotification(0)}
              className="bg-white"
            >
              Test Now *
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleTestNotification(1)}
              className="bg-white"
            >
              Test in 1 min *
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleTestNotification(5)}
              className="bg-white"
            >
              Test in 5 min *
            </Button>
          </div>
        </div>
      )}
      
      {/* Admin toggle button */}
      <div className="text-right">
        <button
          type="button"
          className="text-xs text-gray-400 hover:text-gray-600"
          onClick={() => setShowAdminControls(!showAdminControls)}
        >
          {showAdminControls ? "Hide Admin *" : "*"}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettingsTab;
