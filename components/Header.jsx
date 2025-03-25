"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth-service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationBell from "@/components/notifications/NotificationBell";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { AuthModal } from "@/components/auth/AuthModal";

const Header = ({
  isDarkMode,
  localStorageOnly,
  user,
  authLoading,
  notifications = [],
  onClearAll = () => {},
  onClearOne = () => {},
  onMarkAllRead = () => {},
  onMarkOneRead = () => {},
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4 ">
        <img
          src="/logo.png"
          alt="Hey You're Hired! Logo"
          className="h-24 w-24 mr-2"
        />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
          Hey You're Hired!
        </h1>
      </div>

      {/* Local storage indicator */}
      {localStorageOnly && (
        <div className="hidden md:flex bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium items-center">
          <Lock className="h-3 w-3 mr-1" />
          Local Storage Only
        </div>
      )}

      {/* Add NotificationBell here */}
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <div>
              <NotificationBell />
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="end">
            <NotificationCenter
              notifications={notifications}
              onClearAll={onClearAll}
              onClearOne={onClearOne}
              onMarkAllRead={onMarkAllRead}
              onMarkOneRead={onMarkOneRead}
              isDarkMode={isDarkMode}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Authentication UI */}
      <div className="ml-auto flex items-center gap-2">
        {authLoading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
        ) : user ? (
          <div className="flex items-center gap-2">
            {/* Modified user email display */}
            {user.email && (
              <span className="text-sm mr-2 md:inline">{user.email}</span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <AuthModal
            trigger={
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default Header;
