import React, { useState } from "react";
import { Button } from "../ui/button";
import { Bell, Loader2 } from "lucide-react";
import { useNotifications } from "./NotificationContext";
import { useToast } from "../ui/use-toast";

const TestNotificationButton = () => {
  const { addTestNotification } = useNotifications() || {};
  const { toast } = useToast?.() || { toast: () => {} };
  const [loading, setLoading] = useState(false);

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      console.log("Sending test notification...");
      // Use the context method instead of directly calling the service
      const notificationId = await addTestNotification?.();

      if (notificationId) {
        toast({
          title: "Notification sent",
          description:
            "Check your notification bell to see the test notification.",
        });
      } else {
        toast({
          title: "Failed to send notification",
          description: "The notification could not be sent. Please try again.",
          variant: "destructive",
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
