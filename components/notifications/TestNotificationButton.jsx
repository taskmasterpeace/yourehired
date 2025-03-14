import React from 'react';
import { Button } from "../ui/button";
import { useNotifications } from '../../context/NotificationContext';

const TestNotificationButton = () => {
  const notificationContext = useNotifications();
  
  // Add a fallback if the context is not available
  const addTestNotification = notificationContext?.addTestNotification || (() => {
    console.warn('addTestNotification not available');
    return null;
  });
  
  return (
    <Button 
      onClick={() => {
        console.log('Test notification button clicked');
        addTestNotification();
      }}
      variant="outline"
      size="sm"
    >
      Add Test Notification
    </Button>
  );
};

export default TestNotificationButton;
