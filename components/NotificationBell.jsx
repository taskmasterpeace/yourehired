import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, BellRing, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = ({ variant = "default" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications = [], // Add default empty array
    markAllAsRead = () => {}, // Add default empty function
    markAsRead = () => {}, 
    clearNotification = () => {},
    settings = { enabled: true }
  } = useNotifications() || {}; // Add fallback for context
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark as read when opening the dropdown
      markAllAsRead();
    }
  };

  const handleNotificationClick = (id) => {
    markAsRead(id);
    // Additional logic for navigating to the related content could be added here
  };

  const handleClearNotification = (e, id) => {
    e.stopPropagation();
    clearNotification(id);
  };

  // Determine button styling based on variant
  const getButtonStyles = () => {
    switch(variant) {
      case "sidebar":
        return "relative p-2 text-gray-300 hover:text-white focus:outline-none transition-colors duration-200";
      case "prominent":
        return "relative p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full focus:outline-none transition-all duration-200 shadow-sm hover:shadow";
      default:
        return "relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none transition-colors duration-200";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={getButtonStyles()}
        onClick={handleBellClick}
        aria-label="Notifications"
        title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        {!settings.enabled ? (
          <BellOff className="h-6 w-6" />
        ) : unreadCount > 0 ? (
          <>
            <BellRing className="h-6 w-6 animate-pulse" />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </>
        ) : (
          <Bell className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700">
          <div className="py-2 px-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Notifications</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          {notifications.length === 0 ? (
            <div className="py-6 px-4 text-center text-gray-500 dark:text-gray-400">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No notifications</p>
              <p className="text-xs mt-1">We'll notify you of important updates</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                    <button
                      onClick={(e) => handleClearNotification(e, notification.id)}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label="Dismiss notification"
                    >
                      &times;
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
