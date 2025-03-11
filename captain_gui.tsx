"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Textarea } from "./components/ui/textarea"
import { QRCodeSVG } from 'qrcode.react'
import { Label } from "./components/ui/label"
import { Checkbox } from "./components/ui/checkbox"
import { useAuth } from './context/auth-context'
// Force reload - using correct paths for root location
import { AuthModal } from './components/auth/AuthModal'
import { ResumeTab } from './components/tabs/ResumeTab'
import { CaptainTab } from './components/tabs/CaptainTab'
import { CalendarTab } from './components/tabs/CalendarTab'
import { AnalyticsTab } from './components/tabs/AnalyticsTab'
import { SettingsTab } from './components/tabs/SettingsTab'
import { HelpTab } from './components/tabs/HelpTab'
import { OpportunitiesTab } from './components/tabs/OpportunitiesTab'
// Import opportunity detail sections if the file exists
// import { JobDetailsSection, ContactInfoSection, NotesSection } from './components/opportunity/OpportunityDetailSections'
import { OpportunityDetails } from './components/opportunities/OpportunityDetails'
import { OpportunityList } from './components/opportunities/OpportunityList'
import { useDarkMode } from './hooks/useDarkMode'
import AddToCalendarButton from './AddToCalendarButton'
import { generateICalString } from './calendarUtils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "./components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Calendar } from "./components/ui/calendar"
import { Badge } from "./components/ui/badge"
import { ScrollArea } from "./components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./components/ui/dialog"
import { Switch } from "./components/ui/switch"
import { ThumbsUp, ThumbsDown, PlusCircle, Search, CalendarIcon, BarChart, Send, User, Bot, FileText, MessageSquare, Lock, Unlock, Maximize2, Minimize2, ChevronLeft, ChevronRight, Filter, Menu, ArrowUp, HelpCircle, Settings } from 'lucide-react'
import { BarChartIcon, PieChartIcon, LineChartIcon, ActivityIcon, Trophy, Award, Flame, Rocket, Users, Building, Home, Lightbulb, Calendar as CalendarIcon2 } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area } from 'recharts'
import { generateChatResponse, generateSuggestions } from './lib/openai'
import { HelpCenter } from './components/help/HelpCenter'
import { GuideViewer } from './components/help/GuideViewer'
import { allGuides } from './components/help/guides'
import { useAppState } from './context/context'
import { Opportunity } from './context/types'
import { format, parseISO, isEqual, isSameDay } from 'date-fns'
import { Sheet, SheetContent, SheetTrigger } from "./components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible"
import { motion } from "framer-motion" // For animations


// Define prompts by status and category
const promptsByStatus = {
  // Initial Contact Category
  "Bookmarked": [
    "Analyze this job description and identify my top 3 matching qualifications and 2 areas I should strengthen before applying",
    "Create a detailed research plan for this company covering their culture, recent news, competitors, and growth trajectory",
    "Based on this job description, what unique skills from my resume would make me stand out from typical applicants?",
    "What industry-specific trends and technologies should I be familiar with before applying to this position?"
  ],
  "Interested": [
    "Extract the top 10 keywords from this job description that I should strategically incorporate in my resume and cover letter",
    "Based on my experience, what 3-5 compelling achievements should I emphasize for this role to demonstrate my value?",
    "Generate 5 tailored questions I should research about this company that will demonstrate my genuine interest",
    "How does my career trajectory align with this role, and how should I frame this narrative in my application materials?"
  ],
  "Recruiter Contact": [
    "Draft a professional response to the recruiter that highlights my interest, qualifications, and availability for next steps",
    "What 7 specific questions should I ask the recruiter about this role, team culture, and hiring process?",
    "Help me prepare a concise 2-minute introduction for an initial screening call that highlights my relevant experience",
    "What salary research should I conduct for this specific role and location before discussing compensation expectations?"
  ],
  "Networking": [
    "Draft a personalized LinkedIn connection message to an employee at this company that mentions our common interests",
    "Prepare 8 thoughtful questions for an informational interview that will provide insights about the company culture",
    "How can I leverage my existing network to get a warm introduction to someone at this company?",
    "Create a follow-up thank you message after a networking conversation that maintains the relationship"
  ],
  // Application Category
  "Preparing Application": [
    "Rewrite my resume summary and key bullet points to directly address the requirements in this job description",
    "Draft a compelling cover letter that tells a story about why I'm passionate about this role and company",
    "What specific portfolio pieces or work samples should I prepare to showcase that align with this job's requirements?",
    "Help me craft honest but effective responses to address the 2-3 qualification gaps in my application materials"
  ],
  "Applied": [
    "Create a strategic follow-up plan with specific timing and communication templates for this application",
    "Help me prepare a 30-second elevator pitch that clearly articulates why I'm the ideal candidate for this role",
    "Draft a follow-up email to send in 14 days that adds value and demonstrates my continued interest",
    "What company-specific research should I conduct now to prepare for a potential interview opportunity?"
  ],
  "Application Acknowledged": [
    "Draft a brief but professional response thanking them for acknowledging my application",
    "Create a preparation checklist of things I should do while waiting to hear back about next steps",
    "What is the appropriate timeline for following up on my application status based on this company's size?",
    "Help me research this company's typical interview process based on employee reviews and Glassdoor information"
  ],
  // Interview Process Category
  "Screening": [
    "Prepare concise answers for the 10 most common screening questions for this type of role",
    "Create a preparation checklist for a phone screening interview including environment, materials, and talking points",
    "Draft a compelling 90-second response to 'Tell me about yourself' that highlights my relevant experience",
    "What 5 thoughtful questions should I ask during a screening interview that demonstrate my research and interest?"
  ],
  "Technical Assessment": [
    "Based on the job description, what specific technical skills will likely be tested and how should I prepare for each?",
    "Create a 7-day study plan to prepare for this technical assessment based on the job requirements",
    "What are the 5 most common mistakes candidates make during this type of technical assessment and how can I avoid them?",
    "Help me develop a time management strategy for completing this technical assessment efficiently and accurately"
  ],
  "First Interview": [
    "Prepare STAR method responses for the 8 most likely behavioral questions based on this job description",
    "What company and team research should I conduct to demonstrate my genuine interest during this interview?",
    "Draft 3 powerful stories that demonstrate how my experience directly addresses their key requirements",
    "What 5 thoughtful questions should I ask at the end of my interview that demonstrate my strategic thinking?"
  ],
  "Second Interview": [
    "How should I adjust my interview approach for a second interview compared to what I presented in the first round?",
    "Prepare 5 in-depth questions about the team structure, projects, and day-to-day responsibilities",
    "Help me craft a diplomatic response if asked about salary expectations during this round",
    "What specific work examples or case studies should I prepare to discuss in more detail during this interview?"
  ],
  "Final Interview": [
    "How should I prepare differently for a final interview with C-level or senior leadership?",
    "Draft 5 strategic questions about the company vision and how my role contributes to broader objectives",
    "Help me prepare to discuss my compensation expectations with specific numbers and negotiation points",
    "Create a compelling closing statement that reinforces why I'm the ideal candidate and my enthusiasm for the role"
  ],
  "Reference Check": [
    "Create a briefing document to prepare my references with key points about this role and my relevant accomplishments",
    "What specific information should I provide to each reference about this position and company?",
    "Draft an email template to send to my references with details about this position and what to expect",
    "What does the reference check stage typically indicate about my candidacy, and how should I prepare for next steps?"
  ],
  // Decision Category
  "Negotiating": [
    "Based on market research for this role and location, what specific salary range should I target in negotiations?",
    "Beyond base salary, what 5 benefits should I prioritize negotiating based on their value and this company's offerings?",
    "Draft a professional counter-offer email that maintains positive relations while advocating for my value",
    "What data points and accomplishments should I reference to justify my compensation requests?"
  ],
  "Offer Received": [
    "Create a comprehensive list of questions to fully understand all components of this compensation package",
    "Help me evaluate this offer against my career goals, market value, and other opportunities using a decision matrix",
    "Draft a professional email requesting additional time to consider the offer (1-2 weeks)",
    "What specific clarification should I seek about benefits, equity, bonus structure, and advancement opportunities?"
  ],
  "Offer Accepted": [
    "Create a detailed checklist of things to do before my start date to ensure a smooth transition",
    "Draft a graceful resignation letter for my current employer that maintains positive relationships",
    "What specific questions should I ask HR about onboarding, paperwork, and first-day logistics?",
    "Help me develop a strategic 30/60/90 day plan to make a strong impression in this new position"
  ],
  "Offer Declined": [
    "Draft a professional email declining the offer while expressing gratitude and maintaining the relationship",
    "What constructive feedback should I provide when declining this offer that would be helpful but not burning bridges?",
    "Help me craft language that keeps the door open for future opportunities with this company",
    "What specific lessons should I document from this process to improve my job search strategy going forward?"
  ],
  "Rejected": [
    "What specific aspects of my application or interview performance should I evaluate to improve future applications?",
    "Draft a professional email requesting constructive feedback that might help me grow professionally",
    "Based on this rejection, should I apply to other positions at this company? If so, what approach should I take?",
    "Create a personal development plan to address potential skill gaps highlighted by this rejection"
  ],
  "Withdrawn": [
    "Draft a professional email withdrawing my application that maintains a positive relationship",
    "What networking follow-up would be appropriate to maintain connections with people I met during this process?",
    "Help me document specific insights from this experience to refine my job search criteria",
    "What constructive feedback could I provide about why I'm withdrawing that would be helpful to the company?"
  ],
  "Position Filled": [
    "Draft a follow-up message congratulating the hiring manager and expressing continued interest in future opportunities",
    "What specific lessons can I apply from this experience to improve my applications for similar roles?",
    "Create a strategy for maintaining connection with the hiring manager on LinkedIn despite not getting the role",
    "Based on my interest in this position, what 5 similar companies should I target in my continued search?"
  ],
  "Position Cancelled": [
    "What might this cancellation indicate about the company's stability or priorities that could inform my job search?",
    "Draft a brief message expressing continued interest in future opportunities despite the cancellation",
    "Based on this role's requirements, what 5 similar positions should I look for in my continued search?",
    "How should I adjust my job search strategy based on this experience to focus on more stable opportunities?"
  ],
  // Follow-up Category
  "Following Up": [
    "Draft a value-adding follow-up email that shares an interesting industry article relevant to our conversation",
    "What is the appropriate timing for following up after each specific interview stage (screening, technical, etc.)?",
    "Help me craft a follow-up message that demonstrates continued interest without seeming desperate",
    "What specific work sample or additional information could I provide in my follow-up to strengthen my candidacy?"
  ],
  "Waiting": [
    "Create a productive daily routine to maintain momentum in my job search while waiting to hear back",
    "Based on this company's size and hiring process, when would be the appropriate time to send a follow-up?",
    "Draft a brief check-in email that's professional and adds value while demonstrating continued interest",
    "What parallel opportunities should I pursue while waiting to hear back about this position?"
  ]
};

const promptsByCategory = {
  "Initial Contact": [
    "Analyze this company's stated values and culture, and help me align my experience with their specific mission",
    "Create a competitive analysis of how my qualifications compare to the likely candidate pool for this position",
    "What specialized knowledge, certifications, or training would give me a competitive edge for this specific role?",
    "Based on this company's size, industry, and recent news, what business challenges could I help them solve?"
  ],
  "Application": [
    "Transform my resume to explicitly match this job description while highlighting my unique value proposition",
    "Create a compelling cover letter that tells a story connecting my specific experience to their stated needs",
    "Help me quantify my achievements with metrics that would be most impressive for this particular industry",
    "Identify the 5 most relevant projects from my experience that directly address their key requirements"
  ],
  "Interview Process": [
    "Based on this job description, prepare me for the 10 most likely technical questions I'll face in the interview",
    "Help me structure powerful STAR method answers for behavioral questions specific to this role's challenges",
    "What company-specific research would demonstrate exceptional preparation to my interviewers?",
    "Craft a compelling narrative about my career path that positions this specific role as my ideal next step"
  ],
  "Decision": [
    "Create a comprehensive decision matrix to evaluate this opportunity against my career goals and other options",
    "Based on industry standards and this company's size, what specific compensation package should I target?",
    "What strategic questions should I ask to understand the growth trajectory and advancement opportunities?",
    "Help me objectively analyze the pros and cons of this offer compared to my current situation"
  ],
  "Follow-up": [
    "What specific value-adding content related to their business challenges could I include in follow-up communications?",
    "Create a relationship-building strategy to maintain connections with this company regardless of the outcome",
    "Draft a check-in email that demonstrates my continued interest while sharing relevant industry insights",
    "What is the appropriate cadence for following up at each stage of this company's specific hiring process?"
  ]
};

// Define chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const STATUS_COLORS = {
  "Bookmarked": "#9333ea",
  "Interested": "#3b82f6",
  "Recruiter Contact": "#06b6d4",
  "Networking": "#0ea5e9",
  "Preparing Application": "#10b981",
  "Applied": "#22c55e",
  "Application Acknowledged": "#84cc16",
  "Screening": "#eab308",
  "Technical Assessment": "#f59e0b",
  "First Interview": "#f97316",
  "Second Interview": "#ef4444",
  "Final Interview": "#dc2626",
  "Reference Check": "#9f1239",
  "Negotiating": "#7c3aed",
  "Offer Received": "#6366f1",
  "Offer Accepted": "#14b8a6",
  "Offer Declined": "#f43f5e",
  "Rejected": "#64748b",
  "Withdrawn": "#94a3b8",
  "Position Filled": "#6b7280",
  "Position Cancelled": "#4b5563",
  "Following Up": "#8b5cf6",
  "Waiting": "#a855f7"
};

// Configuration for tag colors
const TAG_COLOR_CLASSES = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    hover: "hover:bg-blue-200"
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    hover: "hover:bg-red-200"
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    hover: "hover:bg-green-200"
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-200",
    hover: "hover:bg-purple-200"
  },
  yellow: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    hover: "hover:bg-yellow-200"
  },
  gray: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
    hover: "hover:bg-gray-200"
  }
};

// Protected content wrapper component
const ProtectedContent = ({ 
  children, 
  fallback = <div className="p-4 text-center">Please sign in to access this feature</div> 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  
  if (!user) {
    return fallback;
  }
  
  return <>{children}</>;
};

export default function CAPTAINGui() {
  const { state, dispatch } = useAppState();
  const { opportunities, masterResume, events, chatMessages } = state;
  const { user, signOut, isLoading: authLoading, loadUserData, saveUserData, localStorageOnly, setLocalStorageOnly } = useAuth();
  const [showStorageOptionsDialog, setShowStorageOptionsDialog] = useState(false);
  
  const [isClientSide, setIsClientSide] = useState(false);
  
  // Load user data when user logs in
  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        try {
          const userData = await loadUserData();
          
          // Update app state with user data
          if (userData.opportunities && userData.opportunities.length > 0) {
            dispatch({ type: 'SET_OPPORTUNITIES', payload: userData.opportunities });
          }
          
          if (userData.resume) {
            dispatch({ type: 'UPDATE_MASTER_RESUME', payload: userData.resume });
          }
          
          if (userData.events && userData.events.length > 0) {
            dispatch({ type: 'SET_EVENTS', payload: userData.events });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    }
    
    fetchUserData();
  }, [user]);
  
  // Save user data when it changes
  useEffect(() => {
    async function persistUserData() {
      if (user) {
        try {
          await saveUserData({
            opportunities,
            resume: masterResume,
            events
          });
        } catch (error) {
          console.error('Error saving user data:', error);
        }
      }
    }
    
    // Debounce to avoid too many saves
    const timeoutId = setTimeout(persistUserData, 1000);
    return () => clearTimeout(timeoutId);
  }, [opportunities, masterResume, events, user]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("opportunities");
  const [helpView, setHelpView] = useState<{ active: boolean; guideId?: string; sectionId?: string }>({ active: false });
  
  
  // Set client-side flag after initial render
  useEffect(() => {
    setIsClientSide(true);
  }, []);
  
  // Show welcome message when user logs in
  useEffect(() => {
    if (user && !localStorage.getItem('welcomed')) {
      // Set a flag to avoid showing the welcome message repeatedly
      localStorage.setItem('welcomed', 'true');
      
      // Show welcome message
      alert(`Welcome, ${user.email}! Your account is now connected.`);
    }
    
    // Show storage options explanation for first-time users
    if (user && !localStorage.getItem('storageOptionsExplained')) {
      setShowStorageOptionsDialog(true);
      localStorage.setItem('storageOptionsExplained', 'true');
    }
  }, [user]);
  const [selectedOpportunityIndex, setSelectedOpportunityIndex] = useState(0);
  const [isMasterResumeFrozen, setIsMasterResumeFrozen] = useState(false);
  const [isEditingJobDescription, setIsEditingJobDescription] = useState(false);
  const [editedJobDescription, setEditedJobDescription] = useState("");
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editedDate, setEditedDate] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [lastModifiedTimestamps, setLastModifiedTimestamps] = useState({});
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] = useState(false);
  
  // Import/Export state variables
  const [selectedExportIds, setSelectedExportIds] = useState<number[]>([]);
  const [importData, setImportData] = useState<Opportunity[]>([]);
  const [selectedImportIds, setSelectedImportIds] = useState<number[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  
  // New state variables for editing job details, contact info, and notes
  const [isEditingJobDetails, setIsEditingJobDetails] = useState(false);
  const [isEditingContactInfo, setIsEditingContactInfo] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedJobDetails, setEditedJobDetails] = useState({
    location: "",
    salary: "",
    applicationUrl: "",
    source: ""
  });
  const [editedContactInfo, setEditedContactInfo] = useState({
    recruiterName: "",
    recruiterEmail: "",
    recruiterPhone: ""
  });
  const [editedNotes, setEditedNotes] = useState("");
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [viewMode, setViewMode] = useState("card"); // "card" or "list"
  
  // Sorting states
  const [sortBy, setSortBy] = useState("lastModified");
  const [sortDirection, setSortDirection] = useState("desc"); // "asc" or "desc"

  // New state for calendar event creation
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0],
    type: "interview",
    opportunityId: "",
    notes: ""
  });

  // Batch selection states
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [isBatchSelectMode, setIsBatchSelectMode] = useState(false);

  // Calendar enhancement states
  const [calendarView, setCalendarView] = useState("month"); //  "month" or "week"
  const [weekStartDate, setWeekStartDate] = useState(new Date());
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [editingEvent, setEditingEvent] = useState(null);

  // Mobile touch handling
  const [touchStart, setTouchStart] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  // Status change tracking
  const [statusChanges, setStatusChanges] = useState([]);

  // AI prompt states
  const [aiPrompts, setAiPrompts] = useState([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  
  // Timeline period state
  const [timelinePeriod, setTimelinePeriod] = useState('30days');

  const quickChatOptions = [
    "Analyze my resume",
    "Suggest skills to improve",
    "How to prepare for interviews",
    "Tips for salary negotiation"
  ];

  const [jobRecommendations, setJobRecommendations] = useState([
    { id: 1, company: "TechGiant", position: "Senior Frontend Developer", location: "Remote", description: "TechGiant is seeking a Senior Frontend Developer to lead our web application team. The ideal candidate will have 5+ years of experience with React, TypeScript, and state management libraries. You'll be responsible for architecting scalable frontend solutions and mentoring junior developers." },
    { id: 2, company: "DataDrive", position: "Machine Learning Engineer", location: "New York, NY", description: "DataDrive is looking for a Machine Learning Engineer to join our AI research team. You'll work on cutting-edge projects involving natural language processing and computer vision. Strong background in Python, PyTorch or TensorFlow, and experience with large language models is required." },
    { id: 3, company: "CloudScale", position: "DevOps Engineer", location: "San Francisco, CA", description: "CloudScale needs a DevOps Engineer to streamline our CI/CD pipelines and manage our cloud infrastructure. Experience with AWS, Kubernetes, and Infrastructure as Code (e.g., Terraform) is essential. You'll be responsible for maintaining high availability and scalability of our services." }
  ]);
  const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState(0);
  const [ratedRecommendations, setRatedRecommendations] = useState([]);
  const [totalRecommendations, setTotalRecommendations] = useState(3); // Initial count based on default recommendations
  const [recommendationsPreview, setRecommendationsPreview] = useState([]);
  
  // Define selectedOpportunity before any useEffect that uses it
  const selectedOpportunity = opportunities.length > 0 ? opportunities[selectedOpportunityIndex] : undefined;
  
  // Debug logging for selection issues
  useEffect(() => {
    console.log("Selected opportunity index:", selectedOpportunityIndex);
    console.log("Selected opportunity:", selectedOpportunity);
    console.log("All opportunities:", opportunities);
  }, [selectedOpportunityIndex, selectedOpportunity, opportunities]);

  // Helper function to open a specific guide
  const openGuide = useCallback((guideId: string, sectionId?: string) => {
    setActiveTab('help');
    setHelpView({ active: true, guideId, sectionId });
  }, []);

  // Helper function to get prompts based on status
  const getPromptsForStatus = (status) => {
    // Default prompts if status doesn't match any category
    const defaultPrompts = [
      "Help me craft a compelling cover letter for this position",
      "What skills should I highlight in my resume for this role?",
      "How should I prepare for an interview for this position?",
      "What questions should I ask the interviewer about this role?"
    ];
    
    // If status is undefined or not in our map, return default prompts
    if (!status || !promptsByStatus[status]) {
      console.log("Using default prompts - status not found:", status);
      return defaultPrompts;
    }
    
    // Get the category based on status
    let category = "";
    if (["Bookmarked", "Interested", "Recruiter Contact", "Networking"].includes(status)) {
      category = "Initial Contact";
    } else if (["Preparing Application", "Applied", "Application Acknowledged"].includes(status)) {
      category = "Application";
    } else if (["Screening", "Technical Assessment", "First Interview", "Second Interview", "Final Interview", "Reference Check"].includes(status)) {
      category = "Interview Process";
    } else if (["Negotiating", "Offer Received", "Offer Accepted", "Offer Declined", "Rejected", "Withdrawn", "Position Filled", "Position Cancelled"].includes(status)) {
      category = "Decision";
    } else if (["Following Up", "Waiting"].includes(status)) {
      category = "Follow-up";
    }
    
    // Get prompts from our predefined list
    const statusPrompts = promptsByStatus[status] || [];
    const categoryPrompts = promptsByCategory[category] || [];
    
    // Prioritize status-specific prompts but ensure variety
    // Return 3 from status and 1 from category for more specificity
    const selectedStatusPrompts = statusPrompts.slice(0, 3);
    const selectedCategoryPrompts = categoryPrompts
      .filter(prompt => !selectedStatusPrompts.includes(prompt))
      .slice(0, 1);
      
    const result = [...selectedStatusPrompts, ...selectedCategoryPrompts];
    
    // If we somehow ended up with no prompts, return the defaults
    return result.length > 0 ? result : defaultPrompts;
  };

  // Helper function for updating last modified timestamp
  const updateLastModified = (opportunityId: number) => {
    const newTimestamps = {...lastModifiedTimestamps};
    newTimestamps[opportunityId] = new Date().toISOString();
    setLastModifiedTimestamps(newTimestamps);
  };

  // Helper function for updating an opportunity
  const updateOpportunity = (opportunityId: number, updates: Partial<Opportunity>) => {
    // Get the current opportunity
    const currentOpp = opportunities.find(opp => opp.id === opportunityId);
    
    // If we're updating status, record this change
    if (updates.status && updates.status !== currentOpp.status) {
      const newStatusChange = {
        id: Date.now(),
        opportunityId,
        oldStatus: currentOpp.status,
        newStatus: updates.status,
        date: new Date().toISOString(),
        company: currentOpp.company,
        position: currentOpp.position
      };
      
      setStatusChanges(prev => [...prev, newStatusChange]);
    }
    
    dispatch({
      type: 'UPDATE_OPPORTUNITY',
      payload: {
        id: opportunityId,
        updates
      }
    });
    updateLastModified(opportunityId);
  };
  
  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        // Validate the imported data structure
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          // Basic validation to ensure each item has required fields
          const validData = jsonData.filter(item => 
            item && typeof item === 'object' && 
            'company' in item && 
            'position' in item && 
            'jobDescription' in item
          );
          
          // Assign new IDs to avoid conflicts
          const processedData = validData.map(item => ({
            ...item,
            id: Date.now() + Math.floor(Math.random() * 1000) // Ensure unique IDs
          }));
          
          setImportData(processedData);
          setSelectedImportIds(processedData.map(item => item.id));
        } else {
          alert("Invalid import file format. Please select a valid export file.");
          setImportData([]);
          setSelectedImportIds([]);
        }
      } catch (error) {
        console.error("Error parsing import file:", error);
        alert("Error parsing the file. Please make sure it's a valid JSON file.");
        setImportData([]);
        setSelectedImportIds([]);
      }
    };
    
    reader.readAsText(file);
  };

  // Handle export of selected opportunities
  // CSV parsing and handling functions
  const handleRecommendationsCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const recommendations = parseCSVToRecommendations(csvText);
        
        setRecommendationsPreview(recommendations);
      } catch (error) {
        console.error("Error parsing CSV file:", error);
        alert("Error parsing the CSV file. Please check the format.");
        setRecommendationsPreview([]);
      }
    };
    
    reader.readAsText(file);
  };

  const parseCSVToRecommendations = (csvText: string) => {
    // Split by lines and get header row
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Map CSV columns to recommendation properties
    return lines.slice(1).filter(line => line.trim() !== '').map((line, index) => {
      // Handle quoted fields properly
      let values = [];
      let inQuotes = false;
      let currentValue = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue);
      
      // Clean up values (remove quotes)
      values = values.map(val => {
        if (val.startsWith('"') && val.endsWith('"')) {
          return val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        return val.trim();
      });
      
      // Create object from headers and values
      const rowData = {};
      headers.forEach((header, i) => {
        rowData[header] = values[i] || '';
      });
      
      // Create recommendation object
      return {
        id: Date.now() + index,
        company: rowData['company'] || '',
        position: rowData['position'] || '',
        location: rowData['location'] || '',
        description: rowData['description'] || '',
        salary: rowData['salary'] || '',
        url: rowData['url'] || '',
        source: rowData['source'] || ''
      };
    });
  };

  const handleImportRecommendations = () => {
    if (recommendationsPreview.length === 0) return;
    
    setJobRecommendations(recommendationsPreview);
    setTotalRecommendations(recommendationsPreview.length);
    setCurrentRecommendationIndex(0);
    setRecommendationsPreview([]);
    
    // Show success message
    alert(`Successfully imported ${recommendationsPreview.length} job recommendations.`);
  };

  const handleRateRecommendation = (rating) => {
    // Get current recommendation
    const currentRecommendation = jobRecommendations[currentRecommendationIndex];
    
    // Add rating to current recommendation
    const ratedRecommendation = {
      ...currentRecommendation,
      rating,
      ratedAt: new Date().toISOString()
    };
    
    // Add to rated recommendations
    setRatedRecommendations([...ratedRecommendations, ratedRecommendation]);
    
    // If user is interested, optionally create a new opportunity
    if (rating === 'interested') {
      const shouldCreateOpportunity = window.confirm(
        "Would you like to add this job to your opportunities list?"
      );
      
      if (shouldCreateOpportunity) {
        const newOpportunity = {
          id: Date.now(),
          company: currentRecommendation.company,
          position: currentRecommendation.position,
          jobDescription: currentRecommendation.description,
          status: "Interested",
          appliedDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          }),
          location: currentRecommendation.location,
          salary: currentRecommendation.salary || "",
          applicationUrl: currentRecommendation.url || "",
          source: currentRecommendation.source || "",
          resume: masterResume,
          notes: "",
          tags: []
        };
        
        dispatch({ type: 'ADD_OPPORTUNITY', payload: newOpportunity });
        updateLastModified(newOpportunity.id);
      }
    }
    
    // Move to next recommendation
    handleNextRecommendation();
  };

  const handleNextRecommendation = () => {
    if (currentRecommendationIndex < jobRecommendations.length - 1) {
      setCurrentRecommendationIndex(currentRecommendationIndex + 1);
    } else {
      // Cycle back to the beginning if we've gone through all
      setCurrentRecommendationIndex(0);
    }
  };

  const handleExportRatedRecommendations = () => {
    if (ratedRecommendations.length === 0) return;
    
    // Create CSV content
    const headers = ['id', 'company', 'position', 'location', 'description', 'salary', 'url', 'source', 'rating', 'ratedAt'];
    const csvRows = [headers.join(',')];
    
    ratedRecommendations.forEach(rec => {
      const values = [
        rec.id,
        `"${(rec.company || '').replace(/"/g, '""')}"`,
        `"${(rec.position || '').replace(/"/g, '""')}"`,
        `"${(rec.location || '').replace(/"/g, '""')}"`,
        `"${(rec.description || '').replace(/"/g, '""')}"`,
        `"${(rec.salary || '').replace(/"/g, '""')}"`,
        `"${(rec.url || '').replace(/"/g, '""')}"`,
        `"${(rec.source || '').replace(/"/g, '""')}"`,
        rec.rating,
        rec.ratedAt
      ];
      csvRows.push(values.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-recommendations-ratings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportOpportunities = () => {
    if (selectedExportIds.length === 0) return;
    
    // Filter opportunities based on selection
    const opportunitiesToExport = opportunities.filter(opp => 
      selectedExportIds.includes(opp.id)
    );
    
    // Create export data
    const exportData = JSON.stringify(opportunitiesToExport, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-opportunities-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle import of selected opportunities
  const handleImportOpportunities = () => {
    if (selectedImportIds.length === 0) return;
    
    // Filter import data based on selection
    const opportunitiesToImport = importData.filter(opp => 
      selectedImportIds.includes(opp.id)
    );
    
    // Add each opportunity to the state
    opportunitiesToImport.forEach(opp => {
      // Generate a unique ID for each imported opportunity
      const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
      
      // Create a new opportunity object
      const newOpp = {
        ...opp,
        id: uniqueId
      };
      
      // Add to state using dispatch
      dispatch({ type: 'ADD_OPPORTUNITY', payload: newOpp });
      
      // Update last modified timestamp
      updateLastModified(uniqueId);
    });
    
    // Reset import state
    setImportData([]);
    setSelectedImportIds([]);
    setImportFile(null);
    
    // Show success message
    alert(`Successfully imported ${opportunitiesToImport.length} opportunities.`);
  };

  // Helper function to calculate application streak
  const calculateStreak = (opportunities) => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) { // Check up to 30 days back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasApplication = opportunities.some(opp => {
        const appDate = new Date(opp.appliedDate);
        return appDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasApplication) {
        streak++;
      } else if (i > 0) { // If we're not checking today
        break; // End streak on first day with no applications
      }
    }
    
    return streak;
  };

  // Helper functions for calendar
  // Helper function to parse date strings
  const parseEventDate = (dateString) => {
    if (!dateString) return new Date();
    
    try {
      // Try parsing with date-fns first
      try {
        const parsedDate = parseISO(dateString);
        // Check if the date is valid
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      } catch (e) {
        // Continue to next method if this fails
      }
      
      // Try regular Date constructor
      const regularDate = new Date(dateString);
      if (!isNaN(regularDate.getTime())) {
        return regularDate;
      }
      
      // If we have a string like "March 15, 2023"
      if (typeof dateString === 'string' && dateString.includes(',')) {
        const parts = dateString.split(',');
        if (parts.length === 2) {
          const monthDay = parts[0].trim();
          const year = parts[1].trim();
          return new Date(`${monthDay} ${year}`);
        }
      }
      
      // Default to current date if all parsing fails
      return new Date();
    } catch (e) {
      console.error("Error parsing date:", e);
      return new Date();
    }
  };

  // Helper function to get events for a specific day
  const getEventsForDay = (day) => {
    return events
      .filter(event => eventTypeFilter === 'all' || event.type === eventTypeFilter)
      .filter(event => {
        const eventDate = parseEventDate(event.date);
        return day.getDate() === eventDate.getDate() && 
               day.getMonth() === eventDate.getMonth() && 
               day.getFullYear() === eventDate.getFullYear();
      });
  };
  
  // Helper function to get the week's date range
  const getWeekDates = (startDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    
    // Set to the start of the week (Sunday)
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    
    // Get all 7 days of the week
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  // Helper function to get status changes for a specific day
  const getStatusChangesForDay = (day) => {
    return statusChanges.filter(change => {
      const changeDate = new Date(change.date);
      return isSameDay(day, changeDate);
    });
  };

  // Enhanced function to get events for a day with job application info
  const getEnhancedEventsForDay = (day) => {
    if (!day) return { events: [], applications: [], statusChanges: [], totalActivity: 0 };
    
    // Get regular events
    const dayEvents = events
      .filter(event => eventTypeFilter === 'all' || event.type === eventTypeFilter)
      .filter(event => {
        try {
          // Try multiple date parsing approaches
          let eventDate;
          if (typeof event.date === 'string') {
            // Try parsing with date-fns first
            try {
              eventDate = parseISO(event.date);
            } catch (e) {
              // Fall back to regular Date constructor
              eventDate = new Date(event.date);
            }
          } else if (event.date instanceof Date) {
            eventDate = event.date;
          } else {
            return false;
          }
          
          return isSameDay(day, eventDate);
        } catch (e) {
          console.error("Error comparing dates:", e);
          return false;
        }
      });
    
    // Check for job applications on this day
    const jobApplications = opportunities.filter(opp => {
      if (!opp.appliedDate) return false;
      
      try {
        // Try multiple date parsing approaches
        let appDate;
        try {
          appDate = parseISO(opp.appliedDate);
        } catch (e) {
          appDate = new Date(opp.appliedDate);
        }
        
        return isSameDay(day, appDate);
      } catch (e) {
        console.error("Error comparing application dates:", e);
        return false;
      }
    });
    
    // Get status changes for this day
    const dayStatusChanges = getStatusChangesForDay(day);
    
    return {
      events: dayEvents,
      applications: jobApplications,
      statusChanges: dayStatusChanges,
      totalActivity: dayEvents.length + jobApplications.length + dayStatusChanges.length
    };
  };

  // Function to handle batch deletion
  const handleBatchDelete = () => {
    // Show confirmation dialog
    if (window.confirm(`Are you sure you want to delete ${selectedJobIds.length} selected job(s)?`)) {
      // Delete each selected job
      selectedJobIds.forEach(id => {
        dispatch({ type: 'DELETE_OPPORTUNITY', payload: id });
      });
      
      // Reset selection
      setSelectedJobIds([]);
      setIsBatchSelectMode(false);
    }
  };

  // Toggle function for selecting/deselecting a job
  const toggleJobSelection = (id: number) => {
    if (id === -1) {
      // Special case to clear all selections
      setSelectedJobIds([]);
      return;
    }
    
    if (selectedJobIds.includes(id)) {
      setSelectedJobIds(selectedJobIds.filter(jobId => jobId !== id));
    } else {
      setSelectedJobIds([...selectedJobIds, id]);
    }
  };

  // Mobile touch handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    if (touchStart - e.targetTouches[0].clientX > 50) {
      // Swipe left - go to next opportunity if available
      if (selectedOpportunityIndex < opportunities.length - 1) {
        setSelectedOpportunityIndex(selectedOpportunityIndex + 1);
      }
    } else if (touchStart - e.targetTouches[0].clientX < -50) {
      // Swipe right - go to previous opportunity if available
      if (selectedOpportunityIndex > 0) {
        setSelectedOpportunityIndex(selectedOpportunityIndex - 1);
      }
    }
  };

  // Scroll handler for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to update prompts when opportunity changes
  useEffect(() => {
    if (selectedOpportunity) {
      setIsLoadingPrompts(true);
      // Simulate loading for animation effect
      setTimeout(() => {
        const prompts = getPromptsForStatus(selectedOpportunity.status);
        
        // Ensure we have an array of strings
        const cleanPrompts = prompts.map(p => typeof p === 'string' ? p : '').filter(Boolean);
        setAiPrompts(cleanPrompts);
        setIsLoadingPrompts(false);
      }, 300);
    } else {
      // Reset prompts if no opportunity is selected
      setAiPrompts([]);
    }
  }, [selectedOpportunity]);

  // Generate analytics data using useMemo to prevent recalculation on every render
  const analytics = useMemo(() => {
    // Status distribution
    const statusCounts = opportunities.reduce((acc, opp) => {
      acc[opp.status] = (acc[opp.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get all applications with valid dates and sort them
    const applicationsWithDates = opportunities
      .filter(opp => opp.appliedDate)
      .map(opp => {
        try {
          return {
            id: opp.id,
            date: new Date(opp.appliedDate)
          };
        } catch (e) {
          return null;
        }
      })
      .filter(app => app !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Generate timeline data for different periods
    const generateTimelineData = (days) => {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - days);
      
      // Create array of dates for the period
      const datePoints = [];
      for (let i = 0; i <= days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        datePoints.push({
          date: new Date(date),
          count: 0,
          totalCount: 0
        });
      }
      
      // Count applications for each date
      let runningTotal = 0;
      datePoints.forEach((point, index) => {
        // Count applications on this specific date
        const appsOnDate = applicationsWithDates.filter(app => 
          app.date.getDate() === point.date.getDate() &&
          app.date.getMonth() === point.date.getMonth() &&
          app.date.getFullYear() === point.date.getFullYear()
        ).length;
        
        // Add to running total
        runningTotal += appsOnDate;
        
        // For the first point, count all applications before the start date
        if (index === 0) {
          const appsBeforeStart = applicationsWithDates.filter(app => 
            app.date < point.date
          ).length;
          runningTotal += appsBeforeStart;
        }
        
        point.count = appsOnDate;
        point.totalCount = runningTotal;
      });
      
      // Format dates for display and return
      return datePoints.map(point => ({
        date: point.date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        }),
        count: point.count,
        totalCount: point.totalCount
      }));
    };

    // Generate data for different time periods
    const timelineData = {
      '7days': generateTimelineData(7),
      '30days': generateTimelineData(30),
      '90days': generateTimelineData(90),
      'all': applicationsWithDates.length > 0 ? (() => {
        // For all-time view, use actual application dates
        const firstAppDate = applicationsWithDates[0].date;
        const daysDiff = Math.ceil((new Date() - firstAppDate) / (1000 * 60 * 60 * 24));
        return generateTimelineData(Math.min(daysDiff, 365)); // Cap at 365 days
      })() : []
    };
    
    // Response rate
    const responseCount = opportunities.filter(opp => 
      ['Screening', 'Technical Assessment', 'First Interview', 'Second Interview', 
       'Final Interview', 'Offer Received', 'Offer Accepted', 'Offer Declined'].includes(opp.status)
    ).length;
    
    const responseRate = opportunities.length > 0 
      ? (responseCount / opportunities.length * 100).toFixed(1) 
      : '0';
    
    // Interview conversion rate
    const interviewCount = opportunities.filter(opp => 
      ['First Interview', 'Second Interview', 'Final Interview', 
       'Offer Received', 'Offer Accepted', 'Offer Declined'].includes(opp.status)
    ).length;
    
    const interviewRate = responseCount > 0 
      ? (interviewCount / responseCount * 100).toFixed(1) 
      : '0';
    
    // Offer rate
    const offerCount = opportunities.filter(opp => 
      ['Offer Received', 'Offer Accepted', 'Offer Declined'].includes(opp.status)
    ).length;
    
    const offerRate = interviewCount > 0 
      ? (offerCount / interviewCount * 100).toFixed(1) 
      : '0';
    
    // Weekly application count
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyApplicationCount = opportunities.filter(opp => {
      const appDate = new Date(opp.appliedDate);
      return appDate >= startOfWeek;
    }).length;
    
    // Job Search Level System
    const calculateJobSearchLevel = (opportunities) => {
      const baseScore = opportunities.length * 10;
      const interviewBonus = opportunities.filter(opp => 
        ['Screening', 'Technical Assessment', 'First Interview', 'Second Interview', 'Final Interview'].includes(opp.status)
      ).length * 25;
      const offerBonus = opportunities.filter(opp => 
        ['Offer Received', 'Offer Accepted'].includes(opp.status)
      ).length * 100;
      
      const totalScore = baseScore + interviewBonus + offerBonus;
      
      // Level calculation
      const level = Math.floor(Math.sqrt(totalScore / 10)) + 1;
      const nextLevelScore = Math.pow((level), 2) * 10;
      const progress = Math.min((totalScore / nextLevelScore) * 100, 100);
      
      return { level, totalScore, nextLevelScore, progress };
    };
    
    // Achievement System
    const calculateAchievements = (opportunities, events) => {
      return [
        {
          id: 'first_application',
          name: 'First Steps',
          description: 'Submit your first job application',
          icon: 'Rocket',
          unlocked: opportunities.length > 0,
          progress: Math.min(opportunities.length, 1),
          total: 1
        },
        {
          id: 'application_streak',
          name: 'Consistency Champion',
          description: 'Apply to jobs for 5 consecutive days',
          icon: 'Flame',
          unlocked: calculateStreak(opportunities) >= 5,
          progress: Math.min(calculateStreak(opportunities), 5),
          total: 5
        },
        {
          id: 'interview_milestone',
          name: 'Interview Pro',
          description: 'Secure 5 interviews',
          icon: 'Users',
          unlocked: opportunities.filter(opp => 
            ['First Interview', 'Second Interview', 'Final Interview'].includes(opp.status)
          ).length >= 5,
          progress: opportunities.filter(opp => 
            ['First Interview', 'Second Interview', 'Final Interview'].includes(opp.status)
          ).length,
          total: 5
        },
        {
          id: 'offer_milestone',
          name: 'Offer Magnet',
          description: 'Receive 3 job offers',
          icon: 'Award',
          unlocked: opportunities.filter(opp => 
            ['Offer Received', 'Offer Accepted', 'Offer Declined'].includes(opp.status)
          ).length >= 3,
          progress: opportunities.filter(opp => 
            ['Offer Received', 'Offer Accepted', 'Offer Declined'].includes(opp.status)
          ).length,
          total: 3
        },
        {
          id: 'diverse_applications',
          name: 'Explorer',
          description: 'Apply to 10 different companies',
          icon: 'Globe',
          unlocked: new Set(opportunities.map(opp => opp.company)).size >= 10,
          progress: Math.min(new Set(opportunities.map(opp => opp.company)).size, 10),
          total: 10
        },
        {
          id: 'perfect_week',
          name: 'Perfect Week',
          description: 'Apply to at least one job every day for a week',
          icon: 'CalendarIcon2',
          unlocked: calculateStreak(opportunities) >= 7,
          progress: Math.min(calculateStreak(opportunities), 7),
          total: 7
        }
      ];
    };
    
    // Weekly Activity Patterns
    const calculateDayOfWeekActivity = (opportunities, events) => {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const activityByDay = daysOfWeek.map(day => ({ day, count: 0 }));
      
      // Count applications by day of week
      opportunities.forEach(opp => {
        try {
          const date = new Date(opp.appliedDate);
          const dayIndex = date.getDay();
          activityByDay[dayIndex].count += 1;
        } catch (e) {
          // Handle invalid dates
        }
      });
      
      // Count events by day of week
      events.forEach(event => {
        try {
          const date = new Date(event.date);
          const dayIndex = date.getDay();
          activityByDay[dayIndex].count += 1;
        } catch (e) {
          // Handle invalid dates
        }
      });
      
      // Find most and least active days
      const sortedDays = [...activityByDay].sort((a, b) => b.count - a.count);
      const mostActiveDay = sortedDays[0];
      const leastActiveDay = [...activityByDay].filter(day => day.count > 0)
        .sort((a, b) => a.count - b.count)[0] || { day: 'None', count: 0 };
      
      return { activityByDay, mostActiveDay, leastActiveDay };
    };
    
    // Weekly Challenges
    const generateWeeklyChallenges = () => {
      // Get current week number
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.ceil((((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
      
      // This week's applications
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setDate(now.getDate() - now.getDay());
      startOfThisWeek.setHours(0, 0, 0, 0);
      
      const thisWeekApplications = opportunities.filter(opp => {
        try {
          const appDate = new Date(opp.appliedDate);
          return appDate >= startOfThisWeek;
        } catch (e) {
          return false;
        }
      }).length;
      
      // Use week number as seed for "random" challenges
      const challenges = [
        {
          id: `week_${weekNumber}_1`,
          name: 'Application Sprint',
          description: 'Apply to 5 jobs this week',
          reward: '50 points',
          icon: 'Send',
          target: 5,
          progress: thisWeekApplications,
          expires: 'Sunday'
        },
        {
          id: `week_${weekNumber}_2`,
          name: 'Network Builder',
          description: 'Add 3 networking contacts',
          reward: '30 points',
          icon: 'Users',
          target: 3,
          progress: opportunities.filter(opp => 
            opp.status === "Networking" && new Date(opp.appliedDate) >= startOfThisWeek
          ).length,
          expires: 'Sunday'
        },
        {
          id: `week_${weekNumber}_3`,
          name: 'Skill Builder',
          description: 'Update your resume with a new skill',
          reward: '20 points',
          icon: 'Award',
          target: 1,
          progress: 0, // Would need to track resume updates
          expires: 'Sunday'
        }
      ];
      
      return challenges;
    };
    
    // Job Search Insights
    const generateJobSearchInsights = (opportunities) => {
      const insights = [];
      
      // Only generate insights if we have enough data
      if (opportunities.length < 5) {
        return insights;
      }
      
      // Response rate by company size
      const largeCompanies = opportunities.filter(opp => 
        opp.company.includes("Inc") || opp.company.includes("Corp") || opp.company.includes("LLC")
      );
      const largeCompanyResponseRate = largeCompanies.length > 0 
        ? (largeCompanies.filter(opp => 
            ['Screening', 'Technical Assessment', 'First Interview'].includes(opp.status)
          ).length / largeCompanies.length) * 100
        : 0;
        
      const smallCompanies = opportunities.filter(opp => 
        !opp.company.includes("Inc") && !opp.company.includes("Corp") && !opp.company.includes("LLC")
      );
      const smallCompanyResponseRate = smallCompanies.length > 0 
        ? (smallCompanies.filter(opp => 
            ['Screening', 'Technical Assessment', 'First Interview'].includes(opp.status)
          ).length / smallCompanies.length) * 100
        : 0;
      
      if (largeCompanies.length > 3 && smallCompanies.length > 3) {
        if (largeCompanyResponseRate > smallCompanyResponseRate + 10) {
          insights.push({
            title: "Large Companies Favor Your Profile",
            description: `You're getting ${largeCompanyResponseRate.toFixed(0)}% response rate from larger companies vs ${smallCompanyResponseRate.toFixed(0)}% from smaller ones. Consider focusing more on established companies.`,
            icon: "Building"
          });
        } else if (smallCompanyResponseRate > largeCompanyResponseRate + 10) {
          insights.push({
            title: "Startups & Small Companies Respond Better",
            description: `You're getting ${smallCompanyResponseRate.toFixed(0)}% response rate from smaller companies vs ${largeCompanyResponseRate.toFixed(0)}% from larger ones. Consider targeting more startups and small businesses.`,
            icon: "Home"
          });
        }
      }
      
      // Application volume insight
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      
      const applicationsLast30Days = opportunities.filter(opp => {
        try {
          const appDate = new Date(opp.appliedDate);
          return appDate >= last30Days;
        } catch (e) {
          return false;
        }
      }).length;
      
      if (applicationsLast30Days < 10) {
        insights.push({
          title: "Increase Your Application Volume",
          description: "You've submitted only " + applicationsLast30Days + " applications in the last 30 days. Job searching is a numbers game - aim for at least 15-20 applications per month to improve your chances.",
          icon: "BarChart"
        });
      } else if (applicationsLast30Days > 40) {
        insights.push({
          title: "Quality Over Quantity",
          description: "You've submitted " + applicationsLast30Days + " applications in the last 30 days. Consider focusing more on quality applications with customized materials rather than high volume.",
          icon: "Award"
        });
      }
      
      return insights;
    };
    
    return {
      statusCounts,
      applicationTimeline: timelineData,
      responseRate,
      interviewRate,
      offerRate,
      totalApplications: opportunities.length,
      activeApplications: opportunities.filter(opp => 
        !['Rejected', 'Withdrawn', 'Offer Declined', 'Position Filled', 'Position Cancelled'].includes(opp.status)
      ).length,
      weeklyApplicationCount,
      jobSearchStats: calculateJobSearchLevel(opportunities),
      achievements: calculateAchievements(opportunities, events),
      weeklyPatterns: calculateDayOfWeekActivity(opportunities, events),
      weeklyChallenges: generateWeeklyChallenges(),
      jobSearchInsights: generateJobSearchInsights(opportunities)
    };
  }, [opportunities, events]);
  
  // Filter opportunities based on search term, status filter, and date filter
  const filteredOpportunities = opportunities.filter(opp => {
    // Search term matching
    const matchesSearch = 
      opp.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
      opp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opp.notes && opp.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filtering
    const matchesStatus = statusFilter === "All" || opp.status === statusFilter;
    
    // Date filtering
    let matchesDate = true;
    if (dateFilter !== "All") {
      const today = new Date();
      const appliedDate = new Date(opp.appliedDate);
      
      switch(dateFilter) {
        case "Last 7 Days":
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(today.getDate() - 7);
          matchesDate = appliedDate >= sevenDaysAgo;
          break;
        case "Last 30 Days":
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);
          matchesDate = appliedDate >= thirtyDaysAgo;
          break;
        case "Last 90 Days":
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(today.getDate() - 90);
          matchesDate = appliedDate >= ninetyDaysAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Sort the filtered opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch(sortBy) {
      case 'lastModified':
        const aTime = lastModifiedTimestamps[a.id] ? new Date(lastModifiedTimestamps[a.id]).getTime() : 0;
        const bTime = lastModifiedTimestamps[b.id] ? new Date(lastModifiedTimestamps[b.id]).getTime() : 0;
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      
      case 'appliedDate':
        const aDate = new Date(a.appliedDate).getTime();
        const bDate = new Date(b.appliedDate).getTime();
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      
      case 'company':
        const compResult = a.company.localeCompare(b.company);
        return sortDirection === 'asc' ? compResult : -compResult;
      
      case 'position':
        const posResult = a.position.localeCompare(b.position);
        return sortDirection === 'asc' ? posResult : -posResult;
      
      case 'status':
        const statResult = a.status.localeCompare(b.status);
        return sortDirection === 'asc' ? statResult : -statResult;
      
      default:
        return 0;
    }
  });

  const [newOpportunity, setNewOpportunity] =  useState({
    company: "",
    position: "",
    jobDescription: "",
    status: "Interested", // Default is "Interested"
    appliedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    recruiterName: "",
    recruiterEmail: "",
    recruiterPhone: "",
    notes: "",
    location: "",
    salary: "",
    applicationUrl: "",
    source: "",
    tags: []
  });

  const handleNewOpportunityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewOpportunity({
      ...newOpportunity,
      [e.target.id]: e.target.value,
    });
  };

  const handleNewOpportunityStatusChange = (value: string) => {
    setNewOpportunity({
      ...newOpportunity,
      status: value,
    });
  };

  const handleSaveNewOpportunity = () => {
    // Convert from YYYY-MM-DD to a more readable format
    const dateObj = new Date(newOpportunity.appliedDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Use a timestamp for a unique ID
    const uniqueId = Date.now();
    
    const newOpp = {
      ...newOpportunity,
      id: uniqueId,
      appliedDate: formattedDate,
      resume: masterResume, // Use the master resume for the new opportunity
    };
    
    // Use dispatch instead of setState
    dispatch({ type: 'ADD_OPPORTUNITY', payload: newOpp });
    
    // Update last modified timestamp
    updateLastModified(uniqueId);
    
    // After the state update, find the index of the new opportunity and select it
    // We need to do this in the next render cycle to ensure the state has updated
    setTimeout(() => {
      const newIndex = opportunities.findIndex(opp => opp.id === uniqueId);
      if (newIndex !== -1) {
        setSelectedOpportunityIndex(newIndex);
      } else {
        // If we can't find it (unlikely), select the last opportunity
        setSelectedOpportunityIndex(opportunities.length - 1);
      }
    }, 0);
    
    // Reset form
    setNewOpportunity({
      company: "",
      position: "",
      jobDescription: "",
      status: "Interested",
      appliedDate: new Date().toISOString().split('T')[0],
      recruiterName: "",
      recruiterEmail: "",
      recruiterPhone: "",
      notes: "",
      location: "",
      salary: "",
      applicationUrl: "",
      source: "",
      tags: []
    });
  };

  const handleSaveDateChange = () => {
    const selectedOpportunity = opportunities[selectedOpportunityIndex];
    // Convert from YYYY-MM-DD to a more readable format
    const dateObj = new Date(editedDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Use the helper function to update the opportunity
    updateOpportunity(selectedOpportunity.id, { appliedDate: formattedDate });
    
    setIsEditingDate(false);
  };

  const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewEvent({
      ...newEvent,
      [e.target.id]: e.target.value,
    });
  };

  const handleNewEventTypeChange = (value: string) => {
    setNewEvent({
      ...newEvent,
      type: value,
    });
  };

  const handleNewEventOpportunityChange = (value: string) => {
    setNewEvent({
      ...newEvent,
      opportunityId: value,
    });
  };

  const handleSaveNewEvent = () => {
    // Convert from YYYY-MM-DD to a more readable format
    const dateObj = new Date(newEvent.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const newEventObj = {
      id: Date.now(),
      title: newEvent.title,
      date: formattedDate,
      type: newEvent.type,
      opportunityId: newEvent.opportunityId !== "none" ? parseInt(newEvent.opportunityId) : undefined,
      notes: newEvent.notes
    };
    
    dispatch({ type: 'ADD_EVENT', payload: newEventObj });
    
    // Reset form
    setNewEvent({
      title: "",
      date: new Date().toISOString().split('T')[0],
      type: "interview",
      opportunityId: "",
      notes: ""
    });
  };

  const [localChatMessages, setLocalChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Get chat messages for the selected opportunity
  const opportunityMessages = useMemo(() => {
    if (!selectedOpportunity) return [];
    return chatMessages[selectedOpportunity.id] || [];
  }, [chatMessages, selectedOpportunity]);

  useEffect(() => {
    if (selectedOpportunity) {
      fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'suggestions',
          resume: selectedOpportunity.resume,
          jobDescription: selectedOpportunity.jobDescription,
        }),
      })
        .then(response => response.json())
        .then(data => setSuggestions(data.suggestions))
        .catch(console.error);
    }
  }, [selectedOpportunity]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() === "" || !selectedOpportunity) return;

    // Add user message to global state
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: {
        opportunityId: selectedOpportunity.id,
        message: currentMessage,
        sender: 'user'
      }
    });

    const userMessage = { role: 'user', content: currentMessage };
    setLocalChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          messages: [
            { role: 'system', content: `You are a career advisor. The user's resume is: ${selectedOpportunity.resume}\n\nThe job description is: ${selectedOpportunity.jobDescription}` },
            ...localChatMessages,
            userMessage
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      
      // Add AI response to global state
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          opportunityId: selectedOpportunity.id,
          message: data.content || "I'm sorry, I couldn't generate a response.",
          sender: 'ai'
        }
      });
      
      setLocalChatMessages(prev => [...prev, { role: 'assistant', content: data.content || "I'm sorry, I couldn't generate a response." }]);
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Add error message to global state
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          opportunityId: selectedOpportunity.id,
          message: "I'm sorry, there was an error processing your request.",
          sender: 'ai'
        }
      });
      
      setLocalChatMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, there was an error processing your request." }]);
    }
  };


  return isClientSide ? (
    <div className="min-h-screen flex flex-col">
      <div className={`container mx-auto p-2 sm:p-4 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} flex-grow flex flex-col`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="Hey, You're Hired! Logo" 
              className="h-10 w-10 mr-2" 
              style={{ 
                filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' 
              }} 
            />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">Hey, You're Hired!</h1>
          </div>
          
          {/* Local storage indicator */}
          {localStorageOnly && (
            <div className="hidden md:flex bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium items-center">
              <Lock className="h-3 w-3 mr-1" />
              Local Storage Only
            </div>
          )}
          <div className="hidden sm:flex items-center">
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              id="dark-mode"
            />
            <Label htmlFor="dark-mode" className="ml-2 text-sm">
              Dark Mode
            </Label>
          </div>
          
          {/* Authentication UI */}
          <div className="ml-auto flex items-center gap-2">
            {authLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm hidden md:inline">{user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <AuthModal 
                trigger={<Button variant="outline" size="sm">Sign In</Button>}
              />
            )}
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value);
            if (value === 'help') {
              setHelpView({ active: true });
            } else {
              setHelpView({ active: false });
            }
          }} 
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md flex-grow flex flex-col`}
        >
          <TabsList className={`mb-4 p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} rounded-t-lg sticky top-0 z-10 flex w-full justify-center`}>
            <div className="flex space-x-1">
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="resume">Master Resume</TabsTrigger>
              <TabsTrigger value="captain">Coach</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="help">
                <HelpCircle className="h-4 w-4 mr-1" />
                Help
              </TabsTrigger>
            </div>
          </TabsList>

          <TabsContent value="opportunities" className="p-2 sm:p-4 flex-grow overflow-auto">
            <ProtectedContent>
              <OpportunitiesTab 
                opportunities={opportunities}
                selectedOpportunityIndex={selectedOpportunityIndex}
                setSelectedOpportunityIndex={setSelectedOpportunityIndex}
                updateOpportunity={updateOpportunity}
                isDarkMode={isDarkMode}
                user={user}
                masterResume={masterResume}
                dispatch={dispatch}
              />
            </ProtectedContent>
          </TabsContent>

          <TabsContent value="resume" className="p-2 sm:p-4 flex-grow overflow-auto">
            <ProtectedContent>
              <ResumeTab 
                masterResume={masterResume}
                updateMasterResume={(resume: string) => dispatch({ type: 'UPDATE_MASTER_RESUME', payload: resume })}
                opportunities={opportunities}
                dispatch={dispatch}
                isDarkMode={isDarkMode}
                user={user}
              />
            </ProtectedContent>
          </TabsContent>

          <TabsContent value="captain" className="p-2 sm:p-4 flex-grow overflow-auto">
            <ProtectedContent>
              <CaptainTab 
                opportunities={opportunities}
                jobRecommendations={jobRecommendations}
                currentRecommendationIndex={currentRecommendationIndex}
                setCurrentRecommendationIndex={setCurrentRecommendationIndex}
                ratedRecommendations={ratedRecommendations}
                setRatedRecommendations={setRatedRecommendations}
                isDarkMode={isDarkMode}
                user={user}
              />
            </ProtectedContent>
          </TabsContent>

          <TabsContent value="analytics" className="p-2 sm:p-4 flex-grow overflow-auto">
            <ProtectedContent>
              <AnalyticsTab 
                analytics={analytics}
                opportunities={opportunities}
                isDarkMode={isDarkMode}
                user={user}
              />
            </ProtectedContent>
          </TabsContent>

          <TabsContent value="calendar" className="p-2 sm:p-4 flex-grow overflow-auto">
            <ProtectedContent>
              <CalendarTab 
                events={events}
                opportunities={opportunities}
                date={date}
                setDate={setDate}
                eventTypeFilter={eventTypeFilter}
                setEventTypeFilter={setEventTypeFilter}
                isDarkMode={isDarkMode}
                user={user}
                dispatch={dispatch}
              />
            </ProtectedContent>
          </TabsContent>
          
          <TabsContent value="settings" className="p-2 sm:p-4 flex-grow overflow-auto">
            <ProtectedContent>
              <SettingsTab 
                opportunities={opportunities}
                jobRecommendations={jobRecommendations}
                ratedRecommendations={ratedRecommendations}
                isDarkMode={isDarkMode}
                showDebugPanel={showDebugPanel}
                setShowDebugPanel={setShowDebugPanel}
                toggleDarkMode={toggleDarkMode}
                user={user}
                localStorageOnly={localStorageOnly}
                setLocalStorageOnly={setLocalStorageOnly}
              />
            </ProtectedContent>
          </TabsContent>
          
          <TabsContent value="help" className="p-2 sm:p-4 flex-grow overflow-auto">
            <HelpTab 
              helpView={helpView}
              setHelpView={setHelpView}
              isDarkMode={isDarkMode}
              guides={allGuides}
            />
          </TabsContent>
        </Tabs>

        {/* Back to top button */}
        {showBackToTop && (
          <Button className="fixed bottom-4 right-4 rounded-full md:hidden h-10 w-10 p-0" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
        
        {/* Storage Options Dialog */}
        <Dialog open={showStorageOptionsDialog} onOpenChange={setShowStorageOptionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Data Storage Options</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Hey You're Hired! offers two ways to store your job application data:
              </p>
              
              <div className="space-y-3">
                <div className="p-3 border rounded-md">
                  <h3 className="font-medium">Cloud Storage (Default)</h3>
                  <p className="text-sm text-gray-600">
                    Your data is securely stored on our servers and available on any device when you log in.
                  </p>
                  <div className="text-sm text-green-600 mt-1">
                    ✓ Access from anywhere<br />
                    ✓ Data backup<br />
                    ✓ Device synchronization
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <h3 className="font-medium">Local Storage Only</h3>
                  <p className="text-sm text-gray-600">
                    Your data stays only on this device and is never sent to our servers.
                  </p>
                  <div className="text-sm text-blue-600 mt-1">
                    ✓ Enhanced privacy<br />
                    ✓ Works offline<br />
                    ✓ No server storage
                  </div>
                </div>
              </div>
              
              <p className="text-sm">
                You can change this setting anytime in the Privacy Settings section.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowStorageOptionsDialog(false)}>
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Debug panel */}
        {showDebugPanel && (
          <div className={`fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 z-50 ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} border-t border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} shadow-lg`}>
            <div className={`flex justify-between items-center p-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
              <h3 className="font-medium">Debug Panel</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => setShowDebugPanel(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="p-2 max-h-[50vh] overflow-auto">
              <Tabs defaultValue="state">
                <TabsList className="mb-2">
                  <TabsTrigger value="state">State</TabsTrigger>
                  <TabsTrigger value="props">Props</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="state">
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium">Selected Opportunity Index</h4>
                      <pre className={`text-xs p-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {selectedOpportunityIndex}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Active Tab</h4>
                      <pre className={`text-xs p-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {activeTab}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Opportunities Count</h4>
                      <pre className={`text-xs p-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {opportunities.length}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Events Count</h4>
                      <pre className={`text-xs p-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {events.length}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Selected Opportunity</h4>
                      <pre className={`text-xs p-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-auto max-h-40`}>
                        {JSON.stringify(selectedOpportunity, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Job Recommendations</h4>
                      <pre className={`text-xs p-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-auto max-h-40`}>
                        {JSON.stringify({
                          total: jobRecommendations.length,
                          current: currentRecommendationIndex,
                          rated: ratedRecommendations.length
                        }, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Storage Mode</h4>
                      <pre className={`text-xs p-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {localStorageOnly ? 'Local Storage Only' : 'Cloud + Local Storage'}
                      </pre>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="props">
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium">Component Props</h4>
                      <p className="text-xs text-gray-500">No props available for root component</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="performance">
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium">Render Count</h4>
                      <p className="text-xs">Component render metrics would appear here</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Local Storage Usage</h4>
                      <pre className={`text-xs p-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {(() => {
                          try {
                            const usage = JSON.stringify(localStorage.getItem('captainAppState')).length;
                            return `${(usage / 1024).toFixed(2)} KB / 5MB (${((usage / (5 * 1024 * 1024)) * 100).toFixed(2)}%)`;
                          } catch (e) {
                            return "Unable to calculate";
                          }
                        })()}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Actions</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            console.log("Current state:", {
                              opportunities,
                              events,
                              selectedOpportunity,
                              activeTab
                            });
                            alert("State logged to console");
                          }}
                        >
                          Log State
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            localStorage.removeItem('captainAppState');
                            alert("Local storage cleared. Refresh to reset app.");
                          }}
                        >
                          Clear Storage
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
        
        {/* Hidden auth modal */}
        <div className="hidden">
          <AuthModal trigger={<button id="auth-modal-trigger">Sign In</button>} />
        </div>

        {/* Footer */}
        <footer className={`mt-8 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-3 sm:mb-0`}>© 2025 Hey, You're Hired!</p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                    id="footer-dark-mode"
                  />
                  <Label htmlFor="footer-dark-mode" className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </Label>
                </div>
                
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <a href="#" className={`hover:text-blue-400 mr-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Privacy</a>
                  <a href="#" className={`hover:text-blue-400 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Terms</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="h-16 w-16 bg-blue-200 rounded-full animate-pulse mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Loading You're Hired!...</h2>
      </div>
    </div>
  );
}
