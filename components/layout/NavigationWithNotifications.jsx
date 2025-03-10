import React from 'react';
import NotificationBell from '../NotificationBell';

const NavigationWithNotifications = ({ children }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1">
        {children}
      </div>
      <div className="flex items-center space-x-2">
        <NotificationBell />
      </div>
    </div>
  );
};

export default NavigationWithNotifications;
