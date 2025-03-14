import React from 'react';
import { Check, Trash2, Settings, Save, AlertTriangle } from 'lucide-react';
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { useRouter } from 'next/router'; // Changed from next/navigation for Pages Router

const NotificationCenter = ({ 
  notifications = [], 
  onClearAll, 
  onClearOne, 
  onMarkAllRead, 
  onMarkOneRead 
}) => {
  const router = useRouter();
  
  // Format the notification time
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  // Handle navigation to event or action
  const handleNavigateToEvent = (notification) => {
    // Mark as read first
    if (!notification.read && onMarkOneRead) {
      onMarkOneRead(notification.id);
    }
    
    if (notification.eventId) {
      // Navigate to the event
      router.push(`/calendar?event=${notification.eventId}`);
    } else if (notification.actionUrl) {
      // Navigate to the action URL (like backup settings)
      router.push(notification.actionUrl);
    }
  };
  
  // Go to notification settings
  const goToSettings = () => {
    router.push('/settings?tab=notifications');
  };
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="w-80">
        <div className="flex items-center justify-between p-4 dark:border-gray-700">
          <h3 className="font-medium dark:text-gray-200">Hey! Notifications</h3>
          <div className="flex space-x-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMarkAllRead}
                title="Mark all as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAll}
              title="Clear all notifications"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToSettings}
              title="Notification settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Separator className="dark:bg-gray-700" />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {(notifications || []).map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/30' : 'dark:bg-gray-800'}`}
                onClick={() => handleNavigateToEvent(notification)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 flex">
                    {notification.type === 'backup_reminder' && (
                      <div className="mr-2 mt-0.5">
                        <Save className="h-4 w-4 text-amber-500" />
                      </div>
                    )}
                    {notification.type === 'system' && (
                      <div className="mr-2 mt-0.5">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </div>
                    )}
                    <div>
                      <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">
                      {formatNotificationTime(notification.timestamp)}
                    </span>
                    <div className="flex mt-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkOneRead(notification.id);
                          }}
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearOne(notification.id);
                        }}
                        title="Remove"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        )}
    </div>
  );
};

export default NotificationCenter;
import React from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = ({ 
  notifications = [], 
  onClearAll, 
  onClearOne, 
  onMarkAllRead, 
  onMarkOneRead,
  isDarkMode
}) => {
  if (!notifications || !Array.isArray(notifications)) {
    notifications = [];
  }

  return (
    <div className={`w-80 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-md shadow-lg overflow-hidden`}>
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="font-medium">Notifications</h3>
        <div className="flex gap-1">
          {notifications.length > 0 && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMarkAllRead}
                title="Mark all as read"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearAll}
                title="Clear all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      <ScrollArea className="h-[300px]">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          <div>
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-3 border-b ${notification.read ? 'opacity-70' : 'bg-blue-50 dark:bg-blue-900/20'} hover:bg-gray-50 dark:hover:bg-gray-700/50`}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <div className="flex gap-1">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0" 
                        onClick={() => onMarkOneRead(notification.id)}
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0" 
                      onClick={() => onClearOne(notification.id)}
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationCenter;
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
