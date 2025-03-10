import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [importStatus, setImportStatus] = useState('');
  const [importOptions, setImportOptions] = useState({
    applications: true,
    achievements: false,
    analytics: false
  });
  const [importData, setImportData] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [importStep, setImportStep] = useState('select'); // 'select', 'confirm', 'complete'

  // Import handler
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result as string);
        
        // Basic validation
        if (typeof data !== 'object') {
          throw new Error('Invalid data format. Expected a JSON object with application data.');
        }
        
        // Check for required data structures based on selected options
        if (importOptions.applications && (!data.applications || !Array.isArray(data.applications))) {
          throw new Error('Invalid applications data format. Expected an array of job applications.');
        }
        
        if (importOptions.achievements && (!data.achievements || !Array.isArray(data.achievements))) {
          throw new Error('Invalid achievements data format.');
        }
        
        if (importOptions.analytics && (!data.analytics || typeof data.analytics !== 'object')) {
          throw new Error('Invalid analytics data format.');
        }
        
        // Check for potential duplicates
        let duplicateWarning = null;
        
        if (importOptions.applications) {
          const existingApps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
          const newApps = data.applications || [];
          
          // Check for potential duplicates by company and position
          const potentialDuplicates = newApps.filter(newApp => 
            existingApps.some(existingApp => 
              existingApp.company === newApp.company && 
              existingApp.position === newApp.position
            )
          );
          
          if (potentialDuplicates.length > 0) {
            duplicateWarning = {
              type: 'applications',
              count: potentialDuplicates.length,
              examples: potentialDuplicates.slice(0, 2).map(app => `${app.company} - ${app.position}`)
            };
          }
        }
        
        // Store the parsed data and any warnings
        setImportData(data);
        setDuplicateWarning(duplicateWarning);
        setImportStep('confirm');
        
      } catch (error) {
        console.error('Import error:', error);
        setImportStatus(`Error importing data: ${error.message}`);
      }
    };
    
    reader.readAsText(file);
  };

  // Handle the actual import after confirmation
  const handleConfirmImport = (strategy = 'merge') => {
    try {
      if (!importData) return;
      
      // Import applications if selected
      if (importOptions.applications && importData.applications) {
        const existingApps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        let newApps = [];
        
        if (strategy === 'replace') {
          // Replace all existing data
          newApps = importData.applications;
        } else if (strategy === 'merge') {
          // Merge, avoiding duplicates by company and position
          const existingKeys = new Set(existingApps.map(app => `${app.company}-${app.position}`));
          
          newApps = [
            ...existingApps,
            ...importData.applications.filter(app => 
              !existingKeys.has(`${app.company}-${app.position}`)
            )
          ];
        }
        
        localStorage.setItem('jobApplications', JSON.stringify(newApps));
      }
      
      // Import achievements if selected
      if (importOptions.achievements && importData.achievements) {
        localStorage.setItem('achievements', JSON.stringify(importData.achievements));
        
        if (importData.userLevel) {
          localStorage.setItem('userLevel', JSON.stringify(importData.userLevel));
        }
      }
      
      // Import analytics if selected
      if (importOptions.analytics && importData.analytics) {
        localStorage.setItem('analytics', JSON.stringify(importData.analytics));
      }
      
      setImportStatus(`Successfully imported data`);
      setImportStep('complete');
      
      // Reload the page after a short delay
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (error) {
      console.error('Import confirmation error:', error);
      setImportStatus(`Error importing data: ${error.message}`);
    }
  };

  // Cancel import
  const cancelImport = () => {
    setImportData(null);
    setDuplicateWarning(null);
    setImportStep('select');
    setImportStatus('');
  };

  // Export handler - enhanced version
  const handleExportData = () => {
    try {
      const exportData = {};
      
      // Get job applications if selected
      if (importOptions.applications) {
        exportData.applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      }
      
      // Get achievements if selected
      if (importOptions.achievements) {
        exportData.achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        exportData.userLevel = JSON.parse(localStorage.getItem('userLevel') || 'null');
      }
      
      // Get analytics if selected
      if (importOptions.analytics) {
        exportData.analytics = JSON.parse(localStorage.getItem('analytics') || 'null');
      }
      
      // Create a downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Create download link and trigger download
      const exportFileDefaultName = `captain-app-data-${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
    } catch (error) {
      console.error('Export error:', error);
      alert(`Error exporting data: ${error.message}`);
    }
  };

  // Reset data handler
  const handleResetData = (dataType: string) => {
    if (!confirm(`Are you sure you want to reset all ${dataType} data? This cannot be undone.`)) {
      return;
    }
    
    try {
      switch (dataType) {
        case 'applications':
          localStorage.removeItem('jobApplications');
          break;
        case 'achievements':
          localStorage.removeItem('achievements');
          localStorage.removeItem('userLevel');
          break;
        case 'analytics':
          localStorage.removeItem('analytics');
          break;
        case 'all':
          localStorage.removeItem('captainAppState');
          break;
        default:
          throw new Error('Unknown data type');
      }
      
      alert(`${dataType} data has been reset successfully.`);
      
      // Reload the page to see changes
      window.location.reload();
      
    } catch (error) {
      console.error('Reset error:', error);
      alert(`Error resetting data: ${error.message}`);
    }
  };

  // Add mock achievement data for testing
  const addMockAchievementData = () => {
    const mockAchievements = [
      {
        id: "first_application",
        name: "First Steps",
        description: "Submit your first job application",
        category: "milestones",
        points: 10,
        unlocked: true,
        progress: 1,
        total: 1,
        rarity: "common"
      },
      {
        id: "application_streak",
        name: "Consistent Applicant",
        description: "Apply to jobs for 7 consecutive days",
        category: "consistency",
        points: 25,
        unlocked: false,
        progress: 5,
        total: 7,
        rarity: "uncommon"
      },
      {
        id: "profile_master",
        name: "Profile Master",
        description: "Complete your profile with all optional sections",
        category: "quality",
        points: 30,
        unlocked: true,
        progress: 1,
        total: 1,
        rarity: "rare"
      },
      {
        id: "interview_ace",
        name: "Interview Ace",
        description: "Complete 10 interviews",
        category: "mastery",
        points: 50,
        unlocked: false,
        progress: 6,
        total: 10,
        rarity: "rare"
      }
    ];
    
    // Store mock achievements
    localStorage.setItem('achievements', JSON.stringify(mockAchievements));
    
    // Add mock user level data
    const mockUserLevel = {
      level: 3,
      progress: 65,
      totalScore: 265,
      nextLevelScore: 300
    };
    
    localStorage.setItem('userLevel', JSON.stringify(mockUserLevel));
    
    // Add mock analytics data
    const mockAnalytics = {
      totalApplications: 45,
      activeApplications: 12,
      responseRate: 28,
      interviewRate: 15,
      offerRate: 5,
      statusCounts: {
        "Applied": 25,
        "Screening": 8,
        "Interview": 5,
        "Offer": 2,
        "Rejected": 5
      },
      applicationTimeline: {
        "7days": Array(7).fill(0).map((_, i) => ({ day: i, count: Math.floor(Math.random() * 5) })),
        "30days": Array(30).fill(0).map((_, i) => ({ day: i, count: Math.floor(Math.random() * 5) })),
        "90days": Array(90).fill(0).map((_, i) => ({ day: i, count: Math.floor(Math.random() * 5) })),
        "all": Array(120).fill(0).map((_, i) => ({ day: i, count: Math.floor(Math.random() * 5) }))
      },
      weeklyPatterns: {
        mostActiveDay: { day: "Tuesday", count: 12 },
        leastActiveDay: { day: "Saturday", count: 2 }
      },
      jobSearchInsights: [
        {
          title: "Application Timing",
          description: "You're most successful when applying on Tuesday mornings."
        },
        {
          title: "Resume Keywords",
          description: "Adding more technical skills to your resume could improve your match rate."
        }
      ],
      weeklyChallenges: [
        {
          name: "Resume Booster",
          description: "Update your resume with 3 new accomplishments",
          progress: 2,
          target: 3,
          expires: "3 days",
          reward: "15 points"
        },
        {
          name: "Network Builder",
          description: "Connect with 5 professionals in your target industry",
          progress: 1,
          target: 5,
          expires: "5 days",
          reward: "20 points"
        }
      ]
    };
    
    localStorage.setItem('analytics', JSON.stringify(mockAnalytics));
    
    alert('Mock achievement and analytics data added successfully!');
  };
  return (
    <div className="space-y-6">
      {/* Data Management Card */}
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Import or export your job application data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import Section */}
          <div>
            <h3 className="text-lg font-medium mb-2">Import Data</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Import your data from a JSON file
            </p>
            
            {importStep === 'select' && (
              <>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="import-applications" 
                      checked={importOptions.applications}
                      onCheckedChange={(checked) => 
                        setImportOptions({...importOptions, applications: !!checked})
                      }
                    />
                    <label
                      htmlFor="import-applications"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Job Applications
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="import-achievements" 
                      checked={importOptions.achievements}
                      onCheckedChange={(checked) => 
                        setImportOptions({...importOptions, achievements: !!checked})
                      }
                    />
                    <label
                      htmlFor="import-achievements"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Achievements & Level Progress
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="import-analytics" 
                      checked={importOptions.analytics}
                      onCheckedChange={(checked) => 
                        setImportOptions({...importOptions, analytics: !!checked})
                      }
                    />
                    <label
                      htmlFor="import-analytics"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Analytics Data
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="max-w-md"
                  />
                </div>
              </>
            )}
            
            {importStep === 'confirm' && (
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium mb-2">Ready to import:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {importOptions.applications && importData.applications && (
                      <li>{importData.applications.length} job applications</li>
                    )}
                    {importOptions.achievements && importData.achievements && (
                      <li>{importData.achievements.length} achievements</li>
                    )}
                    {importOptions.analytics && importData.analytics && (
                      <li>Analytics data</li>
                    )}
                  </ul>
                </div>
                
                {duplicateWarning && (
                  <Alert variant="warning" className="bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Potential Duplicates Detected</AlertTitle>
                    <AlertDescription>
                      Found {duplicateWarning.count} potential duplicate {duplicateWarning.type}
                      {duplicateWarning.examples && duplicateWarning.examples.length > 0 && (
                        <>
                          <br />
                          <span className="text-xs">Examples: {duplicateWarning.examples.join(', ')}</span>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={() => handleConfirmImport('merge')}>
                    Merge (Skip Duplicates)
                  </Button>
                  <Button onClick={() => handleConfirmImport('replace')} variant="outline">
                    Replace All
                  </Button>
                  <Button onClick={cancelImport} variant="ghost">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {importStep === 'complete' && (
              <div className="p-4 border rounded-md bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100">
                <p>Import completed successfully!</p>
                <p className="text-sm mt-1">The page will reload momentarily...</p>
              </div>
            )}
            
            {importStatus && importStep !== 'complete' && (
              <p className={`mt-2 text-sm ${importStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {importStatus}
              </p>
            )}
          </div>
          
          {/* Export Section */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">Export Data</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Export your data as a JSON file
            </p>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="export-applications" 
                  checked={importOptions.applications}
                  onCheckedChange={(checked) => 
                    setImportOptions({...importOptions, applications: !!checked})
                  }
                />
                <label
                  htmlFor="export-applications"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Job Applications
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="export-achievements" 
                  checked={importOptions.achievements}
                  onCheckedChange={(checked) => 
                    setImportOptions({...importOptions, achievements: !!checked})
                  }
                />
                <label
                  htmlFor="export-achievements"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Achievements & Level Progress
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="export-analytics" 
                  checked={importOptions.analytics}
                  onCheckedChange={(checked) => 
                    setImportOptions({...importOptions, analytics: !!checked})
                  }
                />
                <label
                  htmlFor="export-analytics"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Analytics Data
                </label>
              </div>
            </div>
            
            <Button onClick={handleExportData}>
              Export to JSON
            </Button>
          </div>
          
          {/* Mock Data Section */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">Test Data</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Add mock achievement data for testing gamification features
            </p>
            <Button onClick={addMockAchievementData}>
              Add Mock Achievement Data
            </Button>
          </div>
        </CardContent>
      </Card>
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
              <h3 className="text-lg font-medium mb-2">Reset Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Clear specific data from the application
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleResetData('applications')}
                  >
                    Reset Job Applications
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Removes all job applications and related data
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleResetData('achievements')}
                  >
                    Reset Achievements
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Resets all achievement progress and levels
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleResetData('analytics')}
                  >
                    Reset Analytics
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Clears all analytics data and statistics
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleResetData('all')}
                  >
                    Reset All Data
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Clears all application data (complete reset)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
