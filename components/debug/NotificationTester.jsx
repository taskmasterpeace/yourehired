import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';

// These will be imported dynamically on the client side
let checkBackupNeeded;
let calculateLocalStorageSize;
let getNewEntriesCount;

const NotificationTester = () => {
  const { 
    addNotification, 
    addTestNotification, 
    addBackupReminder,
    clearAllNotifications,
    settings,
    updateSettings
  } = useNotifications();
  
  const [notificationType, setNotificationType] = useState('test');
  const [notificationDelay, setNotificationDelay] = useState(0);
  const [backupDays, setBackupDays] = useState(14);
  const [newEntries, setNewEntries] = useState(15);
  
  // Import client-side only utilities
  useEffect(() => {
    const importUtils = async () => {
      const utils = await import('../../utils/backupReminders');
      checkBackupNeeded = utils.checkBackupNeeded;
      calculateLocalStorageSize = utils.calculateLocalStorageSize;
      getNewEntriesCount = utils.getNewEntriesCount;
    };
    
    importUtils();
  }, []);
  
  const handleAddTestNotification = () => {
    addTestNotification(parseInt(notificationDelay));
  };
  
  const handleAddBackupReminder = () => {
    addBackupReminder({
      daysSinceBackup: parseInt(backupDays),
      newEntries: parseInt(newEntries),
      totalSize: calculateLocalStorageSize()
    });
  };
  
  const handleToggleNotifications = () => {
    updateSettings({ enabled: !settings.enabled });
  };
  
  const handleRealBackupCheck = () => {
    // Get the last backup date from localStorage
    const lastBackupDate = localStorage.getItem('lastBackupDate');
    
    // Calculate actual stats
    const backupNeeded = checkBackupNeeded({
      lastBackupDate,
      newEntriesSinceBackup: getNewEntriesCount(lastBackupDate),
      dataSize: calculateLocalStorageSize(),
      isLocalStorageOnly: true
    });
    
    if (backupNeeded) {
      addBackupReminder(backupNeeded);
    } else {
      addNotification({
        type: 'system',
        title: 'No Backup Needed',
        message: 'Your data is up to date. No backup is required at this time.',
        read: false
      });
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Notification Tester</CardTitle>
        <CardDescription>Test notification functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications-enabled">Notifications Enabled</Label>
          <Switch 
            id="notifications-enabled" 
            checked={settings.enabled}
            onCheckedChange={handleToggleNotifications}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label>Test Notification</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              placeholder="Delay (minutes)"
              value={notificationDelay}
              onChange={(e) => setNotificationDelay(e.target.value)}
              className="w-32"
            />
            <Button onClick={handleAddTestNotification}>
              Send Test
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label>Backup Reminder</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="backup-days" className="text-xs">Days Since Backup</Label>
              <Input
                id="backup-days"
                type="number"
                min="1"
                value={backupDays}
                onChange={(e) => setBackupDays(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-entries" className="text-xs">New Entries</Label>
              <Input
                id="new-entries"
                type="number"
                min="0"
                value={newEntries}
                onChange={(e) => setNewEntries(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button onClick={handleAddBackupReminder} variant="secondary">
              Simulate Backup Reminder
            </Button>
            <Button onClick={handleRealBackupCheck} variant="outline">
              Check Real Status
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={clearAllNotifications} 
          variant="destructive"
          className="w-full"
        >
          Clear All Notifications
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationTester;
