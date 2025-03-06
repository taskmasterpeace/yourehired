import React from 'react';
import { Settings, FileText, MessageSquare, BarChart, Calendar, User } from 'lucide-react';

export const allGuides = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of using the application",
    icon: <FileText className="h-5 w-5" />,
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content: `
## Welcome to You're Hired!

You're Hired! is a comprehensive job application tracking system designed to help you organize your job search, prepare for interviews, and land your dream job.

This guide will help you get started with the basic features of the application.
        `
      },
      {
        id: "navigation",
        title: "Navigation",
        content: `
## Navigating the Application

The application is divided into several tabs:

1. **Opportunities** - Track and manage your job applications
2. **Master Resume** - Maintain your master resume template
3. **Coach** - Get AI-powered advice for your job search
4. **Analytics** - View statistics and insights about your job search
5. **Calendar** - Manage interviews and important dates
6. **Settings** - Configure application preferences
7. **Help** - Access guides and documentation

Use the navigation bar at the top to switch between these sections.
        `
      }
    ]
  },
  {
    id: "opportunities-guide",
    title: "Managing Opportunities",
    description: "Learn how to track and manage job applications",
    icon: <FileText className="h-5 w-5" />,
    sections: [
      {
        id: "adding-opportunities",
        title: "Adding Opportunities",
        content: `
## Adding Job Opportunities

To add a new job opportunity:

1. Navigate to the Opportunities tab
2. Click the "Add New Opportunity" button
3. Fill in the details about the job:
   - Company name
   - Position title
   - Job description
   - Status
   - Date
   - Additional details like location, salary, etc.
4. Click "Save Opportunity"

The new opportunity will appear in your list of job applications.
        `
      }
    ]
  },
  {
    id: "coach-guide",
    title: "Using the Coach",
    description: "Get the most out of the AI career coach",
    icon: <MessageSquare className="h-5 w-5" />,
    sections: [
      {
        id: "coach-overview",
        title: "Coach Overview",
        content: `
## AI Career Coach

The Coach feature provides AI-powered guidance for your job search. You can:

1. Chat with the AI about your job search strategy
2. Get help tailoring your resume for specific positions
3. Prepare for interviews with practice questions
4. Receive feedback on your application materials
        `
      }
    ]
  },
  {
    id: "analytics-guide",
    title: "Understanding Analytics",
    description: "Learn how to interpret your job search data",
    icon: <BarChart className="h-5 w-5" />,
    sections: [
      {
        id: "analytics-overview",
        title: "Analytics Overview",
        content: `
## Job Search Analytics

The Analytics dashboard provides insights into your job search progress:

1. **Application Status** - See the distribution of your applications by status
2. **Timeline** - Track your application volume over time
3. **Key Metrics** - Monitor important statistics like response rate and interview rate
4. **Achievements** - Unlock badges by reaching job search milestones
        `
      }
    ]
  },
  {
    id: "calendar-guide",
    title: "Using the Calendar",
    description: "Manage your job search schedule effectively",
    icon: <Calendar className="h-5 w-5" />,
    sections: [
      {
        id: "calendar-overview",
        title: "Calendar Overview",
        content: `
## Job Search Calendar

The Calendar feature helps you keep track of important dates:

1. **Interviews** - Schedule and prepare for upcoming interviews
2. **Follow-ups** - Set reminders to follow up on applications
3. **Deadlines** - Track application deadlines and offer decision dates
4. **Assessments** - Manage technical assessments and coding challenges
        `
      }
    ]
  },
  {
    id: "settings-guide",
    title: "Settings Guide",
    description: "Learn how to configure and customize the application settings",
    icon: <Settings className="h-5 w-5" />,
    sections: [
      {
        id: "settings-overview",
        title: "Settings Overview",
        content: `
## Settings Overview

The Settings tab allows you to customize your experience, manage your data, and configure application preferences. The Settings tab is divided into three main sections:

1. **Opportunities** - Import and export job opportunities
2. **Job Recommendations** - Manage job recommendation data
3. **General Settings** - Configure application-wide settings

To access Settings, click on the "Settings" tab in the main navigation bar.
        `
      },
      {
        id: "opportunities-settings",
        title: "Opportunities Settings",
        content: `
## Opportunities Settings

The Opportunities section allows you to import and export your job opportunities data.

### Exporting Opportunities

To export your job opportunities:

1. Navigate to Settings > Opportunities
2. In the "Export Opportunities" card, select the job opportunities you want to export
   - Use the "Select All" checkbox to quickly select all opportunities
   - Or individually select specific opportunities
3. Click the "Export Selected" button
4. A JSON file will be downloaded to your device containing all selected opportunities

This is useful for:
- Creating backups of your job search data
- Transferring your data to another device
- Sharing your job opportunities with others

### Importing Opportunities

To import job opportunities:

1. Navigate to Settings > Opportunities
2. In the "Import Opportunities" card, click "Choose File" or "Browse"
3. Select a previously exported JSON file
4. Review the preview of opportunities to be imported
   - The system will highlight possible duplicates
   - Use checkboxes to select which opportunities to import
5. Click "Import Selected" to add the opportunities to your list

**Note:** Imported opportunities will be assigned new IDs to avoid conflicts with existing data.
        `
      },
      {
        id: "job-recommendations-settings",
        title: "Job Recommendations Settings",
        content: `
## Job Recommendations Settings

The Job Recommendations section allows you to manage the job recommendations feature.

### Importing Job Recommendations

To import job recommendations from a CSV file:

1. Navigate to Settings > Job Recommendations
2. In the "Import Job Recommendations" card, click "Choose File" or "Browse"
3. Select a CSV file containing job recommendations
   - The CSV should include columns for company, position, location, and description
   - Additional fields like salary, URL, and source are also supported
4. Review the preview of recommendations
5. Click "Import Recommendations" to add them to your recommendations list

These recommendations will appear in the Coach tab for you to review and rate.

### Exporting Rated Recommendations

After you've rated job recommendations (interested, not interested, or skipped), you can export this data:

1. Navigate to Settings > Job Recommendations
2. In the "Export Rated Recommendations" card, click "Export Ratings"
3. A CSV file will be downloaded containing all your rated recommendations

This export is useful for:
- Analyzing your job preferences
- Sharing your interests with a career coach
- Creating a backup of your ratings
        `
      },
      {
        id: "general-settings",
        title: "General Settings",
        content: `
## General Settings

The General Settings section allows you to configure application-wide preferences.

### Dark Mode

Toggle between light and dark themes:

1. Navigate to Settings > General Settings
2. Find the "Dark Mode" toggle
3. Switch it on for dark mode or off for light mode

The change will apply immediately across the entire application.

### Debug Panel

The Debug Panel is a developer tool that provides technical information about the application state:

1. Navigate to Settings > General Settings
2. Find the "Debug Panel" toggle
3. Switch it on to show the debug panel

#### Using the Debug Panel

When enabled, the Debug Panel appears at the bottom of the screen and provides:

**State Tab:**
- View current state variables like selected opportunity index, active tab, and counts
- See detailed information about the currently selected opportunity
- Monitor job recommendations statistics

**Props Tab:**
- View component props (primarily for nested components)

**Performance Tab:**
- Check local storage usage statistics
- Access debugging actions:
  - "Log State" - Outputs the current application state to the browser console
  - "Clear Storage" - Removes all application data from local storage (requires page refresh)

The Debug Panel is particularly useful for:
- Troubleshooting issues
- Understanding the application's internal state
- Monitoring performance metrics
- Clearing data when needed

**Note:** The Debug Panel is intended for development and troubleshooting purposes. It's not needed for normal application use.
        `
      }
    ]
  },
  {
    id: "profile-guide",
    title: "Managing Your Profile",
    description: "Learn how to update and manage your user profile",
    icon: <User className="h-5 w-5" />,
    sections: [
      {
        id: "profile-overview",
        title: "Profile Overview",
        content: `
## User Profile

The Profile section allows you to manage your personal information and preferences.

This guide will help you understand how to update your profile, manage your account settings, and customize your experience.
        `
      }
    ]
  }
];
