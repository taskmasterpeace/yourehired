import React, { useState, useEffect } from "react";
import { Toast, ToastProvider, ToastViewport } from "../ui/toast";
import { Award, Trophy, Zap, Star, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Achievement } from "../../lib/achievementUtils";
import { useNotifications } from "./NotificationContext";

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
  isDarkMode: boolean;
}

export function AchievementNotification({
  achievement,
  onClose,
  isDarkMode,
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { addNotification } = useNotifications() || {};

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);

      // Add to notification system
      if (addNotification) {
        addNotification({
          type: "achievement",
          title: "Achievement Unlocked!",
          message: `${achievement.name}: ${achievement.description}`,
          actionUrl: "/achievements",
          referenceId: achievement.id,
          referenceType: "achievement",
        });
      }

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow animation to complete
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose, addNotification]);

  if (!achievement) return null;

  // Get icon based on category
  const getIcon = () => {
    switch (achievement.category) {
      case "milestones":
        return <Trophy className="h-6 w-6" />;
      case "consistency":
        return <Zap className="h-6 w-6" />;
      case "quality":
        return <Star className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };

  // Get colors based on rarity
  const getColors = () => {
    switch (achievement.rarity) {
      case "legendary":
        return {
          bg: isDarkMode ? "bg-purple-900/90" : "bg-purple-100",
          border: isDarkMode ? "border-purple-700" : "border-purple-200",
          text: isDarkMode ? "text-purple-300" : "text-purple-700",
          iconBg: isDarkMode ? "bg-purple-800" : "bg-purple-200",
          iconColor: isDarkMode ? "text-purple-300" : "text-purple-600",
        };
      case "rare":
        return {
          bg: isDarkMode ? "bg-blue-900/90" : "bg-blue-100",
          border: isDarkMode ? "border-blue-700" : "border-blue-200",
          text: isDarkMode ? "text-blue-300" : "text-blue-700",
          iconBg: isDarkMode ? "bg-blue-800" : "bg-blue-200",
          iconColor: isDarkMode ? "text-blue-300" : "text-blue-600",
        };
      case "uncommon":
        return {
          bg: isDarkMode ? "bg-green-900/90" : "bg-green-100",
          border: isDarkMode ? "border-green-700" : "border-green-200",
          text: isDarkMode ? "text-green-300" : "text-green-700",
          iconBg: isDarkMode ? "bg-green-800" : "bg-green-200",
          iconColor: isDarkMode ? "text-green-300" : "text-green-600",
        };
      default: // common
        return {
          bg: isDarkMode ? "bg-gray-800/90" : "bg-gray-100",
          border: isDarkMode ? "border-gray-700" : "border-gray-200",
          text: isDarkMode ? "text-gray-300" : "text-gray-700",
          iconBg: isDarkMode ? "bg-gray-700" : "bg-gray-200",
          iconColor: isDarkMode ? "text-gray-300" : "text-gray-600",
        };
    }
  };

  const colors = getColors();

  return (
    <ToastProvider>
      <Toast
        open={isVisible}
        onOpenChange={(open) => {
          if (!open) {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }
        }}
        className={cn(
          "fixed bottom-4 right-4 p-0 w-80 md:w-96 shadow-lg border rounded-lg overflow-hidden transition-all duration-300",
          colors.bg,
          colors.border,
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        )}
      >
        <div className="relative p-4">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className={cn("p-3 rounded-full", colors.iconBg)}>
              {React.cloneElement(getIcon(), {
                className: colors.iconColor,
              })}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn("font-medium", colors.text)}>
                  Achievement Unlocked!
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/10">
                  +{achievement.points} pts
                </span>
              </div>
              <p className="font-medium mb-1">{achievement.name}</p>
              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
            </div>
          </div>
        </div>
        {/* Progress bar animation */}
        <div className="h-1 w-full bg-black/10">
          <div
            className="h-1 bg-white/30"
            style={{
              width: "100%",
              animation: "shrink 5s linear forwards",
            }}
          ></div>
        </div>
        <style jsx>{`
          @keyframes shrink {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}</style>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}
