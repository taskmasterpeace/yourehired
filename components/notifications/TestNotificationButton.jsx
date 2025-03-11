import React from 'react';
import { Button } from "../ui/button";
import { useNotifications } from '../../context/NotificationContext';

const TestNotificationButton = () => {
  const { addTestNotification } = useNotifications();
  
  // Add console log to debug
  console.log('TestNotificationButton rendered, addTestNotification:', !!addTestNotification);
  
  return (
    <Button 
      onClick={() => {
        console.log('Test notification button clicked');
        if (addTestNotification) {
          addTestNotification();
        } else {
          console.error('addTestNotification function is not available');
        }
      }}
      variant="outline"
      size="sm"
    >
      Add Test Notification
    </Button>
  );
};

export default TestNotificationButton;
