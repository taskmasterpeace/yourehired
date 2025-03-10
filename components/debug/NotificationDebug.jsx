import React from 'react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDebug = () => {
  const notificationContext = useNotifications();
  
  if (!notificationContext) {
    return <div className="p-4 bg-red-100 text-red-800">NotificationContext is not available!</div>;
  }
  
  return (
    <div className="p-4 bg-green-100 text-green-800">
      NotificationContext is working!
      <pre className="mt-2 text-xs">
        {JSON.stringify({
          notificationCount: notificationContext.notifications?.length || 0,
          settingsEnabled: notificationContext.settings?.enabled
        }, null, 2)}
      </pre>
    </div>
  );
};

export default NotificationDebug;
