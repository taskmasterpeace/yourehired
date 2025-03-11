import React from 'react';
import { Button } from "../ui/button";
import { useNotifications } from '../../context/NotificationContext';

const TestNotificationButton = () => {
  const { addTestNotification } = useNotifications();
  
  return (
    <Button 
      onClick={() => addTestNotification()}
      variant="outline"
      size="sm"
    >
      Add Test Notification
    </Button>
  );
};

export default TestNotificationButton;
