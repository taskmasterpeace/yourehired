import React from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';

const NotificationCenter = ({ 
  notifications = [], 
  onClearAll, 
  onClearOne, 
  onMarkAllRead, 
  onMarkOneRead,
  isDarkMode = false
}) => {
  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  return (
    <div className={`w-80 sm:w-96 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} rounded-md shadow-lg overflow-hidden`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
        <h3 className="font-medium flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {notifications.length > 0 && (
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {notifications.length}
            </span>
          )}
        </h3>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMarkAllRead}
            disabled={!notifications.some(n => !n.read)}
            title="Mark all as read"
            className="h-8 w-8 p-0"
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAll}
            disabled={notifications.length === 0}
            title="Clear all notifications"
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p>No notifications</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[70vh] overflow-auto">
          {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
            <div key={date}>
              <div className={`sticky top-0 z-10 px-4 py-1 text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                {date}
              </div>
              {dateNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 border-b last:border-b-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} ${!notification.read ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm mt-1">{notification.message}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onMarkOneRead(notification.id)}
                          title="Mark as read"
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onClearOne(notification.id)}
                        title="Remove notification"
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
};

export default NotificationCenter;
