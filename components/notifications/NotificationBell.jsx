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
          <BellOff className="h-6 w-6" />
        ) : unreadCount > 0 ? (
          <>
            <BellRing className="h-6 w-6 animate-pulse" />
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
          <Bell className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export default NotificationBell;
