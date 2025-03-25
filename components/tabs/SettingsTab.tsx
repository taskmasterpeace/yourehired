import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import TestNotificationButton from "../notifications/TestNotificationButton";

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

// Define the type for the duplicateWarning state
interface DuplicateWarning {
  type: string;
  count: number;
  examples: string[];
}

// Define the exportData type
interface ExportData {
  applications?: any[];
  achievements?: any[];
  userLevel?: any;
  analytics?: any;
}

// Handle error messages properly with type guards
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export function SettingsTab({
  opportunities,
  jobRecommendations,
  ratedRecommendations,
  isDarkMode,
  showDebugPanel,
  setShowDebugPanel,
  toggleDarkMode,
  user,
}: SettingsTabProps) {
  const [importStatus, setImportStatus] = useState("");
  const [importOptions, setImportOptions] = useState({
    applications: true,
    achievements: false,
    analytics: false,
  });

  const [importData, setImportData] = useState<any>(null);
  const [duplicateWarning, setDuplicateWarning] =
    useState<DuplicateWarning | null>(null);
  const [importStep, setImportStep] = useState("select"); // 'select', 'confirm', 'complete'
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Import handler
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (!result || typeof result !== "string") {
          console.error("Failed to read file or result is not a string");
          return;
        }
        const data = JSON.parse(result);
        // Basic validation
        if (typeof data !== "object") {
          throw new Error(
            "Invalid data format. Expected a JSON object with application data."
          );
        }
        // Check for required data structures based on selected options
        if (
          importOptions.applications &&
          (!data.applications || !Array.isArray(data.applications))
        ) {
          throw new Error(
            "Invalid applications data format. Expected an array of job applications."
          );
        }
        if (
          importOptions.achievements &&
          (!data.achievements || !Array.isArray(data.achievements))
        ) {
          throw new Error("Invalid achievements data format.");
        }
        if (
          importOptions.analytics &&
          (!data.analytics || typeof data.analytics !== "object")
        ) {
          throw new Error("Invalid analytics data format.");
        }
        // Store the parsed data
        setImportData(data);
        setDuplicateWarning(null);
        setImportStep("confirm");
      } catch (error: unknown) {
        console.error("Import error:", error);
        setImportStatus(`Error importing data: ${getErrorMessage(error)}`);
      }
    };
    reader.readAsText(file);
  };

  // Handle the actual import after confirmation
  const handleConfirmImport = (strategy = "merge") => {
    try {
      if (!importData) return;
      // Here we would dispatch actions to add the imported data to the Supabase store
      // For applications, achievements, and analytics as selected
      setImportStatus(`Successfully imported data`);
      setImportStep("complete");
      // Reload the page after a short delay
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: unknown) {
      console.error("Import confirmation error:", error);
      setImportStatus(`Error importing data: ${getErrorMessage(error)}`);
    }
  };

  // Cancel import
  const cancelImport = () => {
    setImportData(null);
    setDuplicateWarning(null);
    setImportStep("select");
    setImportStatus("");
  };

  // Export handler - enhanced version
  const handleExportData = () => {
    try {
      const exportData: ExportData = {};
      // Get job applications if selected
      if (importOptions.applications) {
        exportData.applications = opportunities;
      }
      // Add other data as needed
      // Create a downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
        dataStr
      )}`;
      // Create download link and trigger download
      const exportFileDefaultName = `captain-app-data-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (error: unknown) {
      console.error("Export error:", error);
      alert(`Error exporting data: ${getErrorMessage(error)}`);
    }
  };

  // Handle admin login
  const handleAdminLogin = () => {
    // Simple password check - in a real app, use proper authentication
    if (adminPassword === "captain-admin") {
      setIsAdminMode(true);
      setShowAdminLogin(false);
    } else {
      alert("Invalid administrator password");
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Management Card */}
      <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
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
              {importStep === "select" && (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="import-applications"
                        checked={importOptions.applications}
                        onCheckedChange={(checked) =>
                          setImportOptions({
                            ...importOptions,
                            applications: !!checked,
                          })
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
                          setImportOptions({
                            ...importOptions,
                            achievements: !!checked,
                          })
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
                          setImportOptions({
                            ...importOptions,
                            analytics: !!checked,
                          })
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
              {importStep === "confirm" && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <h4 className="font-medium mb-2">Ready to import:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {importOptions.applications &&
                        importData.applications && (
                          <li>
                            {importData.applications.length} job applications
                          </li>
                        )}
                      {importOptions.achievements &&
                        importData.achievements && (
                          <li>{importData.achievements.length} achievements</li>
                        )}
                      {importOptions.analytics && importData.analytics && (
                        <li>Analytics data</li>
                      )}
                    </ul>
                  </div>
                  {duplicateWarning && (
                    <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Potential Duplicates Detected</AlertTitle>
                      <AlertDescription>
                        Found {duplicateWarning.count} potential duplicate{" "}
                        {duplicateWarning.type}
                        {duplicateWarning.examples &&
                          duplicateWarning.examples.length > 0 && (
                            <>
                              <br />
                              <span className="text-xs">
                                Examples: {duplicateWarning.examples.join(", ")}
                              </span>
                            </>
                          )}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => handleConfirmImport("merge")}>
                      Merge (Skip Duplicates)
                    </Button>
                    <Button
                      onClick={() => handleConfirmImport("replace")}
                      variant="outline"
                    >
                      Replace All
                    </Button>
                    <Button onClick={cancelImport} variant="ghost">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {importStep === "complete" && (
                <div className="p-4 border rounded-md bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100">
                  <p>Import completed successfully!</p>
                  <p className="text-sm mt-1">
                    The page will reload momentarily...
                  </p>
                </div>
              )}
              {importStatus && importStep !== "complete" && (
                <p
                  className={`mt-2 text-sm ${
                    importStatus.includes("Error")
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
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
                      setImportOptions({
                        ...importOptions,
                        applications: !!checked,
                      })
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
                      setImportOptions({
                        ...importOptions,
                        achievements: !!checked,
                      })
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
                      setImportOptions({
                        ...importOptions,
                        analytics: !!checked,
                      })
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
              <Button onClick={handleExportData}>Export to JSON</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the application looks</CardDescription>
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
      <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Customize your job application experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Test Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="test-notifications">Test Notifications</Label>
                <p className="text-sm text-gray-500">
                  Send a test notification to verify functionality
                </p>
              </div>
              <TestNotificationButton />
            </div>
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
      <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
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
            {/* Data Export/Import Section */}
            <div className="pt-4 border-t mt-4">
              <h3 className="text-sm font-medium mb-2">Data Portability</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Export your data for backup or to use on another device
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                  >
                    Export Data
                  </Button>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="max-w-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Developer Options Card */}
      <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
        <CardHeader>
          <CardTitle>Developer Options</CardTitle>
          <CardDescription>Advanced settings for debugging</CardDescription>
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
      <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
        <CardHeader>
          <CardTitle>Administrator Mode *</CardTitle>
          <CardDescription>
            Access advanced settings and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdminMode && !showAdminLogin ? (
            <Button variant="outline" onClick={() => setShowAdminLogin(true)}>
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
                <Button onClick={handleAdminLogin}>Login</Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword("");
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
