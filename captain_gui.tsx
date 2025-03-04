"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ThumbsUp, ThumbsDown, PlusCircle, Search, CalendarIcon, BarChart, Send, User, Bot, FileText, MessageSquare, Lock, Unlock, Maximize2, Minimize2, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { BarChartIcon, PieChartIcon, LineChartIcon, ActivityIcon } from 'lucide-react'
import { generateChatResponse, generateSuggestions } from '@/lib/openai'
import { useAppState } from '@/context/context'
import { Opportunity } from '@/context/types'
import { format, parseISO, isEqual, isSameDay } from 'date-fns'

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
  
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("opportunities")
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
  const [calendarView, setCalendarView] = useState("month"); // "month" or "week"
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [editingEvent, setEditingEvent] = useState(null);

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

  // Helper function for updating last modified timestamp
  const updateLastModified = (opportunityId: number) => {
    const newTimestamps = {...lastModifiedTimestamps};
    newTimestamps[opportunityId] = new Date().toISOString();
    setLastModifiedTimestamps(newTimestamps);
  };

  // Helper function for updating an opportunity
  const updateOpportunity = (opportunityId: number, updates: Partial<Opportunity>) => {
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
    try {
      return new Date(dateString);
    } catch (e) {
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
    if (selectedJobIds.includes(id)) {
      setSelectedJobIds(selectedJobIds.filter(jobId => jobId !== id));
    } else {
      setSelectedJobIds([...selectedJobIds, id]);
    }
  };

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
    
    return {
      statusCounts,
      applicationsByWeek,
      responseRate,
      interviewRate,
      offerRate,
      totalApplications: opportunities.length,
      activeApplications: opportunities.filter(opp => 
        !['Rejected', 'Withdrawn', 'Offer Declined', 'Position Filled', 'Position Cancelled'].includes(opp.status)
      ).length,
      weeklyApplicationCount
    };
  }, [opportunities]);

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

  const selectedOpportunity = opportunities[selectedOpportunityIndex];
  
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


  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">CAPTAIN - Career Application Tracking and Intelligence Navigation</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-lg shadow-md flex-grow flex flex-col">
        <TabsList className="mb-4 p-2 bg-blue-100 rounded-t-lg sticky top-0 z-10">
          <TabsTrigger value="opportunities" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Opportunities</TabsTrigger>
          <TabsTrigger value="resume" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Master Resume</TabsTrigger>
          <TabsTrigger value="captain" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Captain</TabsTrigger>
          <TabsTrigger value="analytics" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Analytics</TabsTrigger>
          <TabsTrigger value="calendar" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="p-4 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-blue-700">Job Opportunities</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white"><PlusCircle className="mr-2 h-4 w-4" /> Add New Opportunity</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add New Opportunity</DialogTitle>
                  <DialogDescription>Enter the details of your new job opportunity</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right">Company</Label>
                    <Input
                      id="company"
                      className="col-span-3"
                      value={newOpportunity.company}
                      onChange={handleNewOpportunityChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="position" className="text-right">Position</Label>
                    <Input
                      id="position"
                      className="col-span-3"
                      value={newOpportunity.position}
                      onChange={handleNewOpportunityChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">Location</Label>
                    <Input
                      id="location"
                      className="col-span-3"
                      value={newOpportunity.location}
                      onChange={handleNewOpportunityChange}
                      placeholder="e.g., Remote, New York, NY"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="salary" className="text-right">Salary Range</Label>
                    <Input
                      id="salary"
                      className="col-span-3"
                      value={newOpportunity.salary}
                      onChange={handleNewOpportunityChange}
                      placeholder="e.g., $80,000 - $100,000"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="applicationUrl" className="text-right">Application URL</Label>
                    <Input
                      id="applicationUrl"
                      className="col-span-3"
                      value={newOpportunity.applicationUrl}
                      onChange={handleNewOpportunityChange}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="source" className="text-right">Source</Label>
                    <Input
                      id="source"
                      className="col-span-3"
                      value={newOpportunity.source}
                      onChange={handleNewOpportunityChange}
                      placeholder="e.g., LinkedIn, Indeed, Referral"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="jobDescription" className="text-right">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      className="col-span-3 font-mono whitespace-pre-wrap"
                      value={newOpportunity.jobDescription}
                      onChange={handleNewOpportunityChange}
                      rows={10}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select onValueChange={handleNewOpportunityStatusChange} value={newOpportunity.status}>
                      <SelectTrigger className="col-span-3">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="appliedDate" className="text-right">Date</Label>
                    <div className="col-span-3">
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
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="recruiterName" className="text-right">Contact Name</Label>
                        <Input
                          id="recruiterName"
                          className="col-span-3"
                          value={newOpportunity.recruiterName || ""}
                          onChange={handleNewOpportunityChange}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="recruiterEmail" className="text-right">Contact Email</Label>
                        <Input
                          id="recruiterEmail"
                          className="col-span-3"
                          value={newOpportunity.recruiterEmail || ""}
                          onChange={handleNewOpportunityChange}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="recruiterPhone" className="text-right">Contact Phone</Label>
                        <Input
                          id="recruiterPhone"
                          className="col-span-3"
                          value={newOpportunity.recruiterPhone || ""}
                          onChange={handleNewOpportunityChange}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">Notes</Label>
                    <Textarea
                      id="notes"
                      className="col-span-3"
                      value={newOpportunity.notes || ""}
                      onChange={handleNewOpportunityChange}
                      placeholder="Add any additional notes about this opportunity"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSaveNewOpportunity}>Save Opportunity</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-3 gap-4 h-[calc(100vh-200px)]">
            <Card className="col-span-1 bg-blue-50 flex flex-col">
              <CardHeader>
                <CardTitle className="text-blue-700">Job List</CardTitle>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input 
                      placeholder="Search by company, position, or description..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <Select value={statusFilter} onValueChange={setStatusFilter} className="flex-1">
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Statuses</SelectItem>
                          
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
                    
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <Select value={dateFilter} onValueChange={setDateFilter} className="flex-1">
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Dates</SelectItem>
                          <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                          <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                          <SelectItem value="Last 90 Days">Last 90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <Select value={`${sortBy}-${sortDirection}`} onValueChange={(value) => {
                      const [field, direction] = value.split('-');
                      setSortBy(field);
                      setSortDirection(direction);
                    }} className="flex-1">
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Sort by Date</SelectLabel>
                          <SelectItem value="lastModified-desc">Last Modified (Newest First)</SelectItem>
                          <SelectItem value="lastModified-asc">Last Modified (Oldest First)</SelectItem>
                          <SelectItem value="appliedDate-desc">Date Applied (Newest First)</SelectItem>
                          <SelectItem value="appliedDate-asc">Date Applied (Oldest First)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Sort by Name</SelectLabel>
                          <SelectItem value="company-asc">Company (A-Z)</SelectItem>
                          <SelectItem value="company-desc">Company (Z-A)</SelectItem>
                          <SelectItem value="position-asc">Position (A-Z)</SelectItem>
                          <SelectItem value="position-desc">Position (Z-A)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Sort by Status</SelectLabel>
                          <SelectItem value="status-asc">Status (A-Z)</SelectItem>
                          <SelectItem value="status-desc">Status (Z-A)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex space-x-1">
                      <Button 
                        variant={viewMode === "card" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setViewMode("card")}
                        className="px-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </Button>
                      <Button 
                        variant={viewMode === "list" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="px-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Batch selection controls */}
                <div className="flex justify-between items-center mb-2 mt-3">
                  <div className="flex items-center">
                    <Button 
                      variant={isBatchSelectMode ? "default" : "outline"} 
                      size="sm"
                      onClick={() => {
                        setIsBatchSelectMode(!isBatchSelectMode);
                        setSelectedJobIds([]);
                      }}
                      className="mr-2"
                    >
                      {isBatchSelectMode ? "Cancel Selection" : "Select Jobs"}
                    </Button>
                    
                    {isBatchSelectMode && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedJobIds(sortedOpportunities.map(opp => opp.id))}
                          className="mr-2"
                        >
                          Select All
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={handleBatchDelete}
                          disabled={selectedJobIds.length === 0}
                        >
                          Delete Selected ({selectedJobIds.length})
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full">
                  {sortedOpportunities.length > 0 ? (
                    sortedOpportunities.map((opp, index) => {
                      const originalIndex = opportunities.findIndex(o => o.id === opp.id);
                      
                      if (viewMode === "card") {
                        return (
                          <div key={opp.id} className="relative">
                            {isBatchSelectMode && (
                              <div className="absolute top-2 left-2 z-10">
                                <input 
                                  type="checkbox" 
                                  checked={selectedJobIds.includes(opp.id)}
                                  onChange={() => toggleJobSelection(opp.id)}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </div>
                            )}
                            <Card 
                              className={`mb-2 cursor-pointer ${originalIndex === selectedOpportunityIndex ? 'bg-blue-200' : 'bg-white'}`} 
                              onClick={() => {
                                if (isBatchSelectMode) {
                                  toggleJobSelection(opp.id);
                                } else {
                                  setSelectedOpportunityIndex(originalIndex);
                                }
                              }}
                            >
                              <CardContent className="p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold">{opp.company}</h3>
                                    <p className="text-sm text-gray-600">{opp.position}</p>
                                  </div>
                                  <Badge 
                                    className={
                                      opp.status === 'Offer Received' || opp.status === 'Offer Accepted' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                      opp.status === 'Rejected' || opp.status === 'Withdrawn' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                      opp.status === 'Applied' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                      opp.status.includes('Interview') ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                                      'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }
                                  >
                                    {opp.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{opp.appliedDate}</p>
                              </CardContent>
                            </Card>
                          </div>
                        );
                      } else {
                        // List view
                        return (
                          <div 
                            key={opp.id}
                            className={`flex items-center p-2 mb-1 rounded cursor-pointer ${originalIndex === selectedOpportunityIndex ? 'bg-blue-200' : 'bg-white'}`}
                            onClick={() => {
                              if (isBatchSelectMode) {
                                toggleJobSelection(opp.id);
                              } else {
                                setSelectedOpportunityIndex(originalIndex);
                              }
                            }}
                          >
                            {isBatchSelectMode && (
                              <input 
                                type="checkbox" 
                                checked={selectedJobIds.includes(opp.id)}
                                onChange={() => toggleJobSelection(opp.id)}
                                className="h-4 w-4 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h3 className="font-semibold truncate">{opp.company}</h3>
                                <Badge 
                                  className={
                                    opp.status === 'Offer Received' || opp.status === 'Offer Accepted' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                    opp.status === 'Rejected' || opp.status === 'Withdrawn' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                    opp.status === 'Applied' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                    opp.status.includes('Interview') ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                                    'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }
                                  size="sm"
                                >
                                  {opp.status}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span className="truncate">{opp.position}</span>
                                <span>{opp.appliedDate}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No opportunities found</p>
                      <p className="text-sm mt-2">Try adjusting your filters or add a new opportunity</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="col-span-2 flex flex-col">
              {selectedOpportunity ? (
                <>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{selectedOpportunity.company}</CardTitle>
                        <CardDescription className="text-lg font-medium">{selectedOpportunity.position}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge 
                          className={
                            selectedOpportunity.status === 'Offer Received' || selectedOpportunity.status === 'Offer Accepted' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                            selectedOpportunity.status === 'Rejected' || selectedOpportunity.status === 'Withdrawn' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                            selectedOpportunity.status === 'Applied' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                            selectedOpportunity.status.includes('Interview') ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                            'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }
                        >
                          {selectedOpportunity.status}
                        </Badge>
                        
                        <div className="flex items-center mt-2">
                          {isEditingDate ? (
                            <div className="flex items-center">
                              <Input
                                type="date"
                                value={editedDate}
                                onChange={(e) => setEditedDate(e.target.value)}
                                className="w-40 mr-2"
                              />
                              <Button size="sm" onClick={handleSaveDateChange} className="mr-1">Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setIsEditingDate(false)}>Cancel</Button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm text-gray-500 mr-2">{selectedOpportunity.appliedDate}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0" 
                                onClick={() => {
                                  // Convert from "Month Day, Year" to YYYY-MM-DD
                                  const date = new Date(selectedOpportunity.appliedDate);
                                  setEditedDate(date.toISOString().split('T')[0]);
                                  setIsEditingDate(true);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow overflow-hidden">
                    <Tabs defaultValue="details" className="h-full flex flex-col">
                      <TabsList className="mb-2">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="description">Job Description</TabsTrigger>
                        <TabsTrigger value="resume">Resume</TabsTrigger>
                        <TabsTrigger value="chat">AI Assistant</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="details" className="flex-grow overflow-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-medium">Job Details</CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0" 
                                  onClick={() => {
                                    setEditedJobDetails({
                                      location: selectedOpportunity.location || "",
                                      salary: selectedOpportunity.salary || "",
                                      applicationUrl: selectedOpportunity.applicationUrl || "",
                                      source: selectedOpportunity.source || ""
                                    });
                                    setIsEditingJobDetails(true);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2">
                              {isEditingJobDetails ? (
                                <div className="space-y-3">
                                  <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                      id="location"
                                      value={editedJobDetails.location}
                                      onChange={(e) => setEditedJobDetails({...editedJobDetails, location: e.target.value})}
                                      placeholder="e.g., Remote, New York, NY"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="salary">Salary Range</Label>
                                    <Input
                                      id="salary"
                                      value={editedJobDetails.salary}
                                      onChange={(e) => setEditedJobDetails({...editedJobDetails, salary: e.target.value})}
                                      placeholder="e.g., $80,000 - $100,000"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="applicationUrl">Application URL</Label>
                                    <Input
                                      id="applicationUrl"
                                      value={editedJobDetails.applicationUrl}
                                      onChange={(e) => setEditedJobDetails({...editedJobDetails, applicationUrl: e.target.value})}
                                      placeholder="https://..."
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="source">Source</Label>
                                    <Input
                                      id="source"
                                      value={editedJobDetails.source}
                                      onChange={(e) => setEditedJobDetails({...editedJobDetails, source: e.target.value})}
                                      placeholder="e.g., LinkedIn, Indeed, Referral"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2 pt-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => {
                                        updateOpportunity(selectedOpportunity.id, editedJobDetails);
                                        setIsEditingJobDetails(false);
                                      }}
                                    >
                                      Save
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setIsEditingJobDetails(false)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-xs text-gray-500">Location</span>
                                    <p>{selectedOpportunity.location || "Not specified"}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Salary Range</span>
                                    <p>{selectedOpportunity.salary || "Not specified"}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Application URL</span>
                                    <p>
                                      {selectedOpportunity.applicationUrl ? (
                                        <a 
                                          href={selectedOpportunity.applicationUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          {selectedOpportunity.applicationUrl}
                                        </a>
                                      ) : (
                                        "Not specified"
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Source</span>
                                    <p>{selectedOpportunity.source || "Not specified"}</p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0" 
                                  onClick={() => {
                                    setEditedContactInfo({
                                      recruiterName: selectedOpportunity.recruiterName || "",
                                      recruiterEmail: selectedOpportunity.recruiterEmail || "",
                                      recruiterPhone: selectedOpportunity.recruiterPhone || ""
                                    });
                                    setIsEditingContactInfo(true);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2">
                              {isEditingContactInfo ? (
                                <div className="space-y-3">
                                  <div>
                                    <Label htmlFor="recruiterName">Contact Name</Label>
                                    <Input
                                      id="recruiterName"
                                      value={editedContactInfo.recruiterName}
                                      onChange={(e) => setEditedContactInfo({...editedContactInfo, recruiterName: e.target.value})}
                                      placeholder="e.g., John Smith"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="recruiterEmail">Contact Email</Label>
                                    <Input
                                      id="recruiterEmail"
                                      value={editedContactInfo.recruiterEmail}
                                      onChange={(e) => setEditedContactInfo({...editedContactInfo, recruiterEmail: e.target.value})}
                                      placeholder="e.g., john.smith@company.com"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="recruiterPhone">Contact Phone</Label>
                                    <Input
                                      id="recruiterPhone"
                                      value={editedContactInfo.recruiterPhone}
                                      onChange={(e) => setEditedContactInfo({...editedContactInfo, recruiterPhone: e.target.value})}
                                      placeholder="e.g., (123) 456-7890"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2 pt-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => {
                                        updateOpportunity(selectedOpportunity.id, editedContactInfo);
                                        setIsEditingContactInfo(false);
                                      }}
                                    >
                                      Save
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setIsEditingContactInfo(false)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-xs text-gray-500">Contact Name</span>
                                    <p>{selectedOpportunity.recruiterName || "Not specified"}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Contact Email</span>
                                    <p>
                                      {selectedOpportunity.recruiterEmail ? (
                                        <a 
                                          href={`mailto:${selectedOpportunity.recruiterEmail}`} 
                                          className="text-blue-600 hover:underline"
                                        >
                                          {selectedOpportunity.recruiterEmail}
                                        </a>
                                      ) : (
                                        "Not specified"
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Contact Phone</span>
                                    <p>
                                      {selectedOpportunity.recruiterPhone ? (
                                        <a 
                                          href={`tel:${selectedOpportunity.recruiterPhone}`} 
                                          className="text-blue-600 hover:underline"
                                        >
                                          {selectedOpportunity.recruiterPhone}
                                        </a>
                                      ) : (
                                        "Not specified"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          
                          <Card className="col-span-2">
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-medium">Notes</CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0" 
                                  onClick={() => {
                                    setEditedNotes(selectedOpportunity.notes || "");
                                    setIsEditingNotes(true);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2">
                              {isEditingNotes ? (
                                <div className="space-y-3">
                                  <Textarea
                                    value={editedNotes}
                                    onChange={(e) => setEditedNotes(e.target.value)}
                                    placeholder="Add notes about this opportunity..."
                                    rows={5}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => {
                                        updateOpportunity(selectedOpportunity.id, { notes: editedNotes });
                                        setIsEditingNotes(false);
                                      }}
                                    >
                                      Save
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setIsEditingNotes(false)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  {selectedOpportunity.notes ? (
                                    <p className="whitespace-pre-wrap">{selectedOpportunity.notes}</p>
                                  ) : (
                                    <p className="text-gray-500 italic">No notes added yet</p>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          
                          <Card className="col-span-2">
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-medium">Status</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2">
                              <Select 
                                value={selectedOpportunity.status} 
                                onValueChange={(value) => {
                                  updateOpportunity(selectedOpportunity.id, { status: value });
                                }}
                              >
                                <SelectTrigger>
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
                              
                              <div className="mt-4 flex justify-end">
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this opportunity?")) {
                                      dispatch({ type: 'DELETE_OPPORTUNITY', payload: selectedOpportunity.id });
                                      if (opportunities.length > 1) {
                                        setSelectedOpportunityIndex(0);
                                      }
                                    }
                                  }}
                                >
                                  Delete Opportunity
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="description" className="flex-grow overflow-auto">
                        <Card>
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-sm font-medium">Job Description</CardTitle>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0" 
                                  onClick={() => setIsJobDescriptionExpanded(!isJobDescriptionExpanded)}
                                >
                                  {isJobDescriptionExpanded ? (
                                    <Minimize2 className="h-3 w-3" />
                                  ) : (
                                    <Maximize2 className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0" 
                                  onClick={() => {
                                    setEditedJobDescription(selectedOpportunity.jobDescription);
                                    setIsEditingJobDescription(true);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            {isEditingJobDescription ? (
                              <div className="space-y-3">
                                <Textarea
                                  value={editedJobDescription}
                                  onChange={(e) => setEditedJobDescription(e.target.value)}
                                  className="font-mono whitespace-pre-wrap"
                                  rows={isJobDescriptionExpanded ? 30 : 15}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      updateOpportunity(selectedOpportunity.id, { jobDescription: editedJobDescription });
                                      setIsEditingJobDescription(false);
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setIsEditingJobDescription(false)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className={`font-mono whitespace-pre-wrap ${isJobDescriptionExpanded ? 'h-auto' : 'max-h-[400px] overflow-y-auto'}`}>
                                {selectedOpportunity.jobDescription || "No job description available"}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="resume" className="flex-grow overflow-auto">
                        <Card>
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-sm font-medium">Resume for This Application</CardTitle>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Switch
                                    checked={isMasterResumeFrozen}
                                    onCheckedChange={setIsMasterResumeFrozen}
                                    id="freeze-resume"
                                  />
                                  <Label htmlFor="freeze-resume" className="text-xs">
                                    {isMasterResumeFrozen ? (
                                      <div className="flex items-center">
                                        <Lock className="h-3 w-3 mr-1" />
                                        <span>Frozen</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <Unlock className="h-3 w-3 mr-1" />
                                        <span>Synced with Master</span>
                                      </div>
                                    )}
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <Textarea
                              value={selectedOpportunity.resume}
                              onChange={(e) => {
                                const newResume = e.target.value;
                                updateOpportunity(selectedOpportunity.id, { resume: newResume });
                                
                                // If not frozen, also update the master resume
                                if (!isMasterResumeFrozen) {
                                  dispatch({
                                    type: 'UPDATE_MASTER_RESUME',
                                    payload: newResume
                                  });
                                }
                              }}
                              className="font-mono whitespace-pre-wrap"
                              rows={15}
                            />
                            
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">AI Suggestions</h4>
                              <div className="space-y-2">
                                {suggestions.length >  0 ? (
                                  suggestions.map((suggestion, index) => (
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                                      <ThumbsUp className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                                      <p className="text-sm">{suggestion}</p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 italic">Loading suggestions...</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="chat" className="flex-grow overflow-hidden flex flex-col">
                        <Card className="flex-grow flex flex-col overflow-hidden">
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm font-medium">Chat with AI Assistant</CardTitle>
                            <CardDescription>
                              Ask questions about the job, get resume advice, or prepare for interviews
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow overflow-hidden flex flex-col p-0">
                            <div className="flex-grow overflow-y-auto p-4">
                              {opportunityMessages.length > 0 ? (
                                opportunityMessages.map((msg, index) => (
                                  <div 
                                    key={index} 
                                    className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div 
                                      className={`max-w-[80%] rounded-lg p-3 ${
                                        msg.sender === 'user' 
                                          ? 'bg-blue-500 text-white' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      <div className="flex items-center mb-1">
                                        {msg.sender === 'user' ? (
                                          <>
                                            <span className="text-xs opacity-75">You</span>
                                            <User className="h-3 w-3 ml-1 opacity-75" />
                                          </>
                                        ) : (
                                          <>
                                            <Bot className="h-3 w-3 mr-1 opacity-75" />
                                            <span className="text-xs opacity-75">AI Assistant</span>
                                          </>
                                        )}
                                      </div>
                                      <p className="whitespace-pre-wrap">{msg.message}</p>
                                      <div className="text-right">
                                        <span className="text-xs opacity-75">
                                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                  <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                                  <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
                                  <p className="text-gray-500 max-w-md mt-1">
                                    Start a conversation with the AI assistant to get help with your job application
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 mt-4 w-full max-w-md">
                                    {quickChatOptions.map((option, index) => (
                                      <Button
                                        key={index}
                                        variant="outline"
                                        className="justify-start text-left"
                                        onClick={() => {
                                          setCurrentMessage(option);
                                          setTimeout(() => handleSendMessage(), 100);
                                        }}
                                      >
                                        {option}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4 border-t">
                              <div className="flex space-x-2">
                                <Textarea
                                  value={currentMessage}
                                  onChange={(e) => setCurrentMessage(e.target.value)}
                                  placeholder="Type your message..."
                                  className="flex-grow"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendMessage();
                                    }
                                  }}
                                />
                                <Button 
                                  className="self-end"
                                  onClick={handleSendMessage}
                                  disabled={currentMessage.trim() === ""}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700">No opportunity selected</h3>
                    <p className="text-gray-500 mt-2">Select an opportunity from the list or add a new one</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resume" className="p-4 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-blue-700">Master Resume</h2>
            <div className="flex items-center space-x-2">
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
              }}>
                Sync All Applications
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <Card className="col-span-2 lg:col-span-1">
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
            
            <Card className="col-span-2 lg:col-span-1">
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

        <TabsContent value="captain" className="p-4 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-blue-700">Captain AI Assistant</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-3 lg:col-span-2 flex flex-col h-[calc(100vh-250px)]">
              <CardHeader>
                <CardTitle>Chat with Captain</CardTitle>
                <CardDescription>
                  Ask for career advice, job search strategies, or help with your applications
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden flex flex-col">
                <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="mb-4">
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-800 p-3 rounded-lg max-w-[80%]">
                        <div className="flex items-center mb-1">
                          <Bot className="h-3 w-3 mr-1" />
                          <span className="text-xs font-medium">Captain</span>
                        </div>
                        <p>Hello! I'm Captain, your AI career assistant. How can I help you with your job search today?</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* This would be populated with actual chat messages in a real implementation */}
                </div>
                
                <div className="flex space-x-2">
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
            
            <Card className="col-span-3 lg:col-span-1">
              <CardHeader>
                <CardTitle>Job Recommendations</CardTitle>
                <CardDescription>
                  Based on your profile and applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobRecommendations.map((job) => (
                    <Card key={job.id} className="overflow-hidden">
                      <CardHeader className="p-3">
                        <CardTitle className="text-base">{job.position}</CardTitle>
                        <CardDescription>{job.company}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm line-clamp-3">{job.description}</p>
                      </CardContent>
                      <CardFooter className="p-3 pt-0 flex justify-between">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button size="sm">Apply</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="p-4 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-blue-700">Analytics Dashboard</h2>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Applications</p>
                    <h3 className="text-3xl font-bold">{analytics.totalApplications}</h3>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Applications</p>
                    <h3 className="text-3xl font-bold">{analytics.activeApplications}</h3>
                  </div>
                  <ActivityIcon className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Response Rate</p>
                    <h3 className="text-3xl font-bold">{analytics.responseRate}%</h3>
                  </div>
                  <BarChartIcon className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">This Week</p>
                    <h3 className="text-3xl font-bold">{analytics.weeklyApplicationCount}</h3>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Distribution of your applications by status</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <PieChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Status distribution chart would appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
                <CardDescription>Number of applications over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <LineChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Application timeline chart would appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-3 lg:col-span-2">
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>How your applications progress through the hiring process</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Conversion funnel chart would appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3 lg:col-span-1">
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
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${analytics.interviewRate}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Offer Rate</span>
                    <span className="font-bold">{analytics.offerRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${analytics.offerRate}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Application Streak</span>
                    <span className="font-bold">{calculateStreak(opportunities)} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${Math.min(calculateStreak(opportunities) * 10, 100)}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="p-4 flex-grow overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-blue-700">Calendar</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                  <DialogDescription>Create a new event for your job search calendar</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input
                      id="title"
                      className="col-span-3"
                      value={newEvent.title}
                      onChange={handleNewEventChange}
                      placeholder="e.g., Interview with Company X"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      className="col-span-3"
                      value={newEvent.date}
                      onChange={handleNewEventChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Event Type</Label>
                    <Select onValueChange={handleNewEventTypeChange} value={newEvent.type}>
                      <SelectTrigger className="col-span-3">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="opportunityId" className="text-right">Related Job</Label>
                    <Select onValueChange={handleNewEventOpportunityChange} value={newEvent.opportunityId}>
                      <SelectTrigger className="col-span-3">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">Notes</Label>
                    <Textarea
                      id="notes"
                      className="col-span-3"
                      value={newEvent.notes}
                      onChange={handleNewEventChange}
                      placeholder="Add any additional notes about this event"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSaveNewEvent}>Save Event</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-7 gap-4 mb-4">
            <Card className="col-span-5">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Calendar</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setCalendarView("month")} className={calendarView === "month" ? "bg-blue-100" : ""}>Month</Button>
                    <Button variant="outline" size="sm" onClick={() => setCalendarView("week")} className={calendarView === "week" ? "bg-blue-100" : ""}>Week</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-white rounded-lg border">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    components={{
                      DayContent: (props) => {
                        const dayEvents = getEventsForDay(props.date);
                        return (
                          <div className="relative h-full w-full p-2">
                            <div className="text-center">{props.date.getDate()}</div>
                            {dayEvents.length > 0 && (
                              <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                                {dayEvents.slice(0, 3).map((event, i) => (
                                  <div 
                                    key={i}
                                    className={`h-1.5 w-1.5 rounded-full mx-0.5 ${
                                      event.type === 'interview' ? 'bg-blue-500' :
                                      event.type === 'assessment' ? 'bg-purple-500' :
                                      event.type === 'followup' ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                  />
                                ))}
                                {dayEvents.length > 3 && (
                                  <div className="text-xs text-gray-500 ml-1">+{dayEvents.length - 3}</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Events</CardTitle>
                  <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                    <SelectTrigger className="w-[130px]">
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
                <ScrollArea className="h-[400px] pr-4">
                  {date && (
                    <div>
                      <h3 className="font-medium mb-2">
                        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h3>
                      
                      {getEventsForDay(date).length > 0 ? (
                        <div className="space-y-3">
                          {getEventsForDay(date).map((event) => {
                            const relatedJob = event.opportunityId 
                              ? opportunities.find(opp => opp.id === event.opportunityId) 
                              : null;
                              
                            return (
                              <Card key={event.id} className="overflow-hidden">
                                <CardHeader className={`py-2 px-3 ${
                                  event.type === 'interview' ? 'bg-blue-50' :
                                  event.type === 'assessment' ? 'bg-purple-50' :
                                  event.type === 'followup' ? 'bg-yellow-50' :
                                  'bg-red-50'
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
                                </CardHeader>
                                <CardContent className="py-2 px-3">
                                  <h4 className="font-medium">{event.title}</h4>
                                  {relatedJob && (
                                    <p className="text-xs text-gray-500">
                                      {relatedJob.company} - {relatedJob.position}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
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
                              document.querySelector('[data-dialog-trigger="true"]')?.click();
                            }}
                          >
                            Add Event
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Upcoming Events</h3>
                    {events.length > 0 ? (
                      <div className="space-y-3">
                        {events
                          .filter(event => eventTypeFilter === 'all' || event.type === event.type)
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
                              <Card key={event.id} className="overflow-hidden">
                                <CardHeader className={`py-2 px-3 ${
                                  event.type === 'interview' ? 'bg-blue-50' :
                                  event.type === 'assessment' ? 'bg-purple-50' :
                                  event.type === 'followup' ? 'bg-yellow-50' :
                                  'bg-red-50'
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
                                    <span className="text-xs">{event.date}</span>
                                  </div>
                                </CardHeader>
                                <CardContent className="py-2 px-3">
                                  <h4 className="font-medium">{event.title}</h4>
                                  {relatedJob && (
                                    <p className="text-xs text-gray-500">
                                      {relatedJob.company} - {relatedJob.position}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>No upcoming events</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
