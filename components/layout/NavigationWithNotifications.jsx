import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationBell from '../notifications/NotificationBell';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import NotificationCenter from '../notifications/NotificationCenter';
import { useAuth } from '../../context/auth-context';
import { Button } from "../ui/button";
import { AuthModal } from '../auth/AuthModal';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Lock } from 'lucide-react';

const NavigationWithNotifications = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { isDarkMode } = useDarkMode();
  const notificationContext = useNotifications();
  
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4 items-end">
        <img 
          src="/logo.png" 
          alt="Hey, You're Hired! Logo" 
          className="h-24 w-24 mr-2" 
        />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">Hey, You're Hired!</h1>
      </div>
      
      {/* Local storage indicator */}
      {user?.localStorageOnly && (
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
              notifications={notificationContext?.notifications || []}
              onClearAll={notificationContext?.clearAllNotifications}
              onClearOne={notificationContext?.clearNotification}
              onMarkAllRead={notificationContext?.markAllAsRead}
              onMarkOneRead={notificationContext?.markAsRead}
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
            <span className="text-sm hidden md:inline">{user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        ) : (
          <AuthModal 
            trigger={<Button variant="outline" size="sm">Sign In</Button>}
          />
        )}
      </div>
    </div>
  );
};

export default NavigationWithNotifications;
