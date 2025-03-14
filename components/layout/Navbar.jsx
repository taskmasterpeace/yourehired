import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useNotifications } from '../../context/NotificationContext';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import NotificationBell from '../notifications/NotificationBell';
const NotificationCenter = dynamic(() => import('../notifications/NotificationCenter'), { ssr: false });
import TestNotificationButton from '../notifications/TestNotificationButton';

const Navbar = () => {
  // Add a fallback in case the context isn't available yet
  const notificationContext = useNotifications() || {
    notifications: [],
    clearAllNotifications: () => {},
    clearNotification: () => {},
    markAllAsRead: () => {},
    markAsRead: () => {}
  };
  
  const { 
    notifications, 
    clearAllNotifications, 
    clearNotification, 
    markAllAsRead, 
    markAsRead 
  } = notificationContext;
  
  return (
    <nav className="border-b bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <img className="h-8 w-auto" src="/logo.png" alt="Hey You're Hired!" />
                <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">Hey You're Hired!</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Your navigation links */}
              <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/opportunities" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Opportunities
              </Link>
              <Link href="/calendar" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Calendar
              </Link>
              {/* More links */}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <TestNotificationButton />
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <NotificationBell />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="end">
                <NotificationCenter 
                  notifications={notifications}
                  onClearAll={clearAllNotifications}
                  onClearOne={clearNotification}
                  onMarkAllRead={markAllAsRead}
                  onMarkOneRead={markAsRead}
                />
              </PopoverContent>
            </Popover>
            
            {/* User menu and other icons */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
