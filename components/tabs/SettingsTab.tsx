import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

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
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

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

  // Add mock data for testing
  const addMockData = (dataType: string) => {
    switch (dataType) {
      case 'applications':
        const mockApplications = [
          {
            id: "app1",
            company: "TechCorp Inc.",
            position: "Senior Developer",
            status: "Applied",
            dateApplied: new Date().toISOString(),
            notes: "Applied through company website",
            location: "San Francisco, CA",
            salary: "$120,000 - $150,000",
            contactName: "Jane Smith",
            contactEmail: "jane.smith@techcorp.com"
          },
          {
            id: "app2",
            company: "InnovateSoft",
            position: "Full Stack Engineer",
            status: "Interview",
            dateApplied: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            notes: "Had first interview, waiting for technical round",
            location: "Remote",
            salary: "$100,000 - $130,000",
            contactName: "John Doe",
            contactEmail: "john.doe@innovatesoft.com"
          },
          {
            id: "app3",
            company: "DataViz Solutions",
            position: "Frontend Developer",
            status: "Rejected",
            dateApplied: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            notes: "Received rejection email",
            location: "New York, NY",
            salary: "$90,000 - $110,000",
            contactName: "Alice Johnson",
            contactEmail: "alice.j@dataviz.com"
          }
        ];
        
        // Store mock applications
        const existingApps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        localStorage.setItem('jobApplications', JSON.stringify([...existingApps, ...mockApplications]));
        alert('Mock application data added successfully!');
        break;
        
      case 'analytics':
        // Use the existing analytics mock data structure
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
        alert('Mock analytics data added successfully!');
        break;
    }
  };

  // Handle admin login
  const handleAdminLogin = () => {
    // Simple password check - in a real app, use proper authentication
    if (adminPassword === 'captain-admin') {
      setIsAdminMode(true);
      setShowAdminLogin(false);
    } else {
      alert('Invalid administrator password');
    }
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
        <CardContent className="space-y-6">
          {/* Import/Export Section - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Import Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Import Data</h3>
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
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Export Data</h3>
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
          </div>
          
          {/* Test Data Section */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">Test Data *</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Add mock data for testing features
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={addMockAchievementData}>
                Add Mock Achievement Data
              </Button>
              <Button onClick={() => addMockData('applications')}>
                Add Mock Applications
              </Button>
              <Button onClick={() => addMockData('analytics')}>
                Add Mock Analytics
              </Button>
            </div>
          </div>
          
          {/* Reset Data Section */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">Reset Data *</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Clear specific data from the application
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="destructive" 
                onClick={() => handleResetData('applications')}
              >
                Reset Applications
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleResetData('achievements')}
              >
                Reset Achievements
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleResetData('analytics')}
              >
                Reset Analytics
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleResetData('all')}
              >
                Reset All Data
              </Button>
            </div>
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
      
      {/* Application Settings Card */}
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Customize your job application experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notification-sounds">Notification Sounds</Label>
                <p className="text-sm text-gray-500">
                  Play sounds for important notifications
                </p>
              </div>
              <Switch
                id="notification-sounds"
                checked={true} // Replace with actual state
                onCheckedChange={() => {}} // Add handler
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto-Save Applications</Label>
                <p className="text-sm text-gray-500">
                  Automatically save application drafts
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={true} // Replace with actual state
                onCheckedChange={() => {}} // Add handler
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminder-emails">Reminder Emails</Label>
                <p className="text-sm text-gray-500">
                  Send email reminders for follow-ups
                </p>
              </div>
              <Switch
                id="reminder-emails"
                checked={false} // Replace with actual state
                onCheckedChange={() => {}} // Add handler
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings Card */}
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control your data and privacy preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="usage-analytics">Usage Analytics</Label>
                <p className="text-sm text-gray-500">
                  Allow anonymous usage data collection
                </p>
              </div>
              <Switch
                id="usage-analytics"
                checked={true} // Replace with actual state
                onCheckedChange={() => {}} // Add handler
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="local-storage-only">Local Storage Only</Label>
                <p className="text-sm text-gray-500">
                  Keep all data on your device only
                </p>
              </div>
              <Switch
                id="local-storage-only"
                checked={true} // Replace with actual state
                onCheckedChange={() => {}} // Add handler
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Options Card */}
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
          </div>
        </CardContent>
      </Card>

      {/* Administrator Mode Card */}
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>Administrator Mode *</CardTitle>
          <CardDescription>
            Access advanced settings and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdminMode && !showAdminLogin ? (
            <Button 
              variant="outline" 
              onClick={() => setShowAdminLogin(true)}
            >
              Enter Administrator Mode
            </Button>
          ) : !isAdminMode && showAdminLogin ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">Administrator Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdminLogin}>
                  Login
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-800 dark:text-green-100">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Administrator Mode Active</AlertTitle>
                <AlertDescription>
                  You now have access to advanced settings and features
                </AlertDescription>
              </Alert>
              
              {/* Admin-only settings */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug-logging">Debug Logging *</Label>
                    <p className="text-sm text-gray-500">
                      Enable detailed application logs
                    </p>
                  </div>
                  <Switch
                    id="debug-logging"
                    checked={false} // Replace with actual state
                    onCheckedChange={() => {}} // Add handler
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="feature-flags">Feature Flags *</Label>
                    <p className="text-sm text-gray-500">
                      Toggle experimental features
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Features
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="user-management">User Management *</Label>
                    <p className="text-sm text-gray-500">
                      Manage user accounts and permissions
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Users
                  </Button>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setIsAdminMode(false)}
                className="mt-2"
              >
                Exit Administrator Mode
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
