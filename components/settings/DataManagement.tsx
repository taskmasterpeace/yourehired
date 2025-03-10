import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Download, Upload, RefreshCw, AlertTriangle, Award, MessageSquare, Bug, ArrowLeft } from "lucide-react";
import { getFromStorage, saveToStorage, clearFromStorage } from "../../lib/storage";
import { Switch } from "../ui/switch";

interface DataManagementProps {
  isDarkMode: boolean;
  onNavigateBack?: () => void;
}

export function DataManagement({ isDarkMode, onNavigateBack }: DataManagementProps) {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [debugData, setDebugData] = useState<{
    rawData: string | null;
    parsedData: any | null;
    error: string | null;
  }>({ rawData: null, parsedData: null, error: null });
  
  // Function to navigate to home as fallback
  const navigateToHome = () => {
    console.log("Fallback navigation to home");
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImportStatus('No file selected');
      setStatusType('error');
      return;
    }

    // Reset debug data
    setDebugData({ rawData: null, parsedData: null, error: null });
    
    // Show loading status
    setImportStatus('Reading file...');
    setStatusType('success');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Failed to read file');
        }
        
        let rawText = result.trim();
        
        // Store raw data for debugging
        if (debugMode) {
          setDebugData(prev => ({ ...prev, rawData: rawText }));
        }
        
        // Log the raw data for debugging
        console.log("Raw imported data:", rawText.substring(0, 200) + "...");
        
        let data;
        
        try {
          // First attempt: standard JSON parse
          data = JSON.parse(rawText);
          
          // Store parsed data for debugging
          if (debugMode) {
            setDebugData(prev => ({ ...prev, parsedData: data }));
          }
          
          // Handle different formats
          if (data && typeof data === 'object') {
            // If it's an object with jobApplications property (legacy format)
            if (data.jobApplications && Array.isArray(data.jobApplications)) {
              console.log("Found legacy format with jobApplications property");
              data = data.jobApplications;
            } 
            // If it's not an array, but a single object, convert to array
            else if (!Array.isArray(data)) {
              console.log("Converting single object to array");
              data = [data];
            }
            // If it's already an array, use as is
          }
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          if (debugMode) {
            setDebugData(prev => ({ 
              ...prev, 
              error: `Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
            }));
          }
          throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
        
        console.log("Parsed data type:", typeof data);
        console.log("Is array:", Array.isArray(data));
        
        // Store parsed data for debugging
        if (debugMode) {
          setDebugData(prev => ({ ...prev, parsedData: data }));
        }
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          console.log("Object keys:", Object.keys(data));
          // Check if it's the legacy format with jobApplications property
          if (data.jobApplications && Array.isArray(data.jobApplications)) {
            console.log("Found legacy format with jobApplications property");
            data = data.jobApplications;
          } else {
            // If it's a single object, convert to array
            console.log("Converting single object to array");
            data = [data];
          }
        }
        
        // Validate and normalize the data structure
        if (!data) {
          throw new Error('No data found in the imported file.');
        }
        
        // Ensure we're working with an array
        const jobsArray = Array.isArray(data) ? data : [data];
        
        if (jobsArray.length === 0) {
          throw new Error('No job applications found in the imported file.');
        }
        
        console.log("Processing job applications:", jobsArray.length);
        
        // Process and normalize each job application
        const normalizedData = jobsArray.map((job, index) => {
          console.log(`Processing job ${index}:`, job.company || job.position || "Unknown");
          
          // Handle legacy format where position and company might be swapped
          let normalizedJob = { ...job };
          
          // Ensure required fields exist
          if (!normalizedJob.id) {
            normalizedJob.id = String(Date.now() + Math.floor(Math.random() * 1000));
          } else if (typeof normalizedJob.id === 'number') {
            // Convert numeric IDs to strings for consistency
            normalizedJob.id = String(normalizedJob.id);
          }
          
          // Handle case where position and company might be swapped or missing
          if (!normalizedJob.position) {
            if (normalizedJob.title) {
              // Use title field if available
              normalizedJob.position = normalizedJob.title;
            } else if (normalizedJob.company && 
                typeof normalizedJob.company === 'string' && 
                normalizedJob.company.length < 100) {
              // If position is missing but company looks like a position title
              normalizedJob.position = normalizedJob.company;
              normalizedJob.company = "Unknown Company";
            }
          }
          
          // Ensure all required fields have at least empty values
          normalizedJob.company = normalizedJob.company || "Unknown Company";
          normalizedJob.position = normalizedJob.position || "Unknown Position";
          normalizedJob.status = normalizedJob.status || "Bookmarked";
          
          // Handle date format conversion
          if (normalizedJob.appliedDate) {
            // Check if the date is already in ISO format
            if (!/^\d{4}-\d{2}-\d{2}/.test(normalizedJob.appliedDate)) {
              try {
                // Try to parse the date string
                const parsedDate = new Date(normalizedJob.appliedDate);
                if (!isNaN(parsedDate.getTime())) {
                  // Convert to ISO format YYYY-MM-DD
                  normalizedJob.appliedDate = parsedDate.toISOString().slice(0, 10);
                } else {
                  // If parsing fails, use current date
                  normalizedJob.appliedDate = new Date().toISOString().slice(0, 10);
                }
              } catch (e) {
                // If any error occurs, use current date
                normalizedJob.appliedDate = new Date().toISOString().slice(0, 10);
              }
            }
          } else {
            // If no date provided, use current date
            normalizedJob.appliedDate = new Date().toISOString().slice(0, 10);
          }
          normalizedJob.jobDescription = normalizedJob.jobDescription || "";
          normalizedJob.resume = normalizedJob.resume || "";
          normalizedJob.notes = normalizedJob.notes || "";
          normalizedJob.location = normalizedJob.location || "";
          normalizedJob.salary = normalizedJob.salary || "";
          normalizedJob.applicationUrl = normalizedJob.applicationUrl || "";
          normalizedJob.source = normalizedJob.source || "";
          normalizedJob.tags = Array.isArray(normalizedJob.tags) ? normalizedJob.tags : [];
          normalizedJob.recruiterName = normalizedJob.recruiterName || "";
          normalizedJob.recruiterEmail = normalizedJob.recruiterEmail || "";
          normalizedJob.recruiterPhone = normalizedJob.recruiterPhone || "";
          
          // Normalize keywords if they exist
          if (normalizedJob.keywords) {
            // Ensure keywords have the correct structure
            normalizedJob.keywords = Array.isArray(normalizedJob.keywords) ? 
              normalizedJob.keywords.map(keyword => {
                if (typeof keyword === 'string') {
                  // Convert string keywords to proper format
                  return {
                    text: keyword,
                    relevance: 3,
                    inResume: false,
                    matchScore: 0,
                    category: "should-have"
                  };
                }
                return {
                  text: keyword.text || "",
                  relevance: keyword.relevance || 3,
                  inResume: keyword.inResume || false,
                  matchScore: keyword.matchScore || 0,
                  category: keyword.category || "should-have"
                };
              }) : [];
          } else {
            // Create empty keywords array if missing
            normalizedJob.keywords = [];
          }
          
          return normalizedJob;
        });
        
        console.log("Normalized data:", normalizedData.length, "applications");
        
        // Store the normalized data
        console.log("About to save job applications:", normalizedData.length);
        saveToStorage('jobApplications', normalizedData);
        console.log("Saved job applications to storage");
        
        // Verify the data is there immediately after saving
        const verifyData = getFromStorage('jobApplications', []);
        console.log("Verification - data in storage after save:", verifyData.length);
        
        // If verification fails, try an alternative storage approach
        if (!verifyData || verifyData.length === 0) {
          console.warn("Verification failed - trying alternative storage method");
          
          // Try direct localStorage approach as fallback
          try {
            localStorage.setItem('jobApplications', JSON.stringify(normalizedData));
            console.log("Used direct localStorage method");
            
            // Verify again
            const secondVerify = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            console.log("Second verification:", secondVerify.length);
          } catch (storageError) {
            console.error("Storage error:", storageError);
          }
        }
        
        // Force a refresh of the application data
        const forceDataRefresh = () => {
          // This will trigger any components using the job applications data to refresh
          const event = new CustomEvent('jobApplicationsUpdated', { 
            detail: { count: normalizedData.length } 
          });
          window.dispatchEvent(event);
          
          console.log("Dispatched data refresh event");
        };
        
        // Call the refresh function
        forceDataRefresh();
        
        setImportStatus(`Successfully imported ${normalizedData.length} job applications`);
        setStatusType('success');
        
        // Don't reload the page, just show success message
        // The user can navigate back to see their imported data
        
      } catch (error) {
        console.error('Import error:', error);
        setImportStatus(`Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setStatusType('error');
        
        // Store error for debugging
        if (debugMode) {
          setDebugData(prev => ({ 
            ...prev, 
            error: `Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}`
          }));
        }
      }
    };
    
    reader.readAsText(file);
  };

  const handleExportData = () => {
    try {
      // Get job applications using our storage utility
      const jobApplications = getFromStorage('jobApplications', []);
      
      // Create a downloadable file
      const dataStr = JSON.stringify(jobApplications, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Create download link and trigger download
      const exportFileDefaultName = `job-applications-${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
    } catch (error) {
      console.error('Export error:', error);
      alert(`Error exporting data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleResetData = (dataType: 'applications' | 'achievements' | 'analytics') => {
    if (!confirm(`Are you sure you want to reset all ${dataType} data? This cannot be undone.`)) {
      return;
    }
    
    try {
      switch (dataType) {
        case 'applications':
          clearFromStorage('jobApplications');
          break;
        case 'achievements':
          clearFromStorage('achievements');
          clearFromStorage('userLevel');
          break;
        case 'analytics':
          clearFromStorage('analytics');
          break;
      }
      
      alert(`${dataType} data has been reset successfully.`);
      
      // Don't reload the page
      setImportStatus(`${dataType} data has been reset successfully.`);
      setStatusType('success');
      
    } catch (error) {
      console.error('Reset error:', error);
      alert(`Error resetting data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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
        id: "application_5",
        name: "Persistent Applicant",
        description: "You're building momentum in your job search",
        category: "milestones",
        points: 25,
        unlocked: true,
        progress: 5,
        total: 5,
        rarity: "uncommon"
      },
      {
        id: "application_25",
        name: "Dedicated Job Seeker",
        description: "Your commitment to finding the right role is impressive",
        category: "milestones",
        points: 50,
        unlocked: false,
        progress: 15,
        total: 25,
        rarity: "rare"
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
        id: "weekend_warrior",
        name: "Weekend Warrior",
        description: "You don't let weekends slow down your job search",
        category: "consistency",
        points: 15,
        unlocked: true,
        progress: 1,
        total: 1,
        rarity: "common"
      },
      {
        id: "profile_complete",
        name: "Profile Pioneer",
        description: "A complete profile helps you stand out to employers",
        category: "mastery",
        points: 15,
        unlocked: true,
        progress: 1,
        total: 1,
        rarity: "common"
      },
      {
        id: "first_response",
        name: "First Response",
        description: "Your application caught someone's attention",
        category: "quality",
        points: 20,
        unlocked: true,
        progress: 1,
        total: 1,
        rarity: "uncommon"
      },
      {
        id: "first_interview",
        name: "Interview Invitation",
        description: "Your qualifications stood out enough to earn an interview",
        category: "quality",
        points: 30,
        unlocked: false,
        progress: 0,
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
        progress: 3,
        total: 10,
        rarity: "rare"
      }
    ];
    
    // Store mock achievements using our storage utility
    saveToStorage('achievements', mockAchievements);
    
    // Add mock user level data
    const mockUserLevel = {
      level: 3,
      progress: 65,
      totalScore: 165,
      nextLevelScore: 200
    };
    
    saveToStorage('userLevel', mockUserLevel);
    
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
      jobSearchStats: {
        level: 3,
        progress: 65,
        totalScore: 165,
        nextLevelScore: 200
      },
      achievements: mockAchievements,
      applicationTimeline: {
        "7days": Array(7).fill(0).map((_, i) => ({ 
          date: new Date(Date.now() - (6-i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          count: Math.floor(Math.random() * 5),
          totalCount: 15 + i * 3,
          events: i === 3 ? [{
            id: "milestone-1",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            type: "achievement",
            title: "Weekend Warrior Unlocked",
            description: "You applied on both Saturday and Sunday",
            icon: <Award />
          }] : []
        })),
        "30days": Array(30).fill(0).map((_, i) => ({ 
          date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          count: Math.floor(Math.random() * 5),
          totalCount: 5 + i,
          events: i === 15 ? [{
            id: "milestone-2",
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            type: "response",
            title: "First Response Received",
            description: "You received your first employer response",
            icon: <MessageSquare />
          }] : []
        })),
        "90days": Array(90).fill(0).map((_, i) => ({ 
          date: new Date(Date.now() - (89-i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          count: Math.floor(Math.random() * 5),
          totalCount: i,
          events: []
        })),
        "all": Array(120).fill(0).map((_, i) => ({ 
          date: new Date(Date.now() - (119-i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          count: Math.floor(Math.random() * 5),
          totalCount: i,
          events: []
        }))
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
        },
        {
          name: "Skill Development",
          description: "Complete an online course or tutorial",
          progress: 0,
          target: 1,
          expires: "7 days",
          reward: "25 points"
        }
      ]
    };
    
    saveToStorage('analytics', mockAnalytics);
    
    alert('Mock achievement and analytics data added successfully!');
    
    // Don't reload the page
    setImportStatus('Mock achievement and analytics data added successfully!');
    setStatusType('success');
  };

  return (
    <Card className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Import or export your job application data
            </CardDescription>
          </div>
          {onNavigateBack && (
            <Button 
              onClick={onNavigateBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Import Section */}
        <div>
          <h3 className="text-lg font-medium mb-2">Import Data</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Import job applications from a JSON file
          </p>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <label htmlFor="debug-mode" className="text-sm font-medium cursor-pointer flex items-center">
                <Bug className="h-4 w-4 mr-1" />
                Debug Mode
              </label>
              <Switch 
                id="debug-mode" 
                checked={debugMode} 
                onCheckedChange={setDebugMode} 
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className={`max-w-md ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}
            />
            <Button 
              onClick={() => document.getElementById('file-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
          </div>
          {importStatus && (
            <Alert 
              className={`mt-3 ${
                statusType === 'error' 
                  ? (isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200') 
                  : (isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200')
              }`}
            >
              <AlertDescription className={`
                ${statusType === 'error' 
                  ? (isDarkMode ? 'text-red-300' : 'text-red-600') 
                  : (isDarkMode ? 'text-green-300' : 'text-green-600')
                }
              `}>
                {statusType === 'error' && <AlertTriangle className="h-4 w-4 inline mr-2" />}
                {importStatus}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Navigation button after successful import */}
          {importStatus && statusType === 'success' && (
            <Button 
              onClick={() => {
                console.log("Return to Dashboard button clicked");
                // Force a final verification before navigation
                const finalCheck = getFromStorage('jobApplications', []);
                console.log("Final verification before navigation:", finalCheck.length);
                
                if (onNavigateBack) {
                  onNavigateBack();
                } else {
                  navigateToHome();
                }
              }}
              className="mt-3 flex items-center gap-2"
              variant="primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard to View Imported Data
              {verifyData && verifyData.length > 0 ? 
                ` (${verifyData.length} applications)` : 
                " (Refresh page if data doesn't appear)"}
            </Button>
          )}
          
          {/* Debug Information Panel */}
          {debugMode && (
            <div className={`mt-4 p-4 rounded-md border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="text-sm font-semibold mb-2 flex items-center">
                <Bug className="h-4 w-4 mr-1" />
                Debug Information
              </h4>
              
              {/* Raw Data Section */}
              <div className="mb-3">
                <h5 className="text-xs font-medium mb-1">Raw Data (first 500 chars):</h5>
                <pre className={`text-xs p-2 rounded overflow-x-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} style={{ maxHeight: '150px' }}>
                  {debugData.rawData ? debugData.rawData.substring(0, 500) + "..." : "No data available. Try importing a file with Debug Mode enabled."}
                </pre>
              </div>
              
              {/* Error Section */}
              {debugData.error && (
                <div className="mb-3">
                  <h5 className="text-xs font-medium mb-1 text-red-500">Error:</h5>
                  <pre className={`text-xs p-2 rounded overflow-x-auto ${isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'}`}>
                    {debugData.error}
                  </pre>
                </div>
              )}
              
              {/* Parsed Data Section */}
              <div>
                <h5 className="text-xs font-medium mb-1">Parsed Data Structure:</h5>
                <pre className={`text-xs p-2 rounded overflow-x-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} style={{ maxHeight: '150px' }}>
                  {debugData.parsedData 
                    ? `Type: ${typeof debugData.parsedData}\nIs Array: ${Array.isArray(debugData.parsedData)}\nLength: ${Array.isArray(debugData.parsedData) ? debugData.parsedData.length : 'N/A'}\n\nSample: ${JSON.stringify(debugData.parsedData, null, 2).substring(0, 300)}...` 
                    : "No parsed data available."}
                </pre>
              </div>
            </div>
          )}
        </div>
        
        {/* Export Section */}
        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium mb-2">Export Data</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Export your job applications as a JSON file
          </p>
          <Button onClick={handleExportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to JSON
          </Button>
        </div>
        
        {/* Mock Data Section */}
        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium mb-2">Test Data</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Add mock data to test gamification features
          </p>
          <Button 
            onClick={addMockAchievementData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Add Mock Achievement Data
          </Button>
        </div>
        
        {/* Reset Section */}
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
                size="sm"
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
                size="sm"
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
                size="sm"
              >
                Reset Analytics
              </Button>
              <p className="text-xs text-muted-foreground">
                Clears all analytics data and statistics
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
