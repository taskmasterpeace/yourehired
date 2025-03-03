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
                                  toggle # Aaronlcj/CNTK
# Source/CNTKv2LibraryDll/proto/onnx/core/model.cpp
#include "core/model.h"
#include "core/graph.h"

namespace ONNXIR
{
    Model::Model(const std::string& p_graphName,
        bool p_isONNX)
        : m_modelProto(new ModelProto),
        m_graphProto(nullptr),
        m_graph(nullptr),
        m_isONNX(p_isONNX)
    {
        m_modelProto->set_ir_version(ONNX_IRDEFS_VERSION);
        m_modelProto->set_producer_name("CNTK");
        m_modelProto->set_producer_version("2.4");
        m_modelProto->set_domain("ai.cntk");
        m_modelProto->set_model_version(1);
        m_modelProto->set_doc_string("A CNTK model converted to ONNX.");
        m_graphProto = m_modelProto->mutable_graph();
        m_graphProto->set_name(p_graphName);
        m_graph.reset(new Graph(m_graphProto, p_isONNX));
    }

    Model::Model(const ModelProto& p_modelProto,
        bool p_isONNX)
        : m_modelProto(new ModelProto(p_modelProto)),
        m_graphProto(nullptr),
        m_graph(nullptr),
        m_isONNX(p_isONNX)
    {
        m_graphProto = m_modelProto->mutable_graph();
        m_graph.reset(new Graph(m_graphProto, p_isONNX));
    }

    Model::~Model()
    {
    }

    Version Model::IrVersion() const
    {
        return m_modelProto->ir_version();
    }

    void Model::SetIrVersion(Version p_irVersion)
    {
        m_modelProto->set_ir_version(p_irVersion);
    }

    const std::string& Model::ProducerName() const
    {
        return m_modelProto->producer_name();
    }

    void Model::SetProducerName(const std::string& p_producerName)
    {
        m_modelProto->set_producer_name(p_producerName);
    }

    const std::string& Model::ProducerVersion() const
    {
        return m_modelProto->producer_version();
    }

    void Model::SetProducerVersion(const std::string& p_producerVersion)
    {
        m_modelProto->set_producer_version(p_producerVersion);
    }

    const std::string& Model::Domain() const
    {
        return m_modelProto->domain();
    }

    void Model::SetDomain(const std::string& p_domain)
    {
        m_modelProto->set_domain(p_domain);
    }

    Version Model::ModelVersion() const
    {
        return m_modelProto->model_version();
    }

    void Model::SetModelversion(Version p_modelVersion)
    {
        m_modelProto->set_model_version(p_modelVersion);
    }

    const std::string& Model::DocString() const
    {
        return m_modelProto->doc_string();
    }

    void Model::SetDocString(const std::string& p_docString)
    {
        m_modelProto->set_doc_string(p_docString);
    }

    Graph* Model::MainGraph()
    {
        return m_graph.get();
    }

    const ModelProto& Model::ToProto()
    {
        *(m_modelProto->mutable_graph()) = m_graph->ToGraphProto();
        return *m_modelProto;
    }

    Status Model::Load(const std::string& p_filePath, std::shared_ptr<Model>* p_model)
    {
        if (nullptr == p_model)
        {
            return Status(ONNX, INVALID_ARGUMENT, "Null model pointer.");
        }

        int fd;
#ifdef _WIN32
        _sopen_s(&fd, p_filePath.c_str(), _O_RDONLY | _O_SEQUENTIAL | _O_BINARY, _SH_DENYWR, _S_IREAD | _S_IWRITE);
#else
        fd = open(p_filePath.c_str(), O_RDONLY);
#endif

        if (0 > fd)
        {
            return Status(ONNX, INVALID_ARGUMENT, "File could not be opened.");
        }

#if ((GOOGLE_PROTOBUF_VERSION >= 3002000) && (GOOGLE_PROTOBUF_VERSION < 3006000))
        // NOLINTNEXTLINE(cppcoreguidelines-pro-type-vararg)
        ZeroCopyInputStream* raw_input = new FileInputStream(fd);
        CodedInputStream* coded_input = new CodedInputStream(raw_input);
#else
        // for proto3.6 or later
        FileDescriptorCloser fd_closer(fd);
        std::unique_ptr<::google::protobuf::io::ZeroCopyInputStream> raw_input(new ::google::protobuf::io::FileInputStream(fd));
        std::unique_ptr<::google::protobuf::io::CodedInputStream> coded_input(
            new ::google::protobuf::io::CodedInputStream(raw_input.get()));
#endif
        coded_input->SetTotalBytesLimit(INT_MAX, INT_MAX);
        ModelProto modelProto;
        bool result = modelProto.ParseFromCodedStream(coded_input);

#if ((GOOGLE_PROTOBUF_VERSION >= 3002000) && (GOOGLE_PROTOBUF_VERSION < 3006000))
        delete coded_input;
        delete raw_input;
        ONNXIR_UNUSED_PARAMETER(close(fd));
#endif
        if (!result)
        {
            return Status(ONNX, INVALID_PROTOBUF, "Failed to parse model because protobuf parsing failed.");
        }

        p_model->reset(new Model(modelProto));

        return Status::OK();
    }

    Status Model::Save(Model& p_model, const std::string& p_filePath)
    {
        int fd;
#ifdef _WIN32
        _sopen_s(&fd, p_filePath.c_str(), _O_WRONLY | _O_CREAT | _O_SEQUENTIAL | _O_BINARY, _SH_DENYWR, _S_IREAD | _S_IWRITE);
#else
        fd = open(p_filePath.c_str(), O_WRONLY | O_CREAT | O_TRUNC, 0644);
#endif
        if (0 > fd)
        {
            return Status(ONNX, INVALID_ARGUMENT, "File could not be created.");
        }

        ModelProto modelProto = p_model.ToProto();
#if ((GOOGLE_PROTOBUF_VERSION >= 3002000) && (GOOGLE_PROTOBUF_VERSION < 3006000))
        ZeroCopyOutputStream* raw_output = new FileOutputStream(fd);
        CodedOutputStream* coded_output = new CodedOutputStream(raw_output);
        modelProto.SerializeToCodedStream(coded_output);
        delete coded_output;
        delete raw_output;
        close(fd);
#else
        FileDescriptorCloser fd_closer(fd);
        std::unique_ptr<::google::protobuf::io::ZeroCopyOutputStream> raw_output(new ::google::protobuf::io::FileOutputStream(fd));
        std::unique_ptr<::google::protobuf::io::CodedOutputStream> coded_output(
            new ::google::protobuf::io::CodedOutputStream(raw_output.get()));
        modelProto.SerializeToCodedStream(coded_output.get());
#endif
        return Status::OK();
    }
}
End File# Aaronlcj/CNTK
# Source/CNTKv2LibraryDll/proto/onnx/core/graph.h
#pragma once

#include <string>
#include <unordered_map>
#include <unordered_set>

#include "core/common.h"
#include "core/common/status.h"
#include "core/graph/graph.h"
#include "core/graph/graph_nodes.h"

namespace ONNXIR
{
    typedef std::unordered_map<std::string, std::pair<std::unique_ptr<Value>, int>> NameToValInfoMap;
    typedef std::unordered_map<std::string, std::unique_ptr<Node>> NameToNodeMap;

    // A Graph.
    class Graph
    {
    public:

        // Resolve domain for a node based on the node's domain and the graph's
        // domain. If the node's domain is empty, it'll be resolved as the graph's
        // domain. If the graph's domain is empty, it'll be resolved as ONNX_DOMAIN.
        // If the node's domain is not empty, the node's domain will be kept.
        std::string ResolveDomain(const std::string& p_nodeDomain) const;

        // Constructor: Given a <GraphProto> loaded from model file
        // <p_isONNX> is a special flag to indicate whether this graph is
        // an ONNX graph. It's special because we want to support both ONNX and
        // non-ONNX graphs.
        Graph(const GraphProto& p_graphProto, bool p_isONNX = false);

        // Constructor: Given a <GraphProto> loaded from model file
        // <p_isONNX> is a special flag to indicate whether this graph is
        // an ONNX graph. It's special because we want to support both ONNX and
        // non-ONNX graphs.
        Graph(GraphProto* p_graphProto, bool p_isONNX = false);

        Graph() = delete;

        // Resolve <*this> graph.
        Status Resolve();

        // Add node.
        Node* AddNode(const std::string& p_name,
            const std::string& p_opType,
            const std::string& p_description,
            const std::vector<NodeArg*>& p_inputArgs,
            const std::vector<NodeArg*>& p_outputArgs,
            const std::string& p_domain = "");

        // Add node.
        Node* AddNode(const std::string& p_name,
            const std::string& p_opType,
            const std::string& p_description,
            const std::vector<NodeArg*>& p_inputArgs,
            const std::vector<NodeArg*>& p_outputArgs,
            const std::vector<NodeAttributes>& p_attributes,
            const std::string& p_domain = "");

        // Add node.
        Node* AddNode(const NodeProto& p_nodeProto,
            const ArgNameToTypeMap& p_nameToType);

        // Copy node and add to graph.
        Node* AddNode(const Node& p_other);

        // Remove node.
        bool RemoveNode(Node* p_node);

        // Add control edge.
        // A control edge only constraints execution order, and it has no data
        // dependency.
        // <p_src> source node, <p_dst> destination node.
        bool AddControlEdge(Node* p_src, Node* p_dst);

        // Mark graph as needing resolve.
        // <p_needsVerification> whether the resolve needs to include shape
        // and type validation.
        void SetGraphResolveNeeded(bool p_needsVerification = true)
        {
            m_graphResolveNeeded = true;
            m_graphProtoSyncNeeded = true;
            if (p_needsVerification)
            {
                m_needsVerification = true;
            }
        }

        // Mark graph as needing proto sync.
        void SetGraphProtoSyncNeeded()
        {
            m_graphProtoSyncNeeded = true;
        }

        // Get graph inputs.
        const std::vector<const NodeArg*>& GetInputs() const
        {
            return m_graphInputs;
        }

        // Get graph inputs outputs.
        const std::vector<const NodeArg*>& GetOutputs() const
        {
            return m_graphOutputs;
        }

        // Get graph inputs outputs.
        std::vector<NodeArg*> GetOutputsInternal() const
        {
            std::vector<NodeArg*> outputs;
            for (auto& nodeArg : m_graphOutputs)
            {
                outputs.push_back(const_cast<NodeArg*>(nodeArg));
            }
            return outputs;
        }

        // Get all nodes.
        const std::vector<Node*>& GetNodes() const
        {
            return m_nodes;
        }

        // Get node with specified node index.
        Node* GetNode(NodeIndex p_nodeIndex)
        {
            return m_nodes[p_nodeIndex];
        }

        // Get node with specified node index.
        const Node* GetNode(NodeIndex p_nodeIndex) const
        {
            return m_nodes[p_nodeIndex];
        }

        // Get the mutable GraphProto.
        GraphProto* GetMutableGraphProto()
        {
            return m_graphProto;
        }

        // Get GraphProto.
        const GraphProto& GetGraphProto() const;

        // Get node name to node map.
        const NameToNodeMap& GetAllNamedNodes() const
        {
            return m_nameToNodeMap;
        }

        // Get initial tensors.
        const InitialTensorSet& GetAllInitialTensors() const
        {
            return m_nameToInitialTensor;
        }

        // Remove initial tensor. Return true if remove successfully.
        bool RemoveInitialTensor(const std::string& p_tensorName)
        {
            auto iter = m_nameToInitialTensor.find(p_tensorName);
            if (m_nameToInitialTensor.end() != iter)
            {
                m_nameToInitialTensor.erase(iter);
                m_graphProtoSyncNeeded = true;
                return true;
            }
            return false;
        }

        // Get all ValueInfo.
        const std::unordered_map<std::string, ValueInfoProto>& GetAllValueInfos() const
        {
            return m_nameToValueInfo;
        }

        // Get whether the specified op type is in the specified domain.
        bool IsRegisteredInDomain(const std::string& p_domain, const std::string& p_opType) const;

        // Get <*this> graph's domain.
        const std::string& DomainToVersionMap() const
        {
            return m_domainToVersionMap;
        }

        // Get <*this> graph's name.
        const std::string& Name() const
        {
            return m_graphProto->name();
        }

        // Set <*this> graph's name.
        void SetName(const std::string& p_name)
        {
            m_graphProto->set_name(p_name);
        }

        // Add an input or output <nodearg> to <*this> graph.
        // The input or output is owned by <*this> graph. Returns the added nodearg.
        NodeArg* AddNodeArg(const std::string& p_name, const TypeProto* p_typeProto = nullptr)
        {
            auto result = m_nameToNodeArgs.insert({ p_name, std::unique_ptr<NodeArg>(new NodeArg(p_name, p_typeProto)) });
            if (!result.second)
            {
                // NodeArg already exists.
                return result.first->second.get();
            }
            else
            {
                // This is a newly added NodeArg.
                // Add source/sink nodes if needed.
                if (IsSourceNode(p_name))
                {
                    // The NodeArg is potentially an input to the graph.
                    m_sourceNodeArgs.insert(result.first->second.get());
                }
                if (IsSinkNode(p_name))
                {
                    // The NodeArg is potentially an output to the graph.
                    m_sinkNodeArgs.insert(result.first->second.get());
                }
                return result.first->second.get();
            }
        }

        // Get NodeArg by name.
        NodeArg* GetNodeArg(const std::string& p_name)
        {
            auto iter = m_nameToNodeArgs.find(p_name);
            if (m_nameToNodeArgs.end() != iter)
            {
                return iter->second.get();
            }
            return nullptr;
        }

        // Get NodeArg by name.
        const NodeArg* GetNodeArg(const std::string& p_name) const
        {
            auto iter = m_nameToNodeArgs.find(p_name);
            if (m_nameToNodeArgs.end() != iter)
            {
                return iter->second.get();
            }
            return nullptr;
        }

        // Get NodeArg by name.
        NodeArg* GetNodeArg(const std::string& p_name, const TypeProto& p_typeProto)
        {
            auto iter = m_nameToNodeArgs.find(p_name);
            if (m_nameToNodeArgs.end() != iter)
            {
                // The NodeArg exists. Validate that the existing type
                // is the same as the required type.
                const TypeProto* existingType = iter->second->TypeAsProto();
                if (nullptr == existingType)
                {
                    // The NodeArg was previously created without a type.
                    // Update it to use the specified type.
                    iter->second->SetType(p_typeProto);
                    return iter->second.get();
                }
                else if (TypeProtoCompare::Identical(*existingType, p_typeProto))
                {
                    // The NodeArg already exists with the same type.
                    return iter->second.get();
                }
                else
                {
                    // The NodeArg exists but has a different type.
                    // Return nullptr because we don't allow a NodeArg to have different types.
                    return nullptr;
                }
            }
            else
            {
                // The NodeArg does not exist yet. Create it with the specified type.
                auto result = m_nameToNodeArgs.insert({ p_name, std::unique_ptr<NodeArg>(new NodeArg(p_name, &p_typeProto)) });
                if (!result.second)
                {
                    // The NodeArg was added by a concurrent call to AddNodeArg.
                    // Return nullptr because we don't know if the concurrently-added NodeArg has the same type.
                    return nullptr;
                }
                else
                {
                    // This is a newly added NodeArg.
                    // Add source/sink nodes if needed.
                    if (IsSourceNode(p_name))
                    {
                        // The NodeArg is potentially an input to the graph.
                        m_sourceNodeArgs.insert(result.first->second.get());
                    }
                    if (IsSinkNode(p_name))
                    {
                        // The NodeArg is potentially an output to the graph.
                        m_sinkNodeArgs.insert(result.first->second.get());
                    }
                    return result.first->second.get();
                }
            }
        }

        // Get the map of name to NodeArg.
        const std::unordered_map<std::string, std::unique_ptr<NodeArg>>& GetNodeArgMap() const
        {
            return m_nameToNodeArgs;
        }

        // Get the map of operator domains to their opset versions.
        const std::unordered_map<std::string, int>& DomainToVersionMap() const
        {
            return m_domainToVersion;
        }

        // Get the map of operator domains to their opset versions.
        std::unordered_map<std::string, int>& DomainToVersionMap()
        {
            return m_domainToVersion;
        }

        // Add an initializer tensor to <*this> graph.
        // The tensor is owned by <*this> graph. Returns the added tensor.
        const ONNX_NAMESPACE::TensorProto* AddInitializedTensor(const ONNX_NAMESPACE::TensorProto& p_tensor)
        {
            if (m_nameToInitialTensor.end() != m_nameToInitialTensor.find(p_tensor.name()))
            {
                return nullptr;
            }

            auto tensor = std::make_unique<ONNX_NAMESPACE::TensorProto>(p_tensor);
            auto* result = tensor.get();
            m_nameToInitialTensor[tensor->name()] = std::move(tensor);
            m_graphProtoSyncNeeded = true;
            return result;
        }

        // Get an initializer tensor by name.
        const ONNX_NAMESPACE::TensorProto* GetInitializedTensor(const std::string& p_name) const
        {
            auto iter = m_nameToInitialTensor.find(p_name);
            if (m_nameToInitialTensor.end() != iter)
            {
                return iter->second.get();
            }
            return nullptr;
        }

        // Return true if a NodeArg with <p_name> exists.
        bool IsNodeArgExist(const std::string& p_name) const
        {
            return m_nameToNodeArgs.end() != m_nameToNodeArgs.find(p_name);
        }

        // Return true if a node with <p_name> exists.
        bool IsNodeExist(const std::string& p_name) const
        {
            return m_nameToNodeMap.end() != m_nameToNodeMap.find(p_name);
        }

        // Get graph inputs/outputs.
        void GetInputsOutputs(std::vector<const NodeArg*>& p_inputs,
            std::vector<const NodeArg*>& p_outputs) const;

        // Build and verify node connection (edges).
        // Verify NodeArg name/type/shape matching correctly.
        Status BuildConnections();

        // Check whether <*this> graph is acyclic.
        // Return true means it's acyclic, false means it's cyclic.
        bool IsAcyclic() const;

        // Topological sort nodes of <*this> graph.
        Status TopologicalSort(std::vector<Node*>& p_nodesInTopologicalOrder);

        // Perform the topological sort and validate the ordering.
        Status ValidateNodesTopologicalOrder();

        // Resolve <*this> graph inputs/outputs.
        Status ResolveInputsOutputs();

        // Infer and set type information across <*this> graph if needed.
        Status InferAndVerifyTypeMatch(const Node* p_node,
            const OpSignature* p_op,
            const std::unordered_map<std::string, ONNX_NAMESPACE::TypeProto>& p_inputTypes);

        // Set graph inputs/outputs when resolving a graph..
        Status SetInputsOutputs();

        // Sync graph inputs/outputs when serializing to proto.
        void SyncInputsOutputs();

        // Construct a Graph instance for subgraph.
        // The parent graph is responsible for the lifetime of the subgraph.
        Graph* CreateSubgraph();

        // Get all subgraphs.
        std::vector<Graph*> GetAllSubgraphs()
        {
            return m_subgraphs;
        }

        // Get all subgraphs.
        std::vector<const Graph*> GetAllSubgraphs() const
        {
            std::vector<const Graph*> result;
            for (auto& subgraph : m_subgraphs)
            {
                result.push_back(subgraph);
            }
            return result;
        }

        // Serialize the <*this> graph into GraphProto.
        GraphProto ToGraphProto();

        // Serialize the <*this> graph into GraphProto.
        void ToGraphProto(GraphProto& p_graphProto);

        // Iterate through all nodes in <*this> graph.
        // The iteration order is not defined.
        void ForEachNode(std::function<void(Node*)> p_func);

        // Iterate through all nodes in <*this> graph.
        // The iteration order is not defined.
        void ForEachNode(std::function<void(const Node*)> p_func) const;

        // Iterate through all nodes in <*this> graph in topological order.
        void ForEachNodeInTopologicalOrder(std::function<void(Node*)> p_func);

        // Iterate through all nodes in <*this> graph in topological order.
        void ForEachNodeInTopologicalOrder(std::function<void(const Node*)> p_func) const;

        // Iterate through all NodeArgs in <*this> graph.
        // The iteration order is not defined.
        void ForEachNodeArg(std::function<void(NodeArg*)> p_func);

        // Iterate through all NodeArgs in <*this> graph.
        // The iteration order is not defined.
        void ForEachNodeArg(std::function<void(const NodeArg*)> p_func) const;

        // Iterate through all initializers in <*this> graph.
        // The iteration order is not defined.
        void ForEachInitializedTensor(std::function<void(const ONNX_NAMESPACE::TensorProto*)> p_func) const;

        // Iterate through all inputs in <*this> graph.
        // The iteration order is not defined.
        void ForEachGraphInput(std::function<void(const NodeArg*)> p_func) const;

        // Iterate through all outputs in <*this> graph.
        // The iteration order is not defined.
        void ForEachGraphOutput(std::function<void(const NodeArg*)> p_func) const;

        // Add a NodeArg name into source node list.
        void AddSourceNodeArg(const std::string& p_name)
        {
            auto iter = m_nameToNodeArgs.find(p_name);
            if (m_nameToNodeArgs.end() != iter)
            {
                m_sourceNodeArgs.insert(iter->second.get());
            }
        }

        // Add a NodeArg name into sink node list.
        void AddSinkNodeArg(const std::string& p_name)
        {
            auto iter = m_nameToNodeArgs.find(p_name);
            if (m_nameToNodeArgs.end() != iter)
            {
                m_sinkNodeArgs.insert(iter->second.get());
            }
        }

        // Check whether a NodeArg is a source node.
        bool IsSourceNode(const std::string& p_name) const
        {
            return m_graphInputs.end() != std::find_if(m_graphInputs.begin(), m_graphInputs.end(),
                [&p_name](const NodeArg* nodearg) { return (nodearg->Name() == p_name); });
        }

        // Check whether a NodeArg is a sink node.
        bool IsSinkNode(const std::string& p_name) const
        {
            return m_graphOutputs.end() != std::find_if(m_graphOutputs.begin(), m_graphOutputs.end(),
                [&p_name](const NodeArg* nodearg) { return (nodearg->Name() == p_name); });
        }

        // Check whether a Node is a source node.
        bool IsSourceNode(const Node* p_node) const
        {
            return m_sourceNodes.end() != m_sourceNodes.find(const_cast<Node*>(p_node));
        }

        // Check whether a Node is a sink node.
        bool IsSinkNode(const Node* p_node) const
        {
            return m_sinkNodes.end() != m_sinkNodes.find(const_cast<Node*>(p_node));
        }

        // Get the maximum NodeIndex value used in the graph.
        int MaxNodeIndex() const
        {
            return m_maxNodeIndex;
        }

        // Get the maximum NodeEdgeIndex value used in the graph.
        int MaxNodeEdgeIndex() const
        {
            return m_maxNodeEdgeIndex;
        }

        // Get the node with the specified node index.
        const Node* GetNodeByIndex(int p_index) const
        {
            return m_nodes.at(p_index);
        }

        // Get the node with the specified node index.
        Node* GetNodeByIndex(int p_index)
        {
            return m_nodes.at(p_index);
        }

        // Get the mutable node with the specified node index.
        Node* GetMutableNodeByIndex(int p_index)
        {
            return m_nodes.at(p_index);
        }

        // Get the node with the specified node name.
        const Node* GetNodeByName(const std::string& p_name) const
        {
            auto iter = m_nameToNodeMap.find(p_name);
            if (m_nameToNodeMap.end() == iter)
            {
                return nullptr;
            }
            return iter->second.get();
        }

        // Get the node with the specified node name.
        Node* GetNodeByName(const std::string& p_name)
        {
            auto iter = m_nameToNodeMap.find(p_name);
            if (m_nameToNodeMap.end() == iter)
            {
                return nullptr;
            }
            return iter->second.get();
        }

        // Add a new node to <*this> graph.
        Node* AddNode(const std::string& p_name,
            const std::string& p_opType,
            const std::string& p_description,
            const std::vector<NodeArg*>& p_inputArgs,
            const std::vector<NodeArg*>& p_outputArgs,
            const NodeAttributes& p_attributes,
            const std::string& p_domain);

        // Add a new control edge to <*this> graph.
        // The edge is added between p_srcNode and p_dstNode.
        bool AddControlEdge(NodeIndex p_srcNodeIndex, NodeIndex p_dstNodeIndex);

        // Resolve the graph.
        Status Resolve();

        // Verify that the graph is acyclic.
        Status VerifyIsAcyclic() const;

        // Verify that the graph is topologically sorted.
        Status VerifyTopologicalSortOrder() const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraph() const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInNode(const Node* p_node) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInNodeArgs(const std::vector<const NodeArg*>& p_nodeArgs) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInNodeArg(const NodeArg* p_nodeArg) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInInitializer(const ONNX_NAMESPACE::TensorProto* p_initializer) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInValueInfo(const ValueInfoProto* p_valueInfo) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInTypeProto(const TypeProto* p_typeProto) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInTensorShapeProto(const TensorShapeProto* p_tensorShapeProto) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInDimension(const TensorShapeProto_Dimension* p_dimension) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInSequenceType(const TypeProto_Sequence* p_sequenceType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInMapType(const TypeProto_Map* p_mapType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInOpsetImport() const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphInputs() const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphOutputs() const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphInitializers() const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphValueInfos() const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodes() const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeInputs(const Node* p_node) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeOutputs(const Node* p_node) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributes(const Node* p_node) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttribute(const Node* p_node, const AttributeProto* p_attribute) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTensor(const Node* p_node, const AttributeProto* p_attribute) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeGraph(const Node* p_node, const AttributeProto* p_attribute) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeSparseTensor(const Node* p_node, const AttributeProto* p_attribute) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProto(const Node* p_node, const AttributeProto* p_attribute) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTensorProto(const Node* p_node, const AttributeProto* p_attribute) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeSparseTensorProto(const Node* p_node, const AttributeProto* p_attribute) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeGraphProto(const Node* p_node, const AttributeProto* p_attribute) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoTensor(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoSequence(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoMap(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoOpaque(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoSparseTensor(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoOptional(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoTensorShape(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoTensorShapeDimension(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TensorShapeProto_Dimension* p_dimension) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoSequenceType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Sequence* p_sequenceType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoMapType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Map* p_mapType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoOptionalType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Optional* p_optionalType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoSparseTensorType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_SparseTensor* p_sparseTensorType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoOpaqueType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Opaque* p_opaqueType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoTensorType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Tensor* p_tensorType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoTensorTypeShape(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Tensor* p_tensorType, const TensorShapeProto* p_tensorShape) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoTensorTypeShapeDimension(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Tensor* p_tensorType, const TensorShapeProto* p_tensorShape, const TensorShapeProto_Dimension* p_dimension) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoSparseTensorTypeShape(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_SparseTensor* p_sparseTensorType, const TensorShapeProto* p_tensorShape) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoSparseTensorTypeShapeDimension(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_SparseTensor* p_sparseTensorType, const TensorShapeProto* p_tensorShape, const TensorShapeProto_Dimension* p_dimension) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoSequenceTypeElemType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Sequence* p_sequenceType, const TypeProto* p_elemType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoMapTypeKeyType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Map* p_mapType, const TypeProto* p_keyType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoMapTypeValueType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Map* p_mapType, const TypeProto* p_valueType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoOptionalTypeElemType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Optional* p_optionalType, const TypeProto* p_elemType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoTensorTypeElemType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Tensor* p_tensorType, int p_elemType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoSparseTensorTypeElemType(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_SparseTensor* p_sparseTensorType, int p_elemType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoOpaqueTypeDomain(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Opaque* p_opaqueType, const std::string& p_domain) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTypeProtoOpaqueName(const Node* p_node, const AttributeProto* p_attribute, const TypeProto* p_typeProto, const TypeProto_Opaque* p_opaqueType, const std::string& p_name) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTensorProtoShape(const Node* p_node, const AttributeProto* p_attribute, const TensorProto* p_tensorProto) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTensorProtoShapeDimension(const Node* p_node, const AttributeProto* p_attribute, const TensorProto* p_tensorProto, int64_t p_dimension) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTensorProtoDataType(const Node* p_node, const AttributeProto* p_attribute, const TensorProto* p_tensorProto, int p_dataType) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTensorProtoRawData(const Node* p_node, const AttributeProto* p_attribute, const TensorProto* p_tensorProto, const std::string& p_rawData) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTensorProtoExternalData(const Node* p_node, const AttributeProto* p_attribute, const TensorProto* p_tensorProto, const StringStringEntryProto* p_externalData) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTensorProtoExternalDataKey(const Node* p_node, const AttributeProto* p_attribute, const TensorProto* p_tensorProto, const StringStringEntryProto* p_externalData, const std::string& p_key) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeInferenceInGraphNodeAttributeTensorProtoExternalDataValue(const Node* p_node, const AttributeProto* p_attribute, const TensorProto* p_tensorProto, const StringStringEntryProto* p_externalData, const std::string& p_value) const;

        // Verify that the graph has no unresolved shape inference.
        Status VerifyNoUnresolvedShapeIn