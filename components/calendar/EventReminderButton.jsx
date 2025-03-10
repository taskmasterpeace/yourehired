import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Bell, BellOff, Settings } from 'lucide-react';
import NotificationPreferences from './NotificationPreferences';

const EventReminderButton = ({ 
  notificationPreferences, 
  onUpdatePreferences,
  onTestNotification,
  className = ""
}) => {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  
  // Default preferences if none provided
  const preferences = {
    enabled: true,
    browserNotifications: true,
    inAppNotifications: true,
    defaultReminderTime: '30', // minutes before event
    ...notificationPreferences
  };
  
  const handleSavePreferences = (newPreferences) => {
    if (onUpdatePreferences) {
      onUpdatePreferences(newPreferences);
    }
    setIsPreferencesOpen(false);
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center ${className}`}
        onClick={() => setIsPreferencesOpen(true)}
        title="Notification Settings"
      >
        {preferences.enabled ? (
          <>
            <Bell className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Reminders</span>
          </>
        ) : (
          <>
            <BellOff className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Reminders Off</span>
          </>
        )}
      </Button>
      
      <NotificationPreferences
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        preferences={preferences}
        onSave={handleSavePreferences}
        onTestNotification={onTestNotification}
      />
    </>
  );
};

export default EventReminderButton;
