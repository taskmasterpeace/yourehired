export const guides = {
  "tags-keywords": {
    id: "tags-keywords",
    title: "Tags & Keywords Guide",
    description: "Learn how to use tags and keywords to organize opportunities and optimize your resume",
    sections: [
      {
        id: "tags-feature",
        title: "Tags Feature",
        content: `
          <p>Tags help you organize and categorize your job opportunities. You can use tags to mark opportunities by industry, location, priority, or any other category that's useful for your job search.</p>
          
          <h3>How to Use Tags</h3>
          <ul>
            <li>Create custom tags that are meaningful to your job search</li>
            <li>Apply multiple tags to each opportunity</li>
            <li>Filter your opportunities list using tags</li>
            <li>Color-code tags for visual organization</li>
          </ul>
          
          <h3>Best Practices</h3>
          <p>Keep your tagging system consistent and don't create too many tags. Focus on categories that help you prioritize and organize effectively.</p>
        `
      },
      {
        id: "tag-best-practices",
        title: "Tag Best Practices",
        content: `
          <p>Follow these best practices to make the most of the tagging system:</p>
          
          <ul>
            <li>Use a consistent naming convention</li>
            <li>Create priority tags like "High Interest" or "Follow Up"</li>
            <li>Use location tags if you're applying in multiple regions</li>
            <li>Tag opportunities by industry or role type</li>
            <li>Regularly review and clean up unused tags</li>
          </ul>
          
          <p>Example tag categories:</p>
          <ul>
            <li><strong>Industry:</strong> "Finance," "Healthcare," "Tech"</li>
            <li><strong>Role type:</strong> "Remote," "Hybrid," "On-site"</li>
            <li><strong>Application effort:</strong> "Quick Apply," "Custom Resume"</li>
            <li><strong>Personal interest:</strong> "High Priority," "Dream Company"</li>
          </ul>
        `
      },
      {
        id: "keywords-feature",
        title: "Keywords Feature",
        content: `
          <p>Keywords are automatically extracted from job descriptions and help you optimize your resume for each application.</p>
          
          <h3>How Keywords Work</h3>
          <ul>
            <li>The system analyzes job descriptions to identify important keywords</li>
            <li>Keywords are ranked by importance and frequency</li>
            <li>Your resume is scanned to determine keyword matches</li>
            <li>Suggestions are provided to improve your keyword match rate</li>
          </ul>
          
          <h3>Why Keywords Matter</h3>
          <p>Many companies use Applicant Tracking Systems (ATS) that scan resumes for relevant keywords. A higher keyword match rate increases your chances of getting past these automated systems.</p>
        `
      },
      {
        id: "keyword-optimization",
        title: "Keyword Optimization Tips",
        content: `
          <p>Here's how to optimize your resume for better keyword matching:</p>
          
          <ul>
            <li>Include exact phrases from the job description</li>
            <li>Incorporate industry-specific terminology</li>
            <li>Add relevant technical skills and tools</li>
            <li>Use both spelled-out terms and acronyms (e.g., "Project Management" and "PM")</li>
            <li>Place important keywords in section headings</li>
            <li>Aim for a keyword match score of at least 70%</li>
          </ul>
          
          <p>Remember to keep your resume readable and natural. Don't just stuff it with keywords at the expense of clarity.</p>
        `
      }
    ]
  },
  // You can add more guides here in the future
};

// Helper function to get a guide by ID
export const getGuideById = (guideId: string) => {
  return guides[guideId as keyof typeof guides] || null;
};

// Helper function to get a section by ID within a guide
export const getSectionById = (guideId: string, sectionId: string) => {
  const guide = getGuideById(guideId);
  if (!guide) return null;
  
  return guide.sections.find(section => section.id === sectionId) || null;
};
