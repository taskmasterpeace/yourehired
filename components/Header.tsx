"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth-service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationBell from "@/components/notifications/NotificationBell";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  isDarkMode: boolean;
  user: User | null;
  authLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, user, authLoading }) => {
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
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
          Hey You're Hired!
        </h1>
      </div>

      {/* Notification Bell and Authentication UI */}
      <div className="flex items-center gap-4">
        {user && (
          <Popover>
            <PopoverTrigger asChild>
              <div>
                <NotificationBell variant="prominent" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto" align="end">
              <NotificationCenter />
            </PopoverContent>
          </Popover>
        )}

        {/* Authentication UI */}
        <div className="flex items-center gap-2">
          {authLoading ? (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded"></div>
          ) : user ? (
            <div className="flex items-center gap-2">
              {/* User profile image if available */}
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}

              {/* User email */}
              {user.email && (
                <span className="text-sm hidden md:inline max-w-[150px] truncate">
                  {user.email}
                </span>
              )}

              {/* Sign Out button */}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/login")}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
