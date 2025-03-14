import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell = ({ variant = 'default' }) => {
  // Get notification context with fallback for SSR or when context is not available
  const notificationContext = useNotifications();
  const unreadCount = notificationContext?.unreadCount || 0;
  
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
import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../ui/button';

const NotificationBell = () => {
  const { notifications } = useNotifications() || { notifications: [] };
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default NotificationBell;
