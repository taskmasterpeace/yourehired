import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface SettingsTabProps {
  opportunities: any[];
  jobRecommendations: any[];
  ratedRecommendations: any[];
  isDarkMode: boolean;
  showDebugPanel: boolean;
  setShowDebugPanel: (show: boolean) => void;
  toggleDarkMode: (checked: boolean) => void;
  user: any;
}

export function SettingsTab({
  opportunities,
  jobRecommendations,
  ratedRecommendations,
  isDarkMode,
  showDebugPanel,
  setShowDebugPanel,
  toggleDarkMode,
  user
}: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-gray-500">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>Developer Options</CardTitle>
          <CardDescription>
            Advanced settings for debugging
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="debug-panel">Debug Panel</Label>
                <p className="text-sm text-gray-500">
                  Show debug information panel
                </p>
              </div>
              <Switch
                id="debug-panel"
                checked={showDebugPanel}
                onCheckedChange={setShowDebugPanel}
              />
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                    localStorage.removeItem('captainAppState');
                    window.location.reload();
                  }
                }}
              >
                Reset All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
