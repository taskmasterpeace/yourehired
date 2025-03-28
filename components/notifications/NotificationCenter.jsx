import React from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import {
  Bell,
  Check,
  Trash2,
  CheckCheck,
  Calendar,
  Zap,
  Info,
  Award,
  RefreshCw,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { cn } from "../../lib/utils";
import { formatDistanceToNow } from "date-fns";

const NotificationCenter = () => {
  const {
    notifications = [],
    clearAllNotifications,
    clearNotification,
    markAllAsRead,
    markAsRead,
    openNotification,
    unreadCount,
  } = useNotifications() || {};

  console.log(
    "NotificationCenter rendering with notifications:",
    notifications.length,
    "unread:",
    unreadCount
  );

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    // Get date part for grouping (today, yesterday, this week, this month, older)
    let dateGroup;
    const notifDate = new Date(notification.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (notifDate.toDateString() === today.toDateString()) {
      dateGroup = "Today";
    } else if (notifDate.toDateString() === yesterday.toDateString()) {
      dateGroup = "Yesterday";
    } else {
      dateGroup = notifDate.toLocaleDateString();
    }

    if (!groups[dateGroup]) {
      groups[dateGroup] = [];
    }
    groups[dateGroup].push(notification);
    return groups;
  }, {});

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "event_reminder":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "new_event":
        return <Calendar className="h-4 w-4 text-green-500" />;
      case "event_update":
        return <RefreshCw className="h-4 w-4 text-orange-500" />;
      case "application_update":
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case "achievement":
        return <Award className="h-4 w-4 text-yellow-500" />;
      case "level_up":
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case "system":
        return <Info className="h-4 w-4 text-gray-500" />;
      case "test":
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (openNotification) {
      openNotification(notification);
    } else {
      // Fallback if openNotification isn't available
      markAsRead?.(notification.id);

      // Try to navigate using the action_url if available
      if (notification.action_url && typeof window !== "undefined") {
        window.location.href = notification.action_url;
      }
    }
  };

  return (
    <div className="w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
              {unreadCount}
            </span>
          )}
        </h3>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead?.()}
            disabled={!unreadCount}
            title="Mark all as read"
            className="h-8 w-8 p-0"
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearAllNotifications?.()}
            disabled={notifications.length === 0}
            title="Clear all notifications"
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {notifications.length === 0 ? (
        <div className="p-6 text-center">
          <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600 opacity-50" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            No notifications
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            You're all caught up!
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[70vh] overflow-auto">
          {Object.entries(groupedNotifications).map(
            ([date, dateNotifications]) => (
              <div key={date}>
                <div className="sticky top-0 z-10 px-4 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                  {date}
                </div>
                {dateNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 border-b last:border-b-0 border-gray-100 dark:border-gray-700",
                      !notification.read
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "",
                      (notification.action_url || notification.action_url) &&
                        "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    )}
                    onClick={
                      notification.action_url || notification.action_url
                        ? () => handleNotificationClick(notification)
                        : undefined
                    }
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              !notification.read
                                ? "text-blue-600 dark:text-blue-400"
                                : ""
                            )}
                          >
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                            {formatDistanceToNow(
                              new Date(notification.timestamp),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                        <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                          {notification.message}
                        </p>
                        {(notification.action_url ||
                          notification.action_url) && (
                          <div className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                            Click to view details
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead?.(notification.id);
                            }}
                            title="Mark as read"
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification?.(notification.id);
                          }}
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
            )
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default NotificationCenter;
