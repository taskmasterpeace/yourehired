import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { DataManagement } from "./DataManagement";
import { Moon, Sun, Save } from "lucide-react";
import { getFromStorage, saveToStorage } from "../../lib/storage";

interface SettingsScreenProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function SettingsScreen({ isDarkMode, toggleDarkMode }: SettingsScreenProps) {
  // Load settings from storage with defaults
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => 
    getFromStorage('settings', { notifications: true }).notifications
  );
  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(() => 
    getFromStorage('settings', { emailUpdates: true }).emailUpdates
  );
  
  // Load settings on component mount
  useEffect(() => {
    const savedSettings = getFromStorage('settings', {
      notifications: true,
      emailUpdates: true
    });
    
    setNotificationsEnabled(savedSettings.notifications);
    setEmailUpdatesEnabled(savedSettings.emailUpdates);
  }, []);
  
  const handleSaveSettings = () => {
    // Save settings using our storage utility
    saveToStorage('settings', {
      darkMode: isDarkMode,
      notifications: notificationsEnabled,
      emailUpdates: emailUpdatesEnabled
    });
    
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {/* Appearance Settings */}
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <div className="flex items-center">
              <Sun className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-gray-500' : 'text-amber-500'}`} />
              <Switch 
                id="dark-mode" 
                checked={isDarkMode} 
                onCheckedChange={toggleDarkMode} 
              />
              <Moon className={`h-5 w-5 ml-2 ${isDarkMode ? 'text-blue-400' : 'text-gray-500'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Notification Settings */}
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="browser-notifications">Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications in your browser
              </p>
            </div>
            <Switch 
              id="browser-notifications" 
              checked={notificationsEnabled} 
              onCheckedChange={setNotificationsEnabled} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-updates">Email Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly job search summaries via email
              </p>
            </div>
            <Switch 
              id="email-updates" 
              checked={emailUpdatesEnabled} 
              onCheckedChange={setEmailUpdatesEnabled} 
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Data Management Section */}
      <DataManagement isDarkMode={isDarkMode} />
      
      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
