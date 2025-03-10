import React from 'react';
import { Button } from "../ui/button";
import { Bell, BellOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EventReminderButton = ({ 
  notificationPreferences, 
  className = ""
}) => {
  const router = useRouter();
  
  // Default preferences if none provided
  const preferences = {
    enabled: true,
    browserNotifications: true,
    inAppNotifications: true,
    defaultReminderTime: '30', // minutes before event
    ...(notificationPreferences || {})
  };
  
  const handleClick = () => {
    router.push('/settings?tab=notifications');
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={`flex items-center ${className}`}
      onClick={handleClick}
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
  );
};

export default EventReminderButton;
