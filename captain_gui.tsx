"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { QRCodeSVG } from 'qrcode.react'
import { Label } from "@/components/ui/label"

// Define JobDetailsSection component
export const JobDetailsSection = ({ opportunity, isEditing, editedDetails, setEditedDetails, handleSaveJobDetails, handleEditJobDetails, isDarkMode }) => {
  // Only show fields that have data
  const hasLocation = opportunity.location && opportunity.location.trim() !== "";
  const hasSalary = opportunity.salary && opportunity.salary.trim() !== "";
  const hasApplicationUrl = opportunity.applicationUrl && opportunity.applicationUrl.trim() !== "";
  const hasSource = opportunity.source && opportunity.source.trim() !== "";
  
  // Check if any job details exist to show the section at all
  const hasAnyDetails = hasLocation || hasSalary || hasApplicationUrl || hasSource;
  
  if (!hasAnyDetails && !isEditing) {
    return null; // Don't render the section at all if no details exist and not editing
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : ''}`}>Job Details</h3>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={handleEditJobDetails}>
            Edit
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={handleSaveJobDetails}>
            Save
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={editedDetails.location || ""}
              onChange={(e) => setEditedDetails({...editedDetails, location: e.target.value})}
              placeholder="e.g., Remote, New York, NY"
            />
          </div>
          <div>
            <Label htmlFor="salary">Salary Range</Label>
            <Input
              id="salary"
              value={editedDetails.salary || ""}
              onChange={(e) => setEditedDetails({...editedDetails, salary: e.target.value})}
              placeholder="e.g., $80,000 - $100,000"
            />
          </div>
          <div>
            <Label htmlFor="applicationUrl">Application URL</Label>
            <Input
              id="applicationUrl"
              value={editedDetails.applicationUrl || ""}
              onChange={(e) => setEditedDetails({...editedDetails, applicationUrl: e.target.value})}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={editedDetails.source || ""}
              onChange={(e) => setEditedDetails({...editedDetails, source: e.target.value})}
              placeholder="e.g., LinkedIn, Indeed, Referral"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {hasLocation && (
            <div className="flex items-start">
              <span className={`font-medium w-24 ${isDarkMode ? 'text-gray-300' : ''}`}>Location:</span>
              <span className={isDarkMode ? 'text-gray-300' : ''}>{opportunity.location}</span>
            </div>
          )}
          
          {hasSalary && (
            <div className="flex items-start">
              <span className={`font-medium w-24 ${isDarkMode ? 'text-gray-300' : ''}`}>Salary:</span>
              <span className={isDarkMode ? 'text-gray-300' : ''}>{opportunity.salary}</span>
            </div>
          )}
          
          {hasApplicationUrl && (
            <div className="flex items-start">
              <span className={`font-medium w-24 ${isDarkMode ? 'text-gray-300' : ''}`}>Apply URL:</span>
              <a 
                href={opportunity.applicationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {opportunity.applicationUrl}
              </a>
            </div>
          )}
          
          {hasSource && (
            <div className="flex items-start">
              <span className={`font-medium w-24 ${isDarkMode ? 'text-gray-300' : ''}`}>Source:</span>
              <span className={isDarkMode ? 'text-gray-300' : ''}>{opportunity.source}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Define ContactInfoSection component
export const ContactInfoSection = ({ opportunity, isEditing, editedContactInfo, setEditedContactInfo, handleSaveContactInfo, handleEditContactInfo, isDarkMode }) => {
  // Only show fields that have data
  const hasRecruiterName = opportunity.recruiterName && opportunity.recruiterName.trim() !== "";
  const hasRecruiterEmail = opportunity.recruiterEmail && opportunity.recruiterEmail.trim() !== "";
  const hasRecruiterPhone = opportunity.recruiterPhone && opportunity.recruiterPhone.trim() !== "";
  
  // Check if any contact info exists to show the section at all
  const hasAnyContactInfo = hasRecruiterName || hasRecruiterEmail || hasRecruiterPhone;
  
  if (!hasAnyContactInfo && !isEditing) {
    return null; // Don't render the section at all if no contact info exists and not editing
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : ''}`}>Contact Information</h3>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={handleEditContactInfo}>
            Edit
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={handleSaveContactInfo}>
            Save
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor="recruiterName">Contact Name</Label>
            <Input
              id="recruiterName"
              value={editedContactInfo.recruiterName || ""}
              onChange={(e) => setEditedContactInfo({...editedContactInfo, recruiterName: e.target.value})}
              placeholder="e.g., John Smith"
            />
          </div>
          <div>
            <Label htmlFor="recruiterEmail">Contact Email</Label>
            <Input
              id="recruiterEmail"
              value={editedContactInfo.recruiterEmail || ""}
              onChange={(e) => setEditedContactInfo({...editedContactInfo, recruiterEmail: e.target.value})}
              placeholder="e.g., john.smith@company.com"
            />
          </div>
          <div>
            <Label htmlFor="recruiterPhone">Contact Phone</Label>
            <Input
              id="recruiterPhone"
              value={editedContactInfo.recruiterPhone || ""}
              onChange={(e) => setEditedContactInfo({...editedContactInfo, recruiterPhone: e.target.value})}
              placeholder="e.g., (555) 123-4567"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {hasRecruiterName && (
            <div className="flex items-start">
              <span className={`font-medium w-24 ${isDarkMode ? 'text-gray-300' : ''}`}>Name:</span>
              <span className={isDarkMode ? 'text-gray-300' : ''}>{opportunity.recruiterName}</span>
            </div>
          )}
          
          {hasRecruiterEmail && (
            <div className="flex items-start">
              <span className={`font-medium w-24 ${isDarkMode ? 'text-gray-300' : ''}`}>Email:</span>
              <a 
                href={`mailto:${opportunity.recruiterEmail}`} 
                className="text-blue-600 hover:underline"
              >
                {opportunity.recruiterEmail}
              </a>
            </div>
          )}
          
          {hasRecruiterPhone && (
            <div className="flex items-start">
              <span className={`font-medium w-24 ${isDarkMode ? 'text-gray-300' : ''}`}>Phone:</span>
              <a 
                href={`tel:${opportunity.recruiterPhone}`} 
                className="text-blue-600 hover:underline"
              >
                {opportunity.recruiterPhone}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Define NotesSection component
export const NotesSection = ({ opportunity, isEditing, editedNotes, setEditedNotes, handleSaveNotes, handleEditNotes, isDarkMode }) => {
  // Only show if there are notes or we're editing
  const hasNotes = opportunity.notes && opportunity.notes.trim() !== "";
  
  if (!hasNotes && !isEditing) {
    return null; // Don't render the section at all if no notes exist and not editing
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : ''}`}>Notes</h3>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={handleEditNotes}>
            Edit
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={handleSaveNotes}>
            Save
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <Textarea
          value={editedNotes || ""}
          onChange={(e) => setEditedNotes(e.target.value)}
          placeholder="Add notes about this opportunity..."
          rows={5}
          className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
        />
      ) : (
        <div className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : ''}`}>{opportunity.notes}</div>
      )}
    </div>
  );
};
import { OpportunityDetails } from '@/components/opportunities/OpportunityDetails'
import { OpportunityList } from '@/components/opportunities/OpportunityList'
import { useDarkMode } from '@/hooks/useDarkMode'
import AddToCalendarButton from './AddToCalendarButton'
import { generateICalString } from './calendarUtils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { ThumbsUp, ThumbsDown, PlusCircle, Search, CalendarIcon, BarChart, Send, User, Bot, FileText, MessageSquare, Lock, Unlock, Maximize2, Minimize2, ChevronLeft, ChevronRight, Filter, Menu, ArrowUp, HelpCircle } from 'lucide-react'
import { BarChartIcon, PieChartIcon, LineChartIcon, ActivityIcon, Trophy, Award, Flame, Rocket, Users, Building, Home, Lightbulb, Calendar as CalendarIcon2 } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area } from 'recharts'
import { generateChatResponse, generateSuggestions } from '@/lib/openai'
import { HelpCenter } from '@/components/help/HelpCenter'
import { GuideViewer } from '@/components/help/GuideViewer'
import { useAppState } from '@/context/context'
import { Opportunity } from '@/context/types'
import { format, parseISO, isEqual, isSameDay } from 'date-fns'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { motion } from "framer-motion" // For animations

// Define prompts by status and category
const promptsByStatus = {
  // Initial Contact Category
  "Bookmarked": [
    "Analyze this job description and identify my top 3 matching qualifications and 2 areas I should strengthen before applying",
    "Create a research plan for this company including their culture, recent news, and competitors",
    "Based on this job description, what unique skills from my resume would make me stand out?",
    "What industry trends should I be familiar with before applying to this position?"
  ],
  "Interested": [
    "What specific keywords from this job description should I incorporate in my application materials?",
    "Based on my experience, what compelling achievements should I emphasize for this role?",
    "Generate 5 tailored questions I should research about this company before applying",
    "How does my career trajectory align with this role, and how should I frame this narrative?"
  ],
  "Recruiter Contact": [
    "Help me draft a professional response to the recruiter that highlights my interest and qualifications",
    "What specific questions should I ask the recruiter about this role and company?",
    "How should I prepare for an initial screening call with the recruiter?",
    "What salary range research should I do before discussing compensation with this recruiter?"
  ],
  "Networking": [
    "Help me craft a networking message to connect with employees at this company",
    "What questions should I ask during an informational interview about this role?",
    "How can I leverage my existing network to get an introduction at this company?",
    "Draft a follow-up thank you message after a networking conversation"
  ],
  // Application Category
  "Preparing Application": [
    "Tailor my resume for this specific job by highlighting relevant experience and using keywords from the description",
    "Draft a compelling cover letter that addresses why I'm interested in this role and company",
    "What portfolio pieces or work samples should I prepare to showcase for this application?",
    "How should I address potential gaps in my qualifications in my application materials?"
  ],
  "Applied": [
    "What follow-up strategy should I use after submitting this application?",
    "Help me prepare a 30-second elevator pitch about why I'm perfect for this role",
    "Draft a follow-up email to send if I don't hear back within two weeks",
    "What additional research should I do now to prepare for a potential interview?"
  ],
  "Application Acknowledged": [
    "Draft a response thanking them for acknowledging my application",
    "What should I do to prepare while waiting to hear back about next steps?",
    "How long should I wait before following up on my application status?",
    "What can I research about their interview process based on online reviews?"
  ],
  // Interview Process Category
  "Screening": [
    "What are the most common screening interview questions and how should I answer them?",
    "How should I prepare for a phone screening interview for this position?",
    "Draft concise answers to 'Tell me about yourself' and 'Why are you interested in this role?'",
    "What questions should I ask during a screening interview to stand out?"
  ],
  "Technical Assessment": [
    "What skills is this technical assessment likely testing and how should I prepare?",
    "Help me create a study plan for this technical assessment based on the job requirements",
    "What common mistakes should I avoid during this type of technical assessment?",
    "How should I approach time management during the technical assessment?"
  ],
  "First Interview": [
    "What are the most important questions to prepare for in a first interview for this role?",
    "Help me prepare the STAR method answers for likely behavioral questions",
    "What should I research about the team and interviewer before this first interview?",
    "Draft powerful questions to ask at the end of my first interview that demonstrate my interest and research"
  ],
  "Second Interview": [
    "How should my approach differ in a second interview compared to the first?",
    "What deeper questions about the role and team should I prepare to ask?",
    "Help me prepare to discuss salary expectations if asked during this round",
    "What case studies or specific examples should I prepare to discuss in more detail?"
  ],
  "Final Interview": [
    "How should I prepare differently for a final interview with senior leadership?",
    "What questions should I ask about company vision and how my role contributes?",
    "Help me prepare to discuss compensation package details and negotiation points",
    "What closing statement should I prepare to reinforce my interest and fit for the role?"
  ],
  "Reference Check": [
    "How should I prepare my references for calls from this employer?",
    "What information should I provide to my references about this specific role?",
    "Draft an email to send to my references with details about this position",
    "What does it typically mean when a company is checking references at this stage?"
  ],
  // Decision Category
  "Negotiating": [
    "How should I negotiate the salary offer based on market research and my experience?",
    "What benefits beyond salary should I prioritize in negotiations?",
    "Help me draft a professional counter-offer email that maintains positive relations",
    "What's the best approach to negotiate remote work or flexible schedule arrangements?"
  ],
  "Offer Received": [
    "What questions should I ask to fully understand the compensation package?",
    "Help me evaluate this offer against my career goals and other opportunities",
    "What is a reasonable timeframe to request for making my decision?",
    "Draft a professional email asking for clarification on specific benefits or terms"
  ],
  "Offer Accepted": [
    "What should I do to prepare for my first day in this new role?",
    "Help me draft a graceful resignation letter for my current employer",
    "What questions should I ask HR before my start date?",
    "How should I approach the first 30/60/90 days in this new position?"
  ],
  "Offer Declined": [
    "Help me draft a professional email declining the offer while maintaining the relationship",
    "What feedback should I provide when declining this offer?",
    "How can I keep the door open for future opportunities with this company?",
    "What should I learn from this process to improve my job search going forward?"
  ],
  "Rejected": [
    "What can I learn from this rejection to improve future applications?",
    "Help me draft a professional email asking for feedback on my application/interview",
    "How should I evaluate if I should apply to other positions at this company?",
    "What skills or experiences should I focus on developing based on this rejection?"
  ],
  "Withdrawn": [
    "Help me draft a professional email withdrawing my application",
    "How can I maintain a positive relationship with this company for the future?",
    "What should I learn from this experience to refine my job search criteria?",
    "Should I provide feedback about why I'm withdrawing my application?"
  ],
  "Position Filled": [
    "What follow-up would be appropriate to stay on their radar for future opportunities?",
    "How can I use this experience to improve my applications for similar roles?",
    "Should I connect with the hiring manager on LinkedIn despite not getting the role?",
    "What similar companies should I target based on my interest in this position?"
  ],
  "Position Cancelled": [
    "What might this cancellation indicate about the company that could inform my job search?",
    "Should I follow up to express continued interest in future opportunities?",
    "What similar positions should I look for based on my interest in this role?",
    "How should I adjust my job search strategy based on this experience?"
  ],
  // Follow-up Category
  "Following Up": [
    "Help me draft a professional follow-up email that adds value and reiterates my interest",
    "What is the appropriate timing for following up after each interview stage?",
    "How can I follow up without seeming desperate or pushy?",
    "What additional information or materials could I provide in my follow-up to strengthen my candidacy?"
  ],
  "Waiting": [
    "What productive activities should I focus on while waiting to hear back?",
    "When would be an appropriate time to follow up on my application status?",
    "Help me draft a check-in email that's professional and demonstrates continued interest",
    "How should I manage my expectations during this waiting period?"
  ]
};

const promptsByCategory = {
  "Initial Contact": [
    "What company values are evident in their materials and how do they align with my experience?",
    "Create a competitive analysis of how I compare to likely other candidates for this position",
    "What specialized knowledge or certifications would give me an edge for this role?",
    "Based on the company's size and industry, what challenges might they be facing that I can help solve?"
  ],
  "Application": [
    "Transform my resume to explicitly match this job description while highlighting my unique value",
    "Create a compelling cover letter that tells a story connecting my experience to their needs",
    "What metrics and achievements should I quantify differently for this specific application?",
    "Identify the top 5 most relevant projects from my experience to emphasize for this role"
  ],
  "Interview Process": [
    "Prepare me for the 10 most likely technical questions for this role based on the job description",
    "How should I structure my answers to behavioral questions using the STAR method?",
    "What research about this company would impress interviewers with my preparation?",
    "Help me craft a compelling story about my career path that positions this role as the perfect next step"
  ],
  "Decision": [
    "What factors should I consider when evaluating this opportunity against my career goals?",
    "How should I approach salary negotiation for this specific industry and role level?",
    "What questions should I ask to better understand growth opportunities at this company?",
    "Help me create a decision matrix to objectively evaluate this opportunity"
  ],
  "Follow-up": [
    "What value-adding content could I include in my follow-up communications?",
    "How can I maintain a relationship with this company even if this opportunity doesn't work out?",
    "Draft a check-in email that demonstrates my continued interest without being pushy",
    "What is the appropriate cadence for following up at different stages of the hiring process?"
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

export default function CAPTAINGui() {
  const { state, dispatch } = useAppState();
  const { opportunities, masterResume, events, chatMessages } = state;
  
  const [isClientSide, setIsClientSide] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("opportunities")
  const [helpView, setHelpView] = useState<{ active: boolean; guideId?: string; sectionId?: string }>({ active: false });
  
  
  // Set client-side flag after initial render
  useEffect(() => {
    setIsClientSide(true);
  }, []);
  const [selectedOpportunityIndex, setSelectedOpportunityIndex] = useState(0)
  const [isMasterResumeFrozen, setIsMasterResumeFrozen] = useState(false)
  const [isEditingJobDescription, setIsEditingJobDescription] = useState(false)
  const [editedJobDescription, setEditedJobDescription] = useState("")
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [editedDate, setEditedDate] = useState("")
  const [currentMessage, setCurrentMessage] = useState("")
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [lastModifiedTimestamps, setLastModifiedTimestamps] = useState({});
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] = useState(false);
  
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

  const quickChatOptions = [
    "Analyze my resume",
    "Suggest skills to improve",
    "How to prepare for interviews",
    "Tips for salary negotiation"
  ];

  const [jobRecommendations, setJobRecommendations] = useState([
    { id: 1, company: "TechGiant", position: "Senior Frontend Developer", description: "TechGiant is seeking a Senior Frontend Developer to lead our web application team. The ideal candidate will have 5+ years of experience with React, TypeScript, and state management libraries. You'll be responsible for architecting scalable frontend solutions and mentoring junior developers." },
    { id: 2, company: "DataDrive", position: "Machine Learning Engineer", description: "DataDrive is looking for a Machine Learning Engineer to join our AI research team. You'll work on cutting-edge projects involving natural language processing and computer vision. Strong background in Python, PyTorch or TensorFlow, and experience with large language models is required." },
    { id: 3, company: "CloudScale", position: "DevOps Engineer", description: "CloudScale needs a DevOps Engineer to streamline our CI/CD pipelines and manage our cloud infrastructure. Experience with AWS, Kubernetes, and Infrastructure as Code (e.g., Terraform) is essential. You'll be responsible for maintaining high availability and scalability of our services." }
  ]);
  
  // Define selectedOpportunity before any useEffect that uses it
  const selectedOpportunity = opportunities.length > 0 ? opportunities[selectedOpportunityIndex] : undefined;

  // Helper function to open a specific guide
  const openGuide = useCallback((guideId: string, sectionId?: string) => {
    setActiveTab('help');
    setHelpView({ active: true, guideId, sectionId });
  }, []);

  // Helper function to get prompts based on status
  const getPromptsForStatus = (status) => {
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
    
    // Return 2 from status and 2 from category (if available)
    const selectedStatusPrompts = statusPrompts.sort(() => 0.5 - Math.random()).slice(0, 2);
    const selectedCategoryPrompts = categoryPrompts
      .filter(prompt => !selectedStatusPrompts.includes(prompt))
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
      
    return [...selectedStatusPrompts, ...selectedCategoryPrompts];
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
        setAiPrompts(getPromptsForStatus(selectedOpportunity.status));
        setIsLoadingPrompts(false);
      }, 300);
    }
  }, [selectedOpportunity]);

  // Generate analytics data using useMemo to prevent recalculation on every render
  const analytics = useMemo(() => {
    // Status distribution
    const statusCounts = opportunities.reduce((acc, opp) => {
      acc[opp.status] = (acc[opp.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Application timeline (applications per week)
    const applicationsByWeek = opportunities.reduce((acc, opp) => {
      const date = new Date(opp.appliedDate);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      acc[weekKey] = (acc[weekKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array format for charts
    const applicationTimeline = Object.entries(applicationsByWeek)
      .map(([date, count]) => ({ 
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        count 
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8); // Last 8 weeks
    
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
      applicationsByWeek,
      applicationTimeline,
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
    
    const newOpp = {
      ...newOpportunity,
      id: opportunities.length + 1,
      appliedDate: formattedDate,
      resume: masterResume, // Use the master resume for the new opportunity
    };
    
    // Use dispatch instead of setState
    dispatch({ type: 'ADD_OPPORTUNITY', payload: newOpp });
    
    // Update last modified timestamp
    updateLastModified(newOpp.id);
    
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
    <div className={`container mx-auto p-2 sm:p-4 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} min-h-screen flex flex-col`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="You're Hired Logo" 
              className="h-10 w-10 mr-2" 
              style={{ 
                objectFit: 'contain',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">You're Hired!</h1>
          </div>
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
        </div>
        <div className="block md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80vw] sm:w-[350px]">
              <div className="py-4">
                <h2 className="text-lg font-semibold mb-4">Navigation</h2>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant={activeTab === "opportunities" ? "default" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("opportunities")}
                  >
                    Opportunities
                  </Button>
                  <Button 
                    variant={activeTab === "resume" ? "default" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("resume")}
                  >
                    Master Resume
                  </Button>
                  <Button 
                    variant={activeTab === "captain" ? "default" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("captain")}
                  >
                    Coach
                  </Button>
                  <Button 
                    variant={activeTab === "analytics" ? "default" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("analytics")}
                  >
                    Analytics
                  </Button>
                  <Button 
                    variant={activeTab === "calendar" ? "default" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("calendar")}
                  >
                    Calendar
                  </Button>
                  <Button 
                    variant={activeTab === "help" ? "default" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("help")}
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Help
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        if (value === 'help') {
          setHelpView({ active: true });
        } else {
          setHelpView({ active: false });
        }
      }} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md flex-grow flex flex-col`}>
        <TabsList className={`mb-4 p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} rounded-t-lg sticky top-0 z-10 flex w-full justify-center`}>
          <div className="flex space-x-1">
            <TabsTrigger value="opportunities" className={`px-3 sm:px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white ${isDarkMode ? 'text-gray-200 hover:text-white' : ''}`}>Opportunities</TabsTrigger>
            <TabsTrigger value="resume" className={`px-3 sm:px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white ${isDarkMode ? 'text-gray-200 hover:text-white' : ''}`}>Master Resume</TabsTrigger>
            <TabsTrigger value="captain" className={`px-3 sm:px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white ${isDarkMode ? 'text-gray-200 hover:text-white' : ''}`}>Coach</TabsTrigger>
            <TabsTrigger value="analytics" className={`px-3 sm:px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white ${isDarkMode ? 'text-gray-200 hover:text-white' : ''}`}>Analytics</TabsTrigger>
            <TabsTrigger value="calendar" className={`px-3 sm:px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white ${isDarkMode ? 'text-gray-200 hover:text-white' : ''}`}>Calendar</TabsTrigger>
            <TabsTrigger value="help" className={`px-3 sm:px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white ${isDarkMode ? 'text-gray-200 hover:text-white' : ''}`}>
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="opportunities" className="p-2 sm:p-4 flex-grow overflow-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-700">Job Opportunities</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Opportunity
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add New Opportunity</DialogTitle>
                  <DialogDescription>Enter the details of your new job opportunity</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="sm:text-right">Company</Label>
                    <Input
                      id="company"
                      className="col-span-1 sm:col-span-3"
                      value={newOpportunity.company}
                      onChange={handleNewOpportunityChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="position" className="sm:text-right">Position</Label>
                    <Input
                      id="position"
                      className="col-span-1 sm:col-span-3"
                      value={newOpportunity.position}
                      onChange={handleNewOpportunityChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="sm:text-right">Location</Label>
                    <Input
                      id="location"
                      className="col-span-1 sm:col-span-3"
                      value={newOpportunity.location}
                      onChange={handleNewOpportunityChange}
                      placeholder="e.g., Remote, New York, NY"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="salary" className="sm:text-right">Salary Range</Label>
                    <Input
                      id="salary"
                      className="col-span-1 sm:col-span-3"
                      value={newOpportunity.salary}
                      onChange={handleNewOpportunityChange}
                      placeholder="e.g., $80,000 - $100,000"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="applicationUrl" className="sm:text-right">Application URL</Label>
                    <Input
                      id="applicationUrl"
                      className="col-span-1 sm:col-span-3"
                      value={newOpportunity.applicationUrl}
                      onChange={handleNewOpportunityChange}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="source" className="sm:text-right">Source</Label>
                    <Input
                      id="source"
                      className="col-span-1 sm:col-span-3"
                      value={newOpportunity.source}
                      onChange={handleNewOpportunityChange}
                      placeholder="e.g., LinkedIn, Indeed, Referral"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="jobDescription" className="sm:text-right">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      className="col-span-1 sm:col-span-3 font-mono whitespace-pre-wrap"
                      value={newOpportunity.jobDescription}
                      onChange={handleNewOpportunityChange}
                      rows={10}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="sm:text-right">Status</Label>
                    <Select onValueChange={handleNewOpportunityStatusChange} value={newOpportunity.status}>
                      <SelectTrigger className="col-span-1 sm:col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="select-category-label">Initial Contact</SelectLabel>
                          <SelectItem value="Bookmarked">Bookmarked</SelectItem>
                          <SelectItem value="Interested">Interested</SelectItem>
                          <SelectItem value="Recruiter Contact">Recruiter Contact</SelectItem>
                          <SelectItem value="Networking">Networking</SelectItem>
                        </SelectGroup>
                        
                        <SelectGroup>
                          <SelectLabel className="select-category-label">Application</SelectLabel>
                          <SelectItem value="Preparing Application">Preparing Application</SelectItem>
                          <SelectItem value="Applied">Applied</SelectItem>
                          <SelectItem value="Application Acknowledged">Application Acknowledged</SelectItem>
                        </SelectGroup>
                        
                        <SelectGroup>
                          <SelectLabel className="select-category-label">Interview Process</SelectLabel>
                          <SelectItem value="Screening">Screening</SelectItem>
                          <SelectItem value="Technical Assessment">Technical Assessment</SelectItem>
                          <SelectItem value="First Interview">First Interview</SelectItem>
                          <SelectItem value="Second Interview">Second Interview</SelectItem>
                          <SelectItem value="Final Interview">Final Interview</SelectItem>
                          <SelectItem value="Reference Check">Reference Check</SelectItem>
                        </SelectGroup>
                        
                        <SelectGroup>
                          <SelectLabel className="select-category-label">Decision</SelectLabel>
                          <SelectItem value="Negotiating">Negotiating</SelectItem>
                          <SelectItem value="Offer Received">Offer Received</SelectItem>
                          <SelectItem value="Offer Accepted">Offer Accepted</SelectItem>
                          <SelectItem value="Offer Declined">Offer Declined</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                          <SelectItem value="Position Filled">Position Filled</SelectItem>
                          <SelectItem value="Position Cancelled">Position Cancelled</SelectItem>
                        </SelectGroup>
                        
                        <SelectGroup>
                          <SelectLabel className="select-category-label">Follow-up</SelectLabel>
                          <SelectItem value="Following Up">Following Up</SelectItem>
                          <SelectItem value="Waiting">Waiting</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="appliedDate" className="sm:text-right">Date</Label>
                    <div className="col-span-1 sm:col-span-3">
                      <Input
                        id="appliedDate"
                        type="date"
                        value={newOpportunity.appliedDate || new Date().toISOString().split('T')[0]}
                        onChange={handleNewOpportunityChange}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {newOpportunity.status === "Interested" ? "Date added" : "Date applied"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Show recruiter fields if status is Recru  iter Contact */}
                  {(newOpportunity.status === "Recruiter Contact" || newOpportunity.status ===  "Networking") && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="recruiterName" className="sm:text-right">Contact Name</Label>
                        <Input
                          id="recruiterName"
                          className="col-span-1 sm:col-span-3"
                          value={newOpportunity.recruiterName || ""}
                          onChange={handleNewOpportunityChange}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="recruiterEmail" className="sm:text-right">Contact Email</Label>
                        <Input
                          id="recruiterEmail"
                          className="col-span-1 sm:col-span-3"
                          value={newOpportunity.recruiterEmail || ""}
                          onChange={handleNewOpportunityChange}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="recruiterPhone" className="sm:text-right">Contact Phone</Label>
                        <Input
                          id="recruiterPhone"
                          className="col-span-1 sm:col-span-3"
                          value={newOpportunity.recruiterPhone || ""}
                          onChange={handleNewOpportunityChange}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="sm:text-right">Notes</Label>
                    <Textarea
                      id="notes"
                      className="col-span-1 sm:col-span-3"
                      value={newOpportunity.notes || ""}
                      onChange={handleNewOpportunityChange}
                      placeholder="Add any additional notes about this opportunity"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button type="submit" onClick={handleSaveNewOpportunity} className="w-full sm:w-auto">Save Opportunity</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
            <OpportunityList
              opportunities={opportunities}
              selectedOpportunityIndex={selectedOpportunityIndex}
              setSelectedOpportunityIndex={setSelectedOpportunityIndex}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              viewMode={viewMode}
              setViewMode={setViewMode}
              lastModifiedTimestamps={lastModifiedTimestamps}
              isBatchSelectMode={isBatchSelectMode}
              setIsBatchSelectMode={setIsBatchSelectMode}
              selectedJobIds={selectedJobIds}
              toggleJobSelection={toggleJobSelection}
              handleBatchDelete={handleBatchDelete}
              isDarkMode={isDarkMode}
            />

            <Card 
              className={`col-span-1 md:col-span-2 flex flex-col order-1 md:order-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              {selectedOpportunity ? (
                <OpportunityDetails
                  opportunity={selectedOpportunity}
                  updateOpportunity={updateOpportunity}
                  deleteOpportunity={(id) => {
                    if (window.confirm("Are you sure you want to delete this opportunity?")) {
                      dispatch({ type: 'DELETE_OPPORTUNITY', payload: id });
                      if (opportunities.length > 1) {
                        setSelectedOpportunityIndex(0);
                      }
                    }
                  }}
                  isDarkMode={isDarkMode}
                  chatMessages={opportunityMessages}
                  handleSendMessage={handleSendMessage}
                  currentMessage={currentMessage}
                  setCurrentMessage={setCurrentMessage}
                  suggestions={suggestions}
                  isMasterResumeFrozen={isMasterResumeFrozen}
                  setIsMasterResumeFrozen={setIsMasterResumeFrozen}
                  updateMasterResume={(resume) => {
                    dispatch({
                      type: 'UPDATE_MASTER_RESUME',
                      payload: resume
                    });
                  }}
                  openGuide={openGuide}
                  JobDetailsSection={JobDetailsSection}
                  ContactInfoSection={ContactInfoSection}
                  NotesSection={NotesSection}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <FileText className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
                    <h3 className={`text-xl font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No opportunity selected</h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Select an opportunity from the list or add a new one</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resume" className="p-2 sm:p-4 flex-grow overflow-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-700">Master Resume</h2>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => {
                if (window.confirm("Are you sure you want to update all job applications with this master resume? This will overwrite any customized resumes.")) {
                  // Update all opportunities that aren't frozen
                  opportunities.forEach(opp => {
                    dispatch({
                      type: 'UPDATE_OPPORTUNITY',
                      payload: {
                        id: opp.id,
                        updates: { resume: masterResume }
                      }
                    });
                  });
                }
              }} className="w-full sm:w-auto">
                Sync All Applications
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Master Resume</CardTitle>
                <CardDescription>
                  This is your master resume that will be used as a template for new job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={masterResume}
                  onChange={(e) => {
                    dispatch({
                      type: 'UPDATE_MASTER_RESUME',
                      payload: e.target.value
                    });
                  }}
                  className="font-mono whitespace-pre-wrap"
                  rows={20}
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Resume Tips</CardTitle>
                <CardDescription>
                  Suggestions to improve your master resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-1">Quantify Your Achievements</h3>
                    <p className="text-sm">Use numbers and percentages to demonstrate your impact. For example, "Increased website traffic by 45%" is more impactful than "Increased website traffic".</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-1">Use Action Verbs</h3>
                    <p className="text-sm">Start bullet points with strong action verbs like "Developed," "Implemented," or "Managed" rather than passive phrases.</p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h3 className="font-medium text-purple-800 mb-1">Tailor to Job Descriptions</h3>
                    <p className="text-sm">Customize your resume for each application by matching keywords from the job description. This helps with applicant tracking systems.</p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-1">Keep It Concise</h3>
                    <p className="text-sm">Aim for a 1-2 page resume. Focus on relevant experience and remove outdated or irrelevant information.</p>
                  </div>
                  
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h3 className="font-medium text-red-800 mb-1">Proofread Carefully</h3>
                    <p className="text-sm">Typos and grammatical errors can immediately disqualify you. Have someone else review your resume before submitting.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="captain" className="p-2 sm: p-4 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-700">Career Coach</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-2 flex flex-col h-[calc(100vh-250px)]">
              <CardHeader>
                <CardTitle>Chat with Coach</CardTitle>
                <CardDescription>
                  Ask for career advice, job search strategies, or help with your applications
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden flex flex-col">
                <div className={`flex-grow overflow-y-auto mb-4 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                  <div className="mb-4">
                    <div className="flex items-start">
                      <div className={`${isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'} p-3 rounded-lg max-w-[90%] sm:max-w-[80%]`}>
                        <div className="flex items-center mb-1">
                          <Bot className="h-3 w-3 mr-1" />
                          <span className="text-xs font-medium">Coach</span>
                        </div>
                        <p>Hello! I'm Captain, your AI career assistant. How can I help you with your job search today?</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* This would be populated with actual chat messages in a real implementation */}
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Textarea
                    placeholder="Ask Captain anything about your job search..."
                    className="flex-grow"
                  />
                  <Button className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>AI Job Recommendations</CardTitle>
                <CardDescription>
                  Rate these opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg">Senior Frontend Developer</h3>
                    <p className="text-sm font-medium text-blue-700 mb-2">TechGiant</p>
                    <div className="max-h-64 overflow-y-auto mb-4">
                      <p className="text-sm whitespace-pre-wrap">
                        TechGiant is seeking a Senior Frontend Developer to lead our web application team. 
                        The ideal candidate will have 5+ years of experience with React, TypeScript, and 
                        state management libraries. You'll be responsible for architecting scalable 
                        frontend solutions and mentoring junior developers.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-gray-500 w-full sm:w-auto"
                      >
                        Skip
                      </Button>
                      
                      <div className="flex space-x-2 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 border-red-200 hover:bg-red-50 flex-1 sm:flex-auto"
                        >
                          <ThumbsDown className="h-5 w-5 mr-1" />
                          Not Interested
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-500 border-green-200 hover:bg-green-50 flex-1 sm:flex-auto"
                        >
                          <ThumbsUp className="h-5 w-5 mr-1" />
                          Interested
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="p-2 sm:p-4 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-700">Analytics Dashboard</h2>
          </div>
          
          {/* Job Search Level Card */}
          <Card className="col-span-1 sm:col-span-2 lg:col-span-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Job Search Level: {analytics.jobSearchStats.level}</h3>
                  <p className="text-sm opacity-90">Score: {analytics.jobSearchStats.totalScore} points</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Trophy className="h-8 w-8 text-yellow-300" />
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-white/30 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-300 h-2.5 rounded-full" 
                    style={{ width: `${analytics.jobSearchStats.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 text-white/80">
                  {analytics.jobSearchStats.nextLevelScore - analytics.jobSearchStats.totalScore} points to level {analytics.jobSearchStats.level + 1}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Applications</p>
                    <h3 className="text-2xl sm:text-3xl font-bold">{analytics.totalApplications}</h3>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
                {analytics.totalApplications === 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Start tracking your job applications to see analytics
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Applications</p>
                    <h3 className="text-2xl sm:text-3xl font-bold">{analytics.activeApplications}</h3>
                  </div>
                  <ActivityIcon className="h-8 w-8 text-green-500" />
                </div>
                {analytics.totalApplications > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {((analytics.activeApplications / analytics.totalApplications) * 100).toFixed(0)}% of your applications are still active
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Response Rate</p>
                    <h3 className="text-2xl sm:text-3xl font-bold">{analytics.responseRate}%</h3>
                  </div>
                  <BarChartIcon className="h-8 w-8 text-purple-500" />
                </div>
                {analytics.responseRate === '0' && analytics.totalApplications > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    No responses yet. Keep applying and following up!
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">This Week</p>
                    <h3 className="text-2xl sm:text-3xl font-bold">{analytics.weeklyApplicationCount}</h3>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-orange-500" />
                </div>
                {analytics.weeklyApplicationCount === 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    No applications this week. Set a goal to apply daily!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Distribution of your applications by status</CardDescription>
              </CardHeader>
              <CardContent className="h-60 sm:h-80">
                {Object.keys(analytics.statusCounts).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(analytics.statusCounts).map(([status, count]) => ({
                          name: status,
                          value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(analytics.statusCounts).map(([status, _], index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[status] || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={`h-full flex items-center justify-center text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div>
                      <PieChartIcon className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p>Add job applications to see status distribution</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
                <CardDescription>Number of applications over time</CardDescription>
              </CardHeader>
              <CardContent className="h-60 sm:h-80">
                {analytics.applicationTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics.applicationTimeline}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={`h-full flex items-center justify-center text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div>
                      <LineChartIcon className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p>Add more applications to see your timeline</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>How your applications progress through the hiring process</CardDescription>
              </CardHeader>
              <CardContent className="h-48 sm:h-64">
                {analytics.totalApplications > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { name: 'Applied', value: analytics.totalApplications },
                        { name: 'Response', value: parseInt(analytics.responseRate) * analytics.totalApplications / 100 },
                        { name: 'Interview', value: parseInt(analytics.interviewRate) * parseInt(analytics.responseRate) * analytics.totalApplications / 10000 },
                        { name: 'Offer', value: parseInt(analytics.offerRate) * parseInt(analytics.interviewRate) * parseInt(analytics.responseRate) * analytics.totalApplications / 1000000 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {[
                          <Cell key="cell-0" fill="#3b82f6" />,
                          <Cell key="cell-1" fill="#10b981" />,
                          <Cell key="cell-2" fill="#f59e0b" />,
                          <Cell key="cell-3" fill="#ef4444" />
                        ]}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={`h-full flex items-center justify-center text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div>
                      <BarChartIcon className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p>Add applications to see your conversion funnel</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Important statistics about your job search</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Interview Rate</span>
                    <span className="font-bold">{analytics.interviewRate}%</span>
                  </div>
                  <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${analytics.interviewRate}%` }}></div>
                  </div>
                  {analytics.interviewRate === '0' && analytics.totalApplications > 0 && (
                    <div className="text-xs text-gray-500">
                      Keep applying! Interviews typically come after 10-15 applications.
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Offer Rate</span>
                    <span className="font-bold">{analytics.offerRate}%</span>
                  </div>
                  <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${analytics.offerRate}%` }}></div>
                  </div>
                  {analytics.offerRate === '0' && analytics.interviewRate !== '0' && (
                    <div className="text-xs text-gray-500">
                      Keep interviewing! Offers typically come after 3-5 interviews.
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Application Streak</span>
                    <span className="font-bold">{calculateStreak(opportunities)} days</span>
                  </div>
                  <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${Math.min(calculateStreak(opportunities) * 10, 100)}%` }}></div>
                  </div>
                  {calculateStreak(opportunities) === 0 && (
                    <div className="text-xs text-gray-500">
                      Apply today to start your streak!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Achievements Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Unlock badges by reaching job search milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {analytics.achievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`p-3 rounded-lg border ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' 
                        : `${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`p-2 rounded-full ${
                        achievement.unlocked 
                          ? 'bg-yellow-400' 
                          : `${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`
                      }`}>
                        {achievement.icon === 'Trophy' && <Trophy className={`h-5 w-5 ${
                          achievement.unlocked ? 'text-white' : `${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`
                        }`} />}
                        {achievement.icon === 'Rocket' && <Rocket className={`h-5 w-5 ${
                          achievement.unlocked ? 'text-white' : `${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`
                        }`} />}
                        {achievement.icon === 'Flame' && <Flame className={`h-5 w-5 ${
                          achievement.unlocked ? 'text-white' : `${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`
                        }`} />}
                        {achievement.icon === 'Users' && <Users className={`h-5 w-5 ${
                          achievement.unlocked ? 'text-white' : `${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`
                        }`} />}
                        {achievement.icon === 'Award' && <Award className={`h-5 w-5 ${
                          achievement.unlocked ? 'text-white' : `${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`
                        }`} />}
                        {achievement.icon === 'CalendarIcon2' && <CalendarIcon2 className={`h-5 w-5 ${
                          achievement.unlocked ? 'text-white' : `${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`
                        }`} />}
                      </div>
                      <span className={`mt-2 font-medium text-sm ${
                        achievement.unlocked ? 'text-amber-800' : `${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                      }`}>
                        {achievement.name}
                      </span>
                      <p className={`text-xs mt-1 ${
                        achievement.unlocked ? 'text-amber-700' : `${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`
                      }`}>
                        {achievement.description}
                      </p>
                      <div className="mt-2 w-full">
                        <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5`}>
                          <div 
                            className={`${achievement.unlocked ? 'bg-yellow-400' : 'bg-blue-500'} h-1.5 rounded-full`} 
                            style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1 text-center">
                          {achievement.progress}/{achievement.total}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Weekly Challenges Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Weekly Challenges</CardTitle>
                    <CardDescription>Complete challenges to earn points</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Resets Sunday
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.weeklyChallenges.map(challenge => (
                    <div key={challenge.id} className="p-3 border rounded-lg flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        {challenge.icon === 'Send' && <Send className="h-5 w-5 text-blue-600" />}
                        {challenge.icon === 'Users' && <Users className="h-5 w-5 text-blue-600" />}
                        {challenge.icon === 'Award' && <Award className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-sm">{challenge.name}</h4>
                        <p className="text-xs text-gray-500">{challenge.description}</p>
                        <div className={`mt-1 w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5`}>
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">{challenge.progress}/{challenge.target}</span>
                          <span className="text-xs font-medium text-blue-600">Reward: {challenge.reward}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity Patterns</CardTitle>
                <CardDescription>Your most and least active days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between mb-4">
                  <div className="p-3 bg-green-50 rounded-lg mb-3 sm:mb-0">
                    <h4 className="text-sm font-medium text-green-800">Most Active Day</h4>
                    <div className="flex items-center mt-1">
                      <CalendarIcon2 className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-lg font-bold text-green-700">{analytics.weeklyPatterns.mostActiveDay.day}</span>
                      <span className="ml-2 text-sm text-green-600">({analytics.weeklyPatterns.mostActiveDay.count} activities)</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <h4 className="text-sm font-medium text-amber-800">Least Active Day</h4>
                    <div className="flex items-center mt-1">
                      <CalendarIcon2 className="h-5 w-5 text-amber-600 mr-2" />
                      <span className="text-lg font-bold text-amber-700">{analytics.weeklyPatterns.leastActiveDay.day}</span>
                      <span className="ml-2 text-sm text-amber-600">({analytics.weeklyPatterns.leastActiveDay.count} activities)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Activity Heatmap</h4>
                  <div className="flex justify-between">
                    {analytics.weeklyPatterns.activityByDay.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="w-8 rounded-t-md" 
                          style={{ 
                            backgroundColor: `rgba(59, 130, 246, ${Math.min(day.count / 5, 1)})`,
                            height: `${Math.max(day.count * 10, 5)}px`
                          }}
                        ></div>
                        <span className="text-xs mt-1">{day.day.substring(0, 3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Job Search Insights Section */}
          {analytics.jobSearchInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Job Search Insights</CardTitle>
                <CardDescription>Personalized insights based on your application patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.jobSearchInsights.map((insight, index) => (
                    <div key={index} className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-start">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                          <Lightbulb className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-800">{insight.title}</h4>
                          <p className="text-sm text-purple-700 mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="p-2 sm:p-4 flex-grow overflow-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-700">Calendar</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                  <DialogDescription>Create a new event for your job search calendar</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="sm:text-right">Title</Label>
                    <Input
                      id="title"
                      className="col-span-1 sm:col-span-3"
                      value={newEvent.title}
                      onChange={handleNewEventChange}
                      placeholder="e.g., Interview with Company X"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="sm:text-right">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      className="col-span-1 sm:col-span-3"
                      value={newEvent.date}
                      onChange={handleNewEventChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="sm:text-right">Event Type</Label>
                    <Select onValueChange={handleNewEventTypeChange} value={newEvent.type}>
                      <SelectTrigger className="col-span-1 sm:col-span-3">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="assessment">Technical Assessment</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="opportunityId" className="sm:text-right">Related Job</Label>
                    <Select onValueChange={handleNewEventOpportunityChange} value={newEvent.opportunityId}>
                      <SelectTrigger className="col-span-1 sm:col-span-3">
                        <SelectValue placeholder="Select related job" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {opportunities.map(opp => (
                          <SelectItem key={opp.id} value={opp.id.toString()}>
                            {opp.company} - {opp.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="sm:text-right">Notes</Label>
                    <Textarea
                      id="notes"
                      className="col-span-1 sm:col-span-3"
                      value={newEvent.notes}
                      onChange={handleNewEventChange}
                      placeholder="Add any additional notes about this event"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button type="submit" onClick={handleSaveNewEvent} className="w-full sm:w-auto">Save Event</Button>
                </DialogFooter>
                
                <style jsx>{`
                  .qr-container {
                    transition: all 0.3s ease;
                    position: relative;
                  }
                  
                  .qr-container:after {
                    content: '';
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    right: -5px;
                    bottom: -5px;
                    border-radius: 12px;
                    background: rgba(59, 130, 246, 0.1);
                    z-index: -1;
                    opacity: 0;
                    animation: pulse 2s infinite;
                  }
                  
                  @keyframes pulse {
                    0% {
                      transform: scale(0.95);
                      opacity: 0;
                    }
                    70% {
                      transform: scale(1);
                      opacity: 0.6;
                    }
                    100% {
                      transform: scale(0.95);
                      opacity: 0;
                    }
                  }
                `}</style>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
            <Card className="col-span-1 md:col-span-5 order-2 md:order-1">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle>Calendar</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const today = new Date();
                        setDate(today);
                        
                        if (calendarView === "week") {
                          // Set week start date to the Sunday of the current week
                          const weekStart = new Date(today);
                          weekStart.setDate(today.getDate() - today.getDay());
                          setWeekStartDate(weekStart);
                        }
                      }} 
                      className={`${isDarkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}
                    >
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Today
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCalendarView("month")} 
                      className={`${calendarView === "month" ? (isDarkMode ? "bg-blue-800/50 text-blue-100" : "bg-blue-100") : ""} w-full sm:w-auto ${isDarkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : ''}`}
                    >
                      Month
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setCalendarView("week");
                        // Set the week start date based on the current selected date
                        const currentDate = new Date(date);
                        currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Set to Sunday
                        setWeekStartDate(currentDate);
                      }} 
                      className={`${calendarView === "week" ? (isDarkMode ? "bg-blue-800/50 text-blue-100" : "bg-blue-100") : ""} w-full sm:w-auto ${isDarkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : ''}`}
                    >
                      Week
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : ''}`}>
                  {/* Calendar navigation header */}
                  <div className="flex items-center justify-between mb-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        if (calendarView === "month") {
                          const newDate = new Date(date);
                          newDate.setMonth(newDate.getMonth() - 1);
                          setDate(newDate);
                        } else {
                          // Week view - go back one week
                          const newDate = new Date(weekStartDate);
                          newDate.setDate(newDate.getDate() - 7);
                          setWeekStartDate(newDate);
                          setDate(newDate);
                        }
                      }}
                      className={isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : ''}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : ''}`}>
                      {calendarView === "month" ? (
                        date ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Select a date'
                      ) : (
                        // Week view header
                        (() => {
                          const weekDates = getWeekDates(weekStartDate);
                          const startMonth = weekDates[0].toLocaleDateString('en-US', { month: 'short' });
                          const endMonth = weekDates[6].toLocaleDateString('en-US', { month: 'short' });
                          const startDay = weekDates[0].getDate();
                          const endDay = weekDates[6].getDate();
                          const year = weekDates[0].getFullYear();
                          
                          return startMonth === endMonth 
                            ? `${startMonth} ${startDay}-${endDay}, ${year}` 
                            : `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
                        })()
                      )}
                    </h3>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        if (calendarView === "month") {
                          const newDate = new Date(date);
                          newDate.setMonth(newDate.getMonth() + 1);
                          setDate(newDate);
                        } else {
                          // Week view - go forward one week
                          const newDate = new Date(weekStartDate);
                          newDate.setDate(newDate.getDate() + 7);
                          setWeekStartDate(newDate);
                          setDate(newDate);
                        }
                      }}
                      className={isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : ''}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {calendarView === "month" ? (
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                      classNames={{
                        day_today: isDarkMode 
                          ? "bg-blue-800/50 text-blue-100 font-medium border border-blue-500" 
                          : "bg-blue-100 text-blue-900 font-medium border border-blue-500",
                        day_selected: isDarkMode
                          ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white font-medium"
                          : "bg-blue-500 text-white hover:bg-blue-600 hover:text-white font-medium",
                        day: isDarkMode 
                          ? "text-gray-100 h-9 w-9 p-0 font-normal hover:bg-gray-800" 
                          : "text-gray-900 h-9 w-9 p-0 font-normal hover:bg-gray-100",
                        day_disabled: isDarkMode ? "text-gray-600" : "text-gray-400",
                        day_outside: isDarkMode ? "text-gray-600 opacity-50" : "text-gray-400 opacity-50",
                        day_range_middle: isDarkMode ? "bg-blue-900/20" : "bg-blue-50",
                        caption: isDarkMode 
                          ? "flex justify-center pt-1 relative items-center text-gray-100" 
                          : "flex justify-center pt-1 relative items-center",
                        caption_label: isDarkMode ? "text-sm font-medium text-gray-100" : "text-sm font-medium",
                        nav_button: isDarkMode 
                          ? "border-0 p-1.5 hover:bg-gray-700 rounded-md text-gray-300" 
                          : "border-0 p-1.5 hover:bg-gray-100 rounded-md",
                        head_cell: isDarkMode 
                          ? "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]" 
                          : "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                        table: "w-full border-collapse",
                      }}
                      components={{
                        DayContent: (props) => {
                          const { events: dayEvents, applications, statusChanges, totalActivity } = getEnhancedEventsForDay(props.date);
                          const isToday = isSameDay(props.date, new Date());
                          const isOutsideMonth = props.date.getMonth() !== date.getMonth();
                        
                          return (
                            <div className={`relative h-full w-full p-2 ${
                              isToday 
                                ? (isDarkMode ? 'bg-blue-800/30 rounded-md' : 'bg-blue-50 rounded-md') 
                                : ''
                            }`}>
                              <div className={`text-center font-medium ${
                                isToday 
                                  ? (isDarkMode ? 'text-blue-300' : 'text-blue-600') 
                                  : (isDarkMode && !isOutsideMonth ? 'text-gray-100' : '')
                                    || (isDarkMode && isOutsideMonth ? 'text-gray-600' : '')
                                    || (isOutsideMonth ? 'text-gray-400' : '')
                              }`}>
                                {props.date.getDate()}
                              </div>
                            
                              {totalActivity > 0 && (
                                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5 pb-0.5">
                                  {applications.length > 0 && (
                                    <div className={`h-1.5 w-1.5 rounded-full bg-green-500 ${isDarkMode ? 'ring-1 ring-green-400' : ''}`} 
                                         title={`${applications.length} job application(s)`} />
                                  )}
                                
                                  {statusChanges.length > 0 && (
                                    <div className={`h-1.5 w-1.5 rounded-full bg-orange-500 ${isDarkMode ? 'ring-1 ring-orange-400' : ''}`} 
                                         title={`${statusChanges.length} status change(s)`} />
                                  )}
                                
                                  {dayEvents.map((event, i) => (
                                    i < 2 && (
                                      <div 
                                        key={i}
                                        className={`h-1.5 w-1.5 rounded-full ${
                                          event.type === 'interview' 
                                            ? `bg-blue-500 ${isDarkMode ? 'ring-1 ring-blue-400' : ''}` 
                                            : event.type === 'assessment' 
                                              ? `bg-purple-500 ${isDarkMode ? 'ring-1 ring-purple-400' : ''}` 
                                              : event.type === 'followup' 
                                                ? `bg-yellow-500 ${isDarkMode ? 'ring-1 ring-yellow-400' : ''}` 
                                                : `bg-red-500 ${isDarkMode ? 'ring-1 ring-red-400' : ''}`
                                        }`}
                                        title={event.title}
                                      />
                                    )
                                  ))}
                                
                                  {totalActivity > 3 && (
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      +{totalActivity - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        }
                      }}
                    />
                  ) : (
                    // Week view
                    <div className="week-view">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                          <div key={i} className={`text-center text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {getWeekDates(weekStartDate).map((day, i) => {
                          const { events: dayEvents, applications, statusChanges, totalActivity } = getEnhancedEventsForDay(day);
                          const isToday = isSameDay(day, new Date());
                          const isSelected = isSameDay(day, date);
                          
                          return (
                            <div 
                              key={i} 
                              className={`min-h-[100px] p-1 rounded-md cursor-pointer ${
                                isToday 
                                  ? isDarkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                                  : isSelected
                                    ? isDarkMode ? 'bg-blue-800/20 border border-blue-700' : 'bg-blue-100/50 border border-blue-200'
                                    : isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                              }`}
                              onClick={() => setDate(day)}
                            >
                              <div className={`text-center font-medium text-sm mb-1 ${
                                isToday 
                                  ? isDarkMode ? 'text-blue-300' : 'text-blue-600'
                                  : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {day.getDate()}
                              </div>
                              
                              <div className="space-y-1 overflow-hidden">
                                {applications.length > 0 && (
                                  <div className="flex items-center">
                                    <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                                    <span className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {applications.length} application{applications.length > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                )}
                                
                                {dayEvents.slice(0, 3).map((event, j) => (
                                  <div 
                                    key={j}
                                    className={`text-xs px-1 py-0.5 rounded truncate ${
                                      event.type === 'interview' 
                                        ? isDarkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800'
                                        : event.type === 'assessment' 
                                          ? isDarkMode ? 'bg-purple-900/50 text-purple-200' : 'bg-purple-100 text-purple-800'
                                          : event.type === 'followup' 
                                            ? isDarkMode ? 'bg-yellow-900/50 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                                            : isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'
                                    }`}
                                    title={event.title}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                
                                {totalActivity > 3 && (
                                  <div className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    +{totalActivity - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Legend for event types */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Applications</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-orange-500 mr-1"></div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status Changes</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Interviews</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-500 mr-1"></div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Assessments</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1"></div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Follow-ups</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Deadlines</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 md:col-span-2 order-1 md:order-2">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <CardTitle>
                    {date ? date.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'Today\'s'} Events
                  </CardTitle>
                  <Select value={eventTypeFilter} onValueChange={setEventTypeFilter} className="w-full sm:w-[130px]">
                    <SelectTrigger>
                      <SelectValue placeholder="Filter events" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="interview">Interviews</SelectItem>
                      <SelectItem value="assessment">Assessments</SelectItem>
                      <SelectItem value="followup">Follow-ups</SelectItem>
                      <SelectItem value="deadline">Deadlines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] sm:h-[400px] pr-4">
                  {date && (
                    <div>
                      {getEventsForDay(date).length > 0 ? (
                        <div className="space-y-3">
                          {getEventsForDay(date).map((event) => {
                            const relatedJob = event.opportunityId 
                              ? opportunities.find(opp => opp.id === event.opportunityId) 
                              : null;
                              
                            return (
                              <Card key={event.id} className={`overflow-hidden border-l-4 ${
                                event.type === 'interview' 
                                  ? isDarkMode ? 'border-l-blue-400' : 'border-l-blue-500' 
                                  : event.type === 'assessment' 
                                    ? isDarkMode ? 'border-l-purple-400' : 'border-l-purple-500' 
                                    : event.type === 'followup' 
                                      ? isDarkMode ? 'border-l-yellow-400' : 'border-l-yellow-500' 
                                      : isDarkMode ? 'border-l-red-400' : 'border-l-red-500'
                              }`}>
                                <CardHeader className={`py-2 px-3 ${
                                  isDarkMode 
                                    ? (event.type === 'interview' 
                                        ? 'bg-blue-900/30' 
                                        : event.type === 'assessment' 
                                          ? 'bg-purple-900/30' 
                                          : event.type === 'followup' 
                                            ? 'bg-yellow-900/30' 
                                            : 'bg-red-900/30')
                                    : (event.type === 'interview' 
                                        ? 'bg-blue-50' 
                                        : event.type === 'assessment' 
                                          ? 'bg-purple-50' 
                                          : event.type === 'followup' 
                                            ? 'bg-yellow-50' 
                                            : 'bg-red-50')
                                }`}>
                                  <div className="flex justify-between items-center">
                                    <Badge className={
                                      event.type === 'interview' 
                                        ? isDarkMode 
                                          ? 'bg-blue-800 text-blue-100 hover:bg-blue-700' 
                                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                                        : event.type === 'assessment' 
                                          ? isDarkMode 
                                            ? 'bg-purple-800 text-purple-100 hover:bg-purple-700' 
                                            : 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                                          : event.type === 'followup' 
                                            ? isDarkMode 
                                              ? 'bg-yellow-800 text-yellow-100 hover:bg-yellow-700' 
                                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                            : isDarkMode 
                                              ?'bg-red-800 text-red-100 hover:bg-red-700' 
                                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    }>
                                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                    </Badge>
                                    <div className="flex gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0"
                                        onClick={() => {
                                          // Edit event functionality
                                          setEditingEvent(event);
                                        }}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0"
                                        onClick={() => {
                                          if (window.confirm("Are you sure you want to delete this event?")) {
                                            dispatch({ type: 'DELETE_EVENT', payload: event.id });
                                          }
                                        }}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="py-2 px-3">
                                  <h4 className="font-medium">{event.title}</h4>
                                  {relatedJob && (
                                    <div 
                                      className="text-xs mt-1 cursor-pointer hover:text-blue-500"
                                      onClick={() => {
                                        // Navigate to the related job
                                        const jobIndex = opportunities.findIndex(opp => opp.id === event.opportunityId);
                                        if (jobIndex !== -1) {
                                          setActiveTab("opportunities");
                                          setSelectedOpportunity(jobIndex);
                                        }
                                      }}
                                    >
                                      <span className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {relatedJob.company} - {relatedJob.position}
                                      </span>
                                    </div>
                                  )}
                                  {event.notes && (
                                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {event.notes}
                                    </p>
                                  )}
                                  <div className="mt-2">
                                    <AddToCalendarButton 
                                      event={{
                                        title: event.title,
                                        startDate: new Date(event.date),
                                        description: event.notes || '',
                                        location: relatedJob?.location || ''
                                      }}
                                      variant="outline"
                                      size="sm"
                                      compact={true}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p>No events for this day</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              setNewEvent({
                                ...newEvent,
                                date: date.toISOString().split('T')[0]
                              });
                              // Use a different approach to trigger the dialog
                              const addEventDialog = document.querySelector('[id="add-event-trigger"]');
                              if (addEventDialog) {
                                (addEventDialog as HTMLButtonElement).click();
                              }
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add Event
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {date && getStatusChangesForDay(date).length > 0 && (
                    <div className="mt-4">
                      <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : ''}`}>Status Changes</h3>
                      <div className="space-y-3">
                        {getStatusChangesForDay(date).map((change) => (
                          <Card key={change.id} className={`overflow-hidden border-l-4 ${isDarkMode ? 'border-l-orange-400' : 'border-l-orange-500'}`}>
                            <CardHeader className={`py-2 px-3 ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                              <div className="flex justify-between items-center">
                                <Badge className={isDarkMode ? 'bg-orange-800 text-orange-100 hover:bg-orange-700' : 'bg-orange-100 text-orange-800 hover:bg-orange-200'}>
                                  Status Change
                                </Badge>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      if (window.confirm("Are you sure you want to remove this status change?")) {
                                        setStatusChanges(prev => prev.filter(sc => sc.id !== change.id));
                                      }
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2 px-3">
                              <h4 className="font-medium">{change.company} - {change.position}</h4>
                              <div className="flex items-center mt-1 text-xs">
                                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {change.oldStatus} → {change.newStatus}
                                </span>
                              </div>
                              <div 
                                className="text-xs mt-1 cursor-pointer hover:text-blue-500"
                                onClick={() => {
                                  // Navigate to the related job
                                  const jobIndex = opportunities.findIndex(opp => opp.id === change.opportunityId);
                                  if (jobIndex !== -1) {
                                    setActiveTab("opportunities");
                                    setSelectedOpportunityIndex(jobIndex);
                                  }
                                }}
                              >
                                <span className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                  View opportunity
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : ''}`}>Upcoming Events</h3>
                    {events.length > 0 ? (
                      <div className="space-y-3">
                        {events
                          .filter(event => eventTypeFilter === 'all' || event.type === eventTypeFilter)
                          .filter(event => {
                            const eventDate = new Date(event.date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return eventDate >= today;
                          })
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .slice(0, 5)
                          .map((event) => {
                            const relatedJob = event.opportunityId 
                              ? opportunities.find(opp => opp.id === event.opportunityId) 
                              : null;
                              
                            return (
                              <Card key={event.id} className={`overflow-hidden border-l-4 ${
                                event.type === 'interview' ? 'border-l-blue-500' :
                                event.type === 'assessment' ? 'border-l-purple-500' :
                                event.type === 'followup' ? 'border-l-yellow-500' :
                                'border-l-red-500'
                              }`}>
                                <CardHeader className={`py-2 px-3 ${
                                  isDarkMode ? 'bg-gray-800' : (
                                    event.type === 'interview' ? 'bg-blue-50' :
                                    event.type === 'assessment' ? 'bg-purple-50' :
                                    event.type === 'followup' ? 'bg-yellow-50' :
                                    'bg-red-50'
                                  )
                                }`}>
                                  <div className="flex justify-between items-center">
                                    <Badge className={
                                      event.type === 'interview' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                      event.type === 'assessment' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                                      event.type === 'followup' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                                      'bg-red-100 text-red-800 hover:bg-red-200'
                                    }>
                                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                    </Badge>
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : ''}`}>
                                      {new Date(event.date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </span>
                                  </div>
                                </CardHeader>
                                <CardContent className="py-2 px-3">
                                  <h4 className="font-medium">{event.title}</h4>
                                  {relatedJob && (
                                    <div 
                                      className="text-xs mt-1 cursor-pointer hover:text-blue-500"
                                      onClick={() => {
                                        // Navigate to the related job
                                        const jobIndex = opportunities.findIndex(opp => opp.id === event.opportunityId);
                                        if (jobIndex !== -1) {
                                          setActiveTab("opportunities");
                                          setSelectedOpportunityIndex(jobIndex);
                                        }
                                      }}
                                    >
                                      <span className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {relatedJob.company} - {relatedJob.position}
                                      </span>
                                    </div>
                                  )}
                                  <div className="mt-2">
                                    <AddToCalendarButton 
                                      event={{
                                        title: event.title,
                                        startDate: new Date(event.date),
                                        description: event.notes || '',
                                        location: relatedJob?.location || ''
                                      }}
                                      variant="outline"
                                      size="sm"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    ) : (
                      <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <p>No upcoming events</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Properly wrap the hidden trigger in a Dialog component */}
            <Dialog>
              <DialogTrigger asChild id="add-event-trigger" className="hidden">
                <button>Add Event</button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                  <DialogDescription>Create a new event for your job search calendar</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="sm:text-right">Title</Label>
                    <Input
                      id="title"
                      className="col-span-1 sm:col-span-3"
                      value={newEvent.title}
                      onChange={handleNewEventChange}
                      placeholder="e.g., Interview with Company X"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="sm:text-right">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      className="col-span-1 sm:col-span-3"
                      value={newEvent.date}
                      onChange={handleNewEventChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="sm:text-right">Event Type</Label>
                    <Select onValueChange={handleNewEventTypeChange} value={newEvent.type}>
                      <SelectTrigger className="col-span-1 sm:col-span-3">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="assessment">Technical Assessment</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="opportunityId" className="sm:text-right">Related Job</Label>
                    <Select onValueChange={handleNewEventOpportunityChange} value={newEvent.opportunityId}>
                      <SelectTrigger className="col-span-1 sm:col-span-3">
                        <SelectValue placeholder="Select related job" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {opportunities.map(opp => (
                          <SelectItem key={opp.id} value={opp.id.toString()}>
                            {opp.company} - {opp.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="sm:text-right">Notes</Label>
                    <Textarea
                      id="notes"
                      className="col-span-1 sm:col-span-3"
                      value={newEvent.notes}
                      onChange={handleNewEventChange}
                      placeholder="Add any additional notes about this event"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button type="submit" onClick={handleSaveNewEvent} className="w-full sm:w-auto">Save Event</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
        
        <TabsContent value="help" className="p-2 sm:p-4 flex-grow overflow-auto">
          {helpView.active && !helpView.guideId && (
            <HelpCenter 
              onSelectGuide={(guideId, sectionId) => {
                setHelpView({ active: true, guideId, sectionId });
              }}
              isDarkMode={isDarkMode}
            />
          )}
          
          {helpView.active && helpView.guideId && (
            <GuideViewer 
              guideId={helpView.guideId}
              sectionId={helpView.sectionId}
              onBack={() => setHelpView({ active: true })}
              isDarkMode={isDarkMode}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Back to top button */}
      {showBackToTop && (
        <Button 
          className="fixed bottom-4 right-4 rounded-full md:hidden h-10 w-10 p-0" 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
      
      <footer className={`mt-8 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-3 sm:mb-0`}>© 2025 You're Hired!</p>
            
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
  ) : (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="h-16 w-16 bg-blue-200 rounded-full animate-pulse mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Loading You're Hired!...</h2>
      </div>
    </div>
  );
}
