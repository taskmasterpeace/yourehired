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
