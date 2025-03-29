import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { notificationService } from "@/components/notifications/NotificationService";
import { createSupabaseClient } from "@/lib/supabase";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [settings, setSettings] = useState({
    enabled: true,
    browserNotifications: true,
    inAppNotifications: true,
    defaultReminderTime: "30",
    emailNotifications: false,
    notifyOnNewEvents: true,
    notifyOnEventUpdates: true,
    notifyOnEventReminders: true,
    notifyOnSystemUpdates: true,
  });

  // Load notifications from the database
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Loading notifications from the service");
      const notificationsData = await notificationService.getNotifications();
      console.log("Notifications loaded:", notificationsData?.length);
      if (Array.isArray(notificationsData)) {
        setNotifications(notificationsData);
        // Calculate unread count
        const unreadNotifications = notificationsData.filter((n) => !n.read);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    console.log("Setting up notification subscription");
    const supabase = createSupabaseClient();
    // Load notifications first
    loadNotifications();

    // Set up real-time subscription
    const setUpSubscription = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;
        const userId = userData.user.id;
        console.log("Setting up subscription for user:", userId);

        const channel = supabase
          .channel(`notifications-${userId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log("Real-time notification received:", payload);
              setNotifications((prev) => {
                // Add new notification if it doesn't exist yet
                if (!prev.some((n) => n.id === payload.new.id)) {
                  return [payload.new, ...prev];
                }
                return prev;
              });
              // Update unread count
              if (!payload.new.read) {
                setUnreadCount((prev) => prev + 1);
              }
              // Show browser notification if enabled
              if (
                settings.browserNotifications &&
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                try {
                  new Notification(`Hey, You're Hired!: ${payload.new.title}`, {
                    body: payload.new.message,
                    icon: "/logo-small.png",
                  });
                } catch (error) {
                  console.error("Error showing browser notification:", error);
                }
              }
            }
          )
          .subscribe();

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up subscription:", error);
      }
    };

    const cleanup = setUpSubscription();
    return () => {
      if (cleanup) cleanup();
    };
  }, [loadNotifications, settings.browserNotifications]);

  // Load notification settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("notificationSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  }, []);

  // Save notification settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("notificationSettings", JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  }, [settings]);

  // Mark a notification as read
  const markAsRead = useCallback(
    async (id) => {
      try {
        // Update UI first for immediate feedback
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
        // Update unread count
        setUnreadCount((prev) => {
          const wasUnread = notifications.find((n) => n.id === id && !n.read);
          return wasUnread ? Math.max(0, prev - 1) : prev;
        });
        // Then update the database
        await notificationService.markAsRead(id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [notifications]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Update UI first for immediate feedback
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      // Then update the database
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  // Delete a notification
  const clearNotification = useCallback(
    async (id) => {
      try {
        // Update UI first for immediate feedback
        const wasUnread = notifications.find((n) => n.id === id && !n.read);
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        // Then delete from the database
        await notificationService.deleteNotification(id);
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    },
    [notifications]
  );

  // Delete all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      // Update UI first for immediate feedback
      setNotifications([]);
      setUnreadCount(0);
      // Then delete from the database
      await notificationService.deleteAllNotifications();
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  }, []);

  // Add a test notification
  const addTestNotification = useCallback(async () => {
    try {
      // Call the service to add notification in database
      const notification = await notificationService.addTestNotification();

      // Update local state immediately for UI feedback
      if (notification) {
        // Add to notifications list
        setNotifications((prev) => [notification, ...prev]);
        // Increment unread count
        setUnreadCount((prev) => prev + 1);
      }

      return notification?.id;
    } catch (error) {
      console.error("Error adding test notification:", error);
      return null;
    }
  }, []);

  // Navigate to the notification target
  const openNotification = useCallback(
    (notification) => {
      // Mark as read
      markAsRead(notification.id);
      // Navigate to the action URL if it exists
      if (notification.action_url) {
        router.push(notification.action_url);
      }
    },
    [markAsRead, router]
  );

  // Provide the context value
  const value = {
    notifications,
    unreadCount,
    settings,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    addTestNotification,
    openNotification,
    updateSettings: (newSettings) =>
      setSettings((prev) => ({ ...prev, ...newSettings })),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
