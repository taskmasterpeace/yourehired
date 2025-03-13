import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const NotificationContent = () => {
  const { notifications, unreadCount, settings } = useNotifications();
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Notification Status</CardTitle>
          <CardDescription>Current notification system status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Notifications:</span>
              <span className="font-medium">{notifications.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Unread Notifications:</span>
              <span className="font-medium">{unreadCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Notifications Enabled:</span>
              <span className="font-medium">{settings.enabled ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Browser Notifications:</span>
              <span className="font-medium">{settings.browserNotifications ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Notifications</CardTitle>
          <CardDescription>List of all notifications in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No notifications</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map(notification => (
                    <div key={notification.id} className="p-3 border rounded-md text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{notification.title}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {notification.type}
                        </span>
                        {!notification.read && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            unread
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="unread" className="max-h-96 overflow-y-auto">
              {unreadCount === 0 ? (
                <p className="text-center text-gray-500 py-4">No unread notifications</p>
              ) : (
                <div className="space-y-2">
                  {notifications
                    .filter(n => !n.read)
                    .map(notification => (
                      <div key={notification.id} className="p-3 border rounded-md text-sm bg-blue-50">
                        <div className="flex justify-between">
                          <span className="font-medium">{notification.title}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {notification.type}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default NotificationContent;
