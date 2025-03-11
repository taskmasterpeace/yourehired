import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell = ({ variant = 'default' }) => {
  const notificationContext = useNotifications();
  const unreadCount = notificationContext ? notificationContext.unreadCount : 0;
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      aria-label="Notifications"
    >
      <Bell className={`h-5 w-5 ${variant === 'prominent' ? 'text-blue-600' : ''}`} />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBell;
