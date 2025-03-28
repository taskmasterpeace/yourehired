import { createSupabaseClient } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

export type NotificationType =
  | "event_reminder"
  | "new_event"
  | "event_update"
  | "application_update"
  | "achievement"
  | "level_up"
  | "system"
  | "test";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  action_url?: string;
  reference_id?: string;
  reference_type?: string;
  timestamp: string;
}

export class NotificationService {
  /**
   * Test connection to Supabase notifications table
   */
  static async testConnection(): Promise<boolean> {
    try {
      const supabase = createSupabaseClient();
      console.log("Testing connection to notifications table...");

      const { data, error } = await supabase
        .from("notifications")
        .select("count(*)", { count: "exact", head: true });

      if (error) {
        console.error("Error connecting to notifications table:", error);
        return false;
      }

      console.log("Successfully connected to notifications table");
      return true;
    } catch (error) {
      console.error("Failed to connect to Supabase:", error);
      return false;
    }
  }

  /**
   * Get all notifications for the current user
   */
  static async getNotifications(): Promise<Notification[]> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.log("No authenticated user found for getNotifications");
        return [];
      }

      console.log("Getting notifications for user:", userData.user.id);

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Database error fetching notifications:", error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} notifications`);
      return (data as Notification[]) || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  /**
   * Add a new notification for the current user
   */
  static async addNotification(
    notification: Omit<Notification, "id" | "user_id" | "timestamp" | "read">
  ): Promise<Notification | null> {
    try {
      const supabase = createSupabaseClient();
      console.log("Adding notification:", notification);

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found");
        throw new Error("User must be authenticated to add notifications");
      }

      console.log("User ID for notification:", userData.user.id);

      // Convert snake_case to camelCase if needed
      const actionUrl = notification.action_url || notification.actionUrl;
      const referenceId = notification.reference_id || notification.referenceId;
      const referenceType =
        notification.reference_type || notification.referenceType;

      // Insert the new notification
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          id: uuidv4(),
          user_id: userData.user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: false,
          action_url: actionUrl,
          reference_id: referenceId,
          reference_type: referenceType,
          timestamp: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("Database error adding notification:", error);
        throw error;
      }

      console.log("Notification added successfully:", data);
      return data ? (data[0] as Notification) : null;
    } catch (error) {
      console.error("Error adding notification:", error);
      toast({
        title: "Error adding notification",
        description: "There was a problem creating the notification.",
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Add a test notification
   */
  static async addTestNotification(): Promise<Notification | null> {
    try {
      console.log("Adding test notification");

      return NotificationService.addNotification({
        title: "Test Notification",
        message:
          "This is a test notification sent at " +
          new Date().toLocaleTimeString(),
        type: "test",
        action_url: "/dashboard",
      });
    } catch (error) {
      console.error("Error adding test notification:", error);
      toast({
        title: "Error sending test notification",
        description: "There was a problem sending the test notification.",
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(id: string): Promise<boolean> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found");
        throw new Error("User must be authenticated to update notifications");
      }

      console.log(
        `Marking notification ${id} as read for user ${userData.user.id}`
      );

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("user_id", userData.user.id); // Safety check

      if (error) {
        console.error("Database error marking notification as read:", error);
        throw error;
      }

      console.log("Notification marked as read successfully");
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for the current user
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found");
        throw new Error("User must be authenticated to update notifications");
      }

      console.log(
        `Marking all notifications as read for user ${userData.user.id}`
      );

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userData.user.id)
        .eq("read", false);

      if (error) {
        console.error(
          "Database error marking all notifications as read:",
          error
        );
        throw error;
      }

      console.log("All notifications marked as read successfully");
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(id: string): Promise<boolean> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found");
        throw new Error("User must be authenticated to delete notifications");
      }

      console.log(`Deleting notification ${id} for user ${userData.user.id}`);

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", userData.user.id); // Safety check

      if (error) {
        console.error("Database error deleting notification:", error);
        throw error;
      }

      console.log("Notification deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }

  /**
   * Delete all notifications for the current user
   */
  static async deleteAllNotifications(): Promise<boolean> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found");
        throw new Error("User must be authenticated to delete notifications");
      }

      console.log(`Deleting all notifications for user ${userData.user.id}`);

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userData.user.id);

      if (error) {
        console.error("Database error deleting all notifications:", error);
        throw error;
      }

      console.log("All notifications deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      return false;
    }
  }

  /**
   * Get count of unread notifications
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const supabase = createSupabaseClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.log("No authenticated user found for unread count");
        return 0;
      }

      console.log(`Getting unread count for user ${userData.user.id}`);

      const { data, error, count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userData.user.id)
        .eq("read", false);

      if (error) {
        console.error("Database error getting unread count:", error);
        throw error;
      }

      console.log(`Found ${count || 0} unread notifications`);
      return count || 0;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  /**
   * Subscribe to new notifications
   */
  static subscribeToNotifications(
    callback: (notification: Notification) => void
  ) {
    const supabase = createSupabaseClient();

    // Async function to set up subscription
    (async () => {
      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.log("No authenticated user found for subscription");
        return null;
      }

      const userId = userData.user.id;
      console.log(`Setting up notification subscription for user ${userId}`);

      // Create a unique channel name with the user ID
      const channelName = `notifications-${userId}`;

      const channel = supabase
        .channel(channelName)
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
            callback(payload.new as Notification);
          }
        )
        .subscribe((status) => {
          console.log(`Supabase notification subscription status:`, status);
        });

      return channel;
    })();

    // Return function to unsubscribe
    return {
      unsubscribe: () => {
        console.log("Unsubscribing from notifications");
        // Use the same channel name when unsubscribing
        supabase.channel("notifications").unsubscribe();
      },
    };
  }

  /**
   * Add an event reminder notification
   */
  static async addEventReminderNotification(event: {
    id: string;
    title: string;
    location?: string;
  }): Promise<Notification | null> {
    try {
      return NotificationService.addNotification({
        type: "event_reminder",
        title: `Reminder: ${event.title}`,
        message: `This event is starting soon${
          event.location ? ` at ${event.location}` : ""
        }.`,
        reference_id: event.id,
        reference_type: "event",
        action_url: `/calendar?event=${event.id}`,
      });
    } catch (error) {
      console.error("Error adding event reminder notification:", error);
      return null;
    }
  }

  /**
   * Add a notification for an application status update
   */
  static async addApplicationUpdateNotification(application: {
    id: string;
    companyName: string;
    oldStatus: string;
    newStatus: string;
  }): Promise<Notification | null> {
    try {
      return NotificationService.addNotification({
        type: "application_update",
        title: "Application Status Update",
        message: `${application.companyName}: Status changed from ${application.oldStatus} to ${application.newStatus}`,
        reference_id: application.id,
        reference_type: "application",
        action_url: `/applications/${application.id}`,
      });
    } catch (error) {
      console.error("Error adding application update notification:", error);
      return null;
    }
  }

  /**
   * Add an achievement notification
   */
  static async addAchievementNotification(achievement: {
    id: string;
    name: string;
    description: string;
    points: number;
  }): Promise<Notification | null> {
    try {
      return NotificationService.addNotification({
        type: "achievement",
        title: "Achievement Unlocked!",
        message: `${achievement.name}: ${achievement.description} (+${achievement.points} points)`,
        reference_id: achievement.id,
        reference_type: "achievement",
        action_url: "/achievements",
      });
    } catch (error) {
      console.error("Error adding achievement notification:", error);
      return null;
    }
  }

  // Instance method versions - these just call the static methods
  async testConnection(): Promise<boolean> {
    return NotificationService.testConnection();
  }

  async getNotifications(): Promise<Notification[]> {
    return NotificationService.getNotifications();
  }

  async addNotification(
    notification: Omit<Notification, "id" | "user_id" | "timestamp" | "read">
  ): Promise<Notification | null> {
    return NotificationService.addNotification(notification);
  }

  async addTestNotification(): Promise<Notification | null> {
    return NotificationService.addTestNotification();
  }

  async markAsRead(id: string): Promise<boolean> {
    return NotificationService.markAsRead(id);
  }

  async markAllAsRead(): Promise<boolean> {
    return NotificationService.markAllAsRead();
  }

  async deleteNotification(id: string): Promise<boolean> {
    return NotificationService.deleteNotification(id);
  }

  async deleteAllNotifications(): Promise<boolean> {
    return NotificationService.deleteAllNotifications();
  }

  async getUnreadCount(): Promise<number> {
    return NotificationService.getUnreadCount();
  }

  subscribeToNotifications(callback: (notification: Notification) => void) {
    return NotificationService.subscribeToNotifications(callback);
  }

  async addEventReminderNotification(event: {
    id: string;
    title: string;
    location?: string;
  }): Promise<Notification | null> {
    return NotificationService.addEventReminderNotification(event);
  }

  async addApplicationUpdateNotification(application: {
    id: string;
    companyName: string;
    oldStatus: string;
    newStatus: string;
  }): Promise<Notification | null> {
    return NotificationService.addApplicationUpdateNotification(application);
  }

  async addAchievementNotification(achievement: {
    id: string;
    name: string;
    description: string;
    points: number;
  }): Promise<Notification | null> {
    return NotificationService.addAchievementNotification(achievement);
  }
}

// Create an instance for those who prefer instance method usage
export const notificationService = new NotificationService();
