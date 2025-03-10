import React, { useState } from 'react';
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Bell, Award, ArrowUp, Check, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Achievement } from "../../lib/achievementUtils";

interface Notification {
  id: string;
  type: 'achievement' | 'level_up' | 'streak' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  isDarkMode: boolean;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications,
  isDarkMode
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="h-4 w-4" />;
      case 'level_up': return <ArrowUp className="h-4 w-4" />;
      case 'streak': return <Award className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className={`w-80 p-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
        align="end"
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={onMarkAllAsRead}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={onClearNotifications}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-3 relative",
                    !notification.read && (isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50')
                  )}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "p-2 rounded-full h-fit",
                      notification.type === 'achievement' 
                        ? (isDarkMode ? 'bg-amber-900/50' : 'bg-amber-100')
                        : notification.type === 'level_up'
                        ? (isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100')
                        : (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')
                    )}>
                      {React.cloneElement(getIcon(notification.type), { 
                        className: cn(
                          notification.type === 'achievement' 
                            ? (isDarkMode ? 'text-amber-300' : 'text-amber-600')
                            : notification.type === 'level_up'
                            ? (isDarkMode ? 'text-blue-300' : 'text-blue-600')
                            : (isDarkMode ? 'text-gray-300' : 'text-gray-600')
                        )
                      })}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
