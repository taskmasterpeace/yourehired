export const settingsGuide = {
  id: "settings-guide",
  title: "Settings",
  description: "Learn how to configure and customize the application settings",
  sections: [
    {
      id: "settings-overview",
      title: "Settings Overview",
      content: `
        <h2>Settings Overview</h2>
        <p>The Settings tab allows you to customize your experience, manage your data, and configure application preferences. The Settings tab is divided into three main sections:</p>
        <ol>
          <li><strong>Opportunities</strong> - Import and export job opportunities</li>
          <li><strong>Job Recommendations</strong> - Manage job recommendation data</li>
          <li><strong>General Settings</strong> - Configure application-wide settings</li>
        </ol>
        <p>To access Settings, click on the "Settings" tab in the main navigation bar.</p>
      `
    },
    {
      id: "opportunities-settings",
      title: "Opportunities Settings",
      content: `
        <h2>Opportunities Settings</h2>
        <p>The Opportunities section allows you to import and export your job opportunities data.</p>
        
        <h3>Exporting Opportunities</h3>
        <p>To export your job opportunities:</p>
        <ol>
          <li>Navigate to Settings > Opportunities</li>
          <li>In the "Export Opportunities" card, select the job opportunities you want to export
            <ul>
              <li>Use the "Select All" checkbox to quickly select all opportunities</li>
              <li>Or individually select specific opportunities</li>
            </ul>
          </li>
          <li>Click the "Export Selected" button</li>
          <li>A JSON file will be downloaded to your device containing all selected opportunities</li>
        </ol>
        
        <p>This is useful for:</p>
        <ul>
          <li>Creating backups of your job search data</li>
          <li>Transferring your data to another device</li>
          <li>Sharing your job opportunities with others</li>
        </ul>
        
        <h3>Importing Opportunities</h3>
        <p>To import job opportunities:</p>
        <ol>
          <li>Navigate to Settings > Opportunities</li>
          <li>In the "Import Opportunities" card, click "Choose File" or "Browse"</li>
          <li>Select a previously exported JSON file</li>
          <li>Review the preview of opportunities to be imported
            <ul>
              <li>The system will highlight possible duplicates</li>
              <li>Use checkboxes to select which opportunities to import</li>
            </ul>
          </li>
          <li>Click "Import Selected" to add the opportunities to your list</li>
        </ol>
        
        <p><strong>Note:</strong> Imported opportunities will be assigned new IDs to avoid conflicts with existing data.</p>
      `
    },
    {
      id: "job-recommendations-settings",
      title: "Job Recommendations Settings",
      content: `
        <h2>Job Recommendations Settings</h2>
        <p>The Job Recommendations section allows you to manage the job recommendations feature.</p>
        
        <h3>Importing Job Recommendations</h3>
        <p>To import job recommendations from a CSV file:</p>
        <ol>
          <li>Navigate to Settings > Job Recommendations</li>
          <li>In the "Import Job Recommendations" card, click "Choose File" or "Browse"</li>
          <li>Select a CSV file containing job recommendations
            <ul>
              <li>The CSV should include columns for company, position, location, and description</li>
              <li>Additional fields like salary, URL, and source are also supported</li>
            </ul>
          </li>
          <li>Review the preview of recommendations</li>
          <li>Click "Import Recommendations" to add them to your recommendations list</li>
        </ol>
        
        <p>These recommendations will appear in the Coach tab for you to review and rate.</p>
        
        <h3>Exporting Rated Recommendations</h3>
        <p>After you've rated job recommendations (interested, not interested, or skipped), you can export this data:</p>
        <ol>
          <li>Navigate to Settings > Job Recommendations</li>
          <li>In the "Export Rated Recommendations" card, click "Export Ratings"</li>
          <li>A CSV file will be downloaded containing all your rated recommendations</li>
        </ol>
        
        <p>This export is useful for:</p>
        <ul>
          <li>Analyzing your job preferences</li>
          <li>Sharing your interests with a career coach</li>
          <li>Creating a backup of your ratings</li>
        </ul>
      `
    },
    {
      id: "general-settings",
      title: "General Settings",
      content: `
        <h2>General Settings</h2>
        <p>The General Settings section allows you to configure application-wide preferences.</p>
        
        <h3>Dark Mode</h3>
        <p>Toggle between light and dark themes:</p>
        <ol>
          <li>Navigate to Settings > General Settings</li>
          <li>Find the "Dark Mode" toggle</li>
          <li>Switch it on for dark mode or off for light mode</li>
        </ol>
        
        <p>The change will apply immediately across the entire application.</p>
        
        <h3>Debug Panel</h3>
        <p>The Debug Panel is a developer tool that provides technical information about the application state:</p>
        <ol>
          <li>Navigate to Settings > General Settings</li>
          <li>Find the "Debug Panel" toggle</li>
          <li>Switch it on to show the debug panel</li>
        </ol>
        
        <h4>Using the Debug Panel</h4>
        <p>When enabled, the Debug Panel appears at the bottom of the screen and provides:</p>
        
        <p><strong>State Tab:</strong></p>
        <ul>
          <li>View current state variables like selected opportunity index, active tab, and counts</li>
          <li>See detailed information about the currently selected opportunity</li>
          <li>Monitor job recommendations statistics</li>
        </ul>
        
        <p><strong>Props Tab:</strong></p>
        <ul>
          <li>View component props (primarily for nested components)</li>
        </ul>
        
        <p><strong>Performance Tab:</strong></p>
        <ul>
          <li>Check local storage usage statistics</li>
          <li>Access debugging actions:
            <ul>
              <li>"Log State" - Outputs the current application state to the browser console</li>
              <li>"Clear Storage" - Removes all application data from local storage (requires page refresh)</li>
            </ul>
          </li>
        </ul>
        
        <p>The Debug Panel is particularly useful for:</p>
        <ul>
          <li>Troubleshooting issues</li>
          <li>Understanding the application's internal state</li>
          <li>Monitoring performance metrics</li>
          <li>Clearing data when needed</li>
        </ul>
        
        <p><strong>Note:</strong> The Debug Panel is intended for development and troubleshooting purposes. It's not needed for normal application use.</p>
      `
    }
  ]
};
