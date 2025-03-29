import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { createSupabaseClient as getSupabaseClient } from "@/lib/supabase";

// Define notification types
export type NotificationType =
  | "event_reminder"
  | "new_event"
  | "event_update"
  | "application_update"
  | "achievement"
  | "level_up"
  | "system"
  | "test";

// Define the notification interface
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

// Singleton instance
let instance: NotificationService | null = null;

// This service handles all notification operations via Supabase
export class NotificationService {
  private supabaseClient: SupabaseClient | null = null;

  constructor() {
    // Enforce singleton pattern
    if (instance) {
      return instance;
    }

    // Initialize the Supabase client
    this.initClient();
    instance = this;
  }

  private initClient() {
    try {
      // Use the singleton pattern from lib/supabase.ts
      this.supabaseClient = getSupabaseClient();
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error);
      // Fallback for initialization errors
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      if (supabaseUrl && supabaseAnonKey) {
        this.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
      }
    }
  }

  // Get the Supabase client
  private getClient() {
    if (!this.supabaseClient) {
      this.initClient();
      if (!this.supabaseClient) {
        throw new Error("Failed to initialize Supabase client");
      }
    }
    return this.supabaseClient;
  }

  // Get all notifications for the current user
  async getNotifications(): Promise<Notification[]> {
    try {
      console.log("NotificationService: Getting notifications");
      const supabase = this.getClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.log("No authenticated user found");
        return [];
      }

      console.log("Getting notifications for user:", userData.user.id);

      // Get notifications for this user
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      console.log(`Found ${data?.length || 0} notifications`);
      return data || [];
    } catch (error) {
      console.error("Error in getNotifications:", error);
      return [];
    }
  }

  // Add a new notification
  async addNotification(
    notification: Omit<Notification, "id" | "user_id" | "timestamp" | "read">
  ): Promise<Notification | null> {
    try {
      const supabase = this.getClient();

      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found");
        return null;
      }

      // Prepare notification data
      const notificationData = {
        id: uuidv4(),
        user_id: userData.user.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: false,
        action_url: notification.action_url,
        reference_id: notification.reference_id,
        reference_type: notification.reference_type,
        timestamp: new Date().toISOString(),
      };

      // Insert into database
      const { data, error } = await supabase
        .from("notifications")
        .insert([notificationData])
        .select();

      if (error) {
        console.error("Error adding notification:", error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error("Error in addNotification:", error);
      return null;
    }
  }

  // Add a test notification
  async addTestNotification(): Promise<Notification | null> {
    return this.addNotification({
      title: "Test Notification",
      message:
        "This is a test notification sent at " +
        new Date().toLocaleTimeString(),
      type: "test",
      action_url: "/dashboard",
    });
  }

  // Mark a notification as read
  async markAsRead(id: string): Promise<boolean> {
    try {
      const supabase = this.getClient();

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) {
        console.error("Error marking notification as read:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in markAsRead:", error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<boolean> {
    try {
      const supabase = this.getClient();

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return false;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userData.user.id)
        .eq("read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
      return false;
    }
  }

  // Delete a notification
  async deleteNotification(id: string): Promise<boolean> {
    try {
      const supabase = this.getClient();

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting notification:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteNotification:", error);
      return false;
    }
  }

  // Delete all notifications
  async deleteAllNotifications(): Promise<boolean> {
    try {
      const supabase = this.getClient();

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return false;
      }

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userData.user.id);

      if (error) {
        console.error("Error deleting all notifications:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteAllNotifications:", error);
      return false;
    }
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();
