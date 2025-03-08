export const allGuides = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using You\'re Hired!',
    icon: '🚀',
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        content: `
          <p>Welcome to <strong>You're Hired!</strong> - your all-in-one job application tracking system.</p>
          <p>This guide will help you get started with the basic features and functionality.</p>
          <h3>What You Can Do</h3>
          <ul>
            <li>Track all your job applications in one place</li>
            <li>Manage your resume and customize it for each application</li>
            <li>Get AI-powered insights and suggestions</li>
            <li>Track important dates and events</li>
            <li>Analyze your job search progress</li>
          </ul>
        `
      },
      {
        id: 'adding-jobs',
        title: 'Adding Job Opportunities',
        content: `
          <p>To add a new job opportunity:</p>
          <ol>
            <li>Go to the <strong>Opportunities</strong> tab</li>
            <li>Click the <strong>Add Job</strong> button</li>
            <li>Fill in the details about the position</li>
            <li>Click <strong>Add Job</strong> to save</li>
          </ol>
          <p>You can add as many details as you have available, and update them later as you progress through the application process.</p>
        `
      },
      {
        id: 'tracking-status',
        title: 'Tracking Application Status',
        content: `
          <p>Each job opportunity can be assigned a status to track your progress:</p>
          <ul>
            <li><strong>Interested</strong> - Jobs you're considering applying to</li>
            <li><strong>Applied</strong> - Applications you've submitted</li>
            <li><strong>Interview</strong> - Jobs where you've been invited to interview</li>
            <li><strong>Offer</strong> - Positions where you've received an offer</li>
            <li><strong>Rejected</strong> - Applications that weren't successful</li>
          </ul>
          <p>To update a job's status, select it from the list and use the status dropdown in the header.</p>
        `
      }
    ]
  },
  {
    id: 'resume-management',
    title: 'Resume Management',
    description: 'Learn how to manage and customize your resume',
    icon: '📄',
    sections: [
      {
        id: 'master-resume',
        title: 'Master Resume',
        content: `
          <p>The <strong>Master Resume</strong> tab allows you to maintain your base resume that will be used as a template for all job applications.</p>
          <p>This is where you should keep your most complete and up-to-date resume information.</p>
        `
      },
      {
        id: 'customizing',
        title: 'Customizing for Each Application',
        content: `
          <p>For each job opportunity, you can customize your resume to highlight relevant skills and experience:</p>
          <ol>
            <li>Select a job from the Opportunities list</li>
            <li>Click the <strong>Resume</strong> tab</li>
            <li>Edit the resume to tailor it for this specific position</li>
          </ol>
          <p>By default, changes to individual resumes will also update your master resume. If you want to make changes that only apply to a specific application, toggle the "Synced with Master" switch to "Frozen".</p>
        `
      }
    ]
  },
  {
    id: 'ai-features',
    title: 'AI Assistant Features',
    description: 'Get the most out of the AI assistant',
    icon: '🤖',
    sections: [
      {
        id: 'chat-assistant',
        title: 'Chat Assistant',
        content: `
          <p>Each job opportunity has an AI assistant that can help you with various aspects of your application:</p>
          <ul>
            <li>Analyzing job descriptions</li>
            <li>Suggesting resume improvements</li>
            <li>Preparing for interviews</li>
            <li>Drafting follow-up emails</li>
          </ul>
          <p>To use the assistant, select a job and go to the <strong>AI Assistant</strong> tab.</p>
        `
      },
      {
        id: 'suggested-prompts',
        title: 'Using Suggested Prompts',
        content: `
          <p>The AI assistant provides suggested prompts based on your application's current status. These prompts are designed to help you with the most relevant tasks for each stage of the application process.</p>
          <p>You can also ask your own questions or request specific help with any aspect of your job application.</p>
        `
      }
    ]
  },
  {
    id: 'tags-keywords',
    title: 'Tags & Keywords',
    description: 'Organize with tags and analyze keywords',
    icon: '🏷️',
    sections: [
      {
        id: 'tags-feature',
        title: 'Using Tags',
        content: `
          <p>Tags help you organize and categorize your job opportunities:</p>
          <ul>
            <li>Add tags to highlight important aspects of each opportunity</li>
            <li>Use consistent tag colors for different categories</li>
            <li>Filter and search by tags to find relevant opportunities</li>
          </ul>
          <p>To add tags, select a job and use the Tags section in the Details tab.</p>
        `
      },
      {
        id: 'keywords-feature',
        title: 'Skills Gap Analyzer',
        content: `
          <p>The Skills Gap Analyzer helps you identify how well your resume matches the job requirements:</p>
          <ul>
            <li>Extract key skills and requirements from job descriptions</li>
            <li>See which skills are present in your resume and which are missing</li>
            <li>Get suggestions for improving your resume</li>
            <li>Track your skills match percentage</li>
          </ul>
          <p>To use this feature, select a job and look for the Skills Gap Analyzer section in the Details tab.</p>
        `
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    description: 'Track your job search progress',
    icon: '📊',
    sections: [
      {
        id: 'application-metrics',
        title: 'Application Metrics',
        content: `
          <p>The Analytics tab provides valuable insights into your job search:</p>
          <ul>
            <li>Total applications submitted</li>
            <li>Response rate from employers</li>
            <li>Interview conversion rate</li>
            <li>Distribution of applications by status</li>
            <li>Application timeline</li>
          </ul>
          <p>Use these metrics to understand your progress and identify areas for improvement.</p>
        `
      },
      {
        id: 'job-search-insights',
        title: 'Job Search Insights',
        content: `
          <p>Based on your application data, the system generates insights to help optimize your job search strategy:</p>
          <ul>
            <li>Which types of companies respond better to your applications</li>
            <li>Optimal application volume</li>
            <li>Most active days of the week</li>
            <li>Suggestions for improving your response rate</li>
          </ul>
        `
      }
    ]
  }
];
