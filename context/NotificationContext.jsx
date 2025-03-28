import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { NotificationService } from "@/components/notifications/NotificationService";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import { createSupabaseClient } from "../lib/supabase";
import { toast } from "../components/ui/use-toast";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const { user } = useAuth();

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

  // Load notifications from Supabase
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      console.log("Loading notifications from database...");
      const notificationsData = await NotificationService.getNotifications();
      console.log("Loaded notifications:", notificationsData);

      if (notificationsData && notificationsData.length >= 0) {
        setNotifications(notificationsData);

        // Calculate unread count
        const unreadNotifications = notificationsData.filter((n) => !n.read);
        setUnreadCount(unreadNotifications.length);
        console.log(`Set unread count to ${unreadNotifications.length}`);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }, [user]);

  // Add a notification directly to the UI (for immediate feedback)
  const addLocalNotification = useCallback((notification) => {
    console.log("Adding local notification to UI:", notification);
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // Set up the real-time subscription to notifications
  useEffect(() => {
    if (!user) return;

    console.log(
      "Setting up real-time notification subscription for user:",
      user.id
    );

    // Create a direct subscription using Supabase client
    const supabase = createSupabaseClient();

    // Channel name must be unique per user
    const channelName = `notifications-${user.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Real-time notification received:", payload);

          // Add the new notification to the state
          const newNotification = payload.new;

          // Only add if it's not already in the list (avoid duplicates)
          setNotifications((prev) => {
            // Check if notification already exists
            const exists = prev.some((n) => n.id === newNotification.id);
            if (exists) {
              console.log("Notification already in the list, not adding again");
              return prev;
            }
            console.log("Adding new notification to state");
            return [newNotification, ...prev];
          });

          // Update unread count (only if the notification is unread)
          if (newNotification.read === false) {
            setUnreadCount((prev) => prev + 1);
            console.log("Incremented unread count");
          }

          // Show browser notification if enabled
          if (
            settings.browserNotifications &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(`Hey, You're Hired!: ${newNotification.title}`, {
                body: newNotification.message,
                icon: "/logo-small.png",
              });
            } catch (error) {
              console.error("Error showing browser notification:", error);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`Supabase channel subscription status:`, status);
      });

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Load initial notifications
    loadNotifications();

    return () => {
      console.log("Cleaning up notification subscription");
      supabase.channel(channelName).unsubscribe();
    };
  }, [user, settings.browserNotifications, loadNotifications]);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("notificationSettings", JSON.stringify(settings));
    } catch (error) {
      console.error(
        "Error saving notification settings to localStorage:",
        error
      );
    }
  }, [settings]);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedSettings = localStorage.getItem("notificationSettings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed && typeof parsed === "object") {
          setSettings(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  }, []);

  // Mark a single notification as read
  const markAsRead = useCallback(
    async (id) => {
      try {
        // First update the UI for immediate feedback
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );

        // Update unread count
        const wasUnread = notifications.find((n) => n.id === id && !n.read);
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        // Then update the database
        const success = await NotificationService.markAsRead(id);
        if (!success) {
          console.error("Failed to mark notification as read in database");

          // Roll back UI changes if database update failed
          if (wasUnread) {
            setNotifications((prev) =>
              prev.map((notification) =>
                notification.id === id
                  ? { ...notification, read: false }
                  : notification
              )
            );
            setUnreadCount((prev) => prev + 1);
          }
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast({
          title: "Error",
          description: "Failed to mark notification as read.",
          variant: "destructive",
        });
      }
    },
    [notifications]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      // Update UI first for immediate feedback
      const oldNotifications = [...notifications];
      const oldUnreadCount = unreadCount;

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);

      // Then update the database
      const success = await NotificationService.markAllAsRead();
      if (!success) {
        console.error("Failed to mark all notifications as read in database");

        // Roll back UI changes if database update failed
        setNotifications(oldNotifications);
        setUnreadCount(oldUnreadCount);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    }
  }, [user, notifications, unreadCount]);

  // Clear a single notification
  const clearNotification = useCallback(
    async (id) => {
      try {
        // Store old state for potential rollback
        const oldNotifications = [...notifications];
        const oldUnreadCount = unreadCount;

        // Update UI first
        const wasUnread = notifications.find((n) => n.id === id && !n.read);
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );

        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        // Then update the database
        const success = await NotificationService.deleteNotification(id);
        if (!success) {
          console.error("Failed to delete notification from database");

          // Roll back UI changes if database update failed
          setNotifications(oldNotifications);
          setUnreadCount(oldUnreadCount);
        }
      } catch (error) {
        console.error("Error clearing notification:", error);
        toast({
          title: "Error",
          description: "Failed to delete notification.",
          variant: "destructive",
        });
      }
    },
    [notifications, unreadCount]
  );

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!user) return;

    try {
      // Store old state for potential rollback
      const oldNotifications = [...notifications];
      const oldUnreadCount = unreadCount;

      // Update UI first
      setNotifications([]);
      setUnreadCount(0);

      // Then update the database
      const success = await NotificationService.deleteAllNotifications();
      if (!success) {
        console.error("Failed to delete all notifications from database");

        // Roll back UI changes if database update failed
        setNotifications(oldNotifications);
        setUnreadCount(oldUnreadCount);
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      toast({
        title: "Error",
        description: "Failed to delete all notifications.",
        variant: "destructive",
      });
    }
  }, [user, notifications, unreadCount]);

  // Add a test notification
  const addTestNotification = useCallback(async () => {
    try {
      console.log("Adding test notification");
      const notification = await NotificationService.addTestNotification();
      console.log("Test notification result:", notification);

      if (notification) {
        // No need to update UI here as it should come through the real-time subscription
        // But we could manually add it if needed for faster feedback
        return notification.id;
      }
      return null;
    } catch (error) {
      console.error("Error adding test notification:", error);
      toast({
        title: "Error",
        description: "Failed to add test notification: " + error.message,
        variant: "destructive",
      });
      return null;
    }
  }, []);

  // Navigate to the notification target
  const openNotification = useCallback(
    (notification) => {
      // Mark as read first
      if (!notification.read) {
        markAsRead(notification.id);
      }

      // Navigate to the target URL if available
      if (notification.action_url) {
        router.push(notification.action_url);
      }
    },
    [markAsRead, router]
  );

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const value = {
    notifications,
    unreadCount,
    settings,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    addTestNotification,
    addLocalNotification, // Added for immediate UI updates
    openNotification,
    updateSettings,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
