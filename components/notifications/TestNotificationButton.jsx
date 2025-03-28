import React, { useState } from "react";
import { Button } from "../ui/button";
import { Bell, Loader2 } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { useToast } from "../ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { NotificationService } from "./NotificationService";

const TestNotificationButton = () => {
  const notificationContext = useNotifications();
  const { toast } = useToast?.() || { toast: () => {} };
  const [loading, setLoading] = useState(false);

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      console.log("Sending test notification...");

      // Use the notification service to add a notification to the database
      const notification = await NotificationService.addTestNotification();

      // Also immediately update the UI for responsiveness
      if (notification && notificationContext) {
        // Make a local copy of the notification with proper typing
        const uiNotification = {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: false,
          action_url: notification.action_url,
          user_id: notification.user_id,
          timestamp: notification.timestamp,
        };

        // Update the UI immediately
        notificationContext.addLocalNotification?.(uiNotification);

        toast({
          title: "Notification sent",
          description:
            "Check your notification bell to see the test notification.",
        });
      } else {
        toast({
          title: "Notification sent to database",
          description:
            "But the UI may not update immediately. Refresh to see the notification.",
        });
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast({
        title: "Error",
        description: `Failed to send notification: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTestNotification}
      variant="outline"
      size="sm"
      className="flex items-center"
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Bell className="h-4 w-4 mr-2" />
      )}
      Test Notification
    </Button>
  );
};

export default TestNotificationButton;
