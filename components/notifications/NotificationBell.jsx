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
import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, BellRing, BellOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const NotificationBell = ({ variant = "default" }) => {
  const { 
    unreadCount = 0,
    settings = { enabled: true }
  } = useNotifications() || {}; // Add fallback for context
  
  // Determine button styling based on variant
  const getButtonStyles = () => {
    switch(variant) {
      case "sidebar":
        return "relative p-2 text-gray-300 hover:text-white focus:outline-none transition-colors duration-200";
      case "prominent":
        return "relative p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-full focus:outline-none transition-all duration-200 shadow-md hover:shadow-lg";
      default:
        return "relative p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full focus:outline-none transition-colors duration-200";
    }
  };

  return (
    <div className="relative">
      <Button
        variant={variant === "prominent" ? "default" : "ghost"}
        size="icon"
        className={variant === "prominent" ? getButtonStyles() : "relative"}
        aria-label="Notifications"
        title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        {!settings.enabled ? (
          <BellOff className="h-5 w-5" />
        ) : unreadCount > 0 ? (
          <>
            <BellRing className="h-5 w-5 animate-pulse" />
            {variant === "prominent" ? (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-bounce">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : (
              <Badge 
                className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </>
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default NotificationBell;
