"use client"

import React, { useState, useEffect } from 'react'
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

  const [newOpportunity, setNewOpportunity] = useState({
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
    source: ""
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
    const newTimestamps = {...lastModifiedTimestamps};
    newTimestamps[newOpp.id] = new Date().toISOString();
    setLastModifiedTimestamps(newTimestamps);
    
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
      source: ""
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
    
    //  Use dispatch instead of setState
    dispatch({ 
      type: 'UPDATE_OPPORTUNITY', 
      payload: { 
        id: selectedOpportunity.id, 
        updates: { appliedDate: formattedDate } 
      } 
    });
    
    // Update last modified timestamp
    const newTimestamps = {...lastModifiedTimestamps};
    newTimestamps[selectedOpportunity.id] = new Date().toISOString();
    setLastModifiedTimestamps(newTimestamps);
    
    setIsEditingDate(false);
  };

  const [localChatMessages, setLocalChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const selectedOpportunity = opportunities[selectedOpportunityIndex];

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
      setLocalChatMessages(prev => [...prev, { role: 'assistant', content: data.content || "I'm sorry, I couldn't generate a response." }]);
      
      // Add to global state
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          opportunityId: selectedOpportunity.id,
          message: data.content || "I'm sorry, I couldn't generate a response.",
          sender: 'ai'
        }
      });
    } catch (error) {
      console.error('Error in chat:', error);
      setLocalChatMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, there was an error processing your request." }]);
      
      // Add error message to global state
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          opportunityId: selectedOpportunity.id,
          message: "I'm sorry, there was an error processing your request.",
          sender: 'ai'
        }
      });
    }
  };


  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">CAPTAIN - Career Application Tracking and Intelligence Navigation</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-lg shadow-md">
        <TabsList className="mb-4 p-2 bg-blue-100 rounded-t-lg">
          <TabsTrigger value="opportunities" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Opportunities</TabsTrigger>
          <TabsTrigger value="resume" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Master Resume</TabsTrigger>
          <TabsTrigger value="captain" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Captain</TabsTrigger>
          <TabsTrigger value="analytics" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Analytics</TabsTrigger>
          <TabsTrigger value="calendar" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="p-4">
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
                  
                  {/* Show recruiter fields if status is Recruiter Contact */}
                  {(newOpportunity.status === "Recruiter Contact" || newOpportunity.status === "Networking") && (
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
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="flex-1">
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
                        
                        {/* Legacy statuses */}
                        <SelectGroup>
                          <SelectLabel className="select-category-label">Legacy Statuses</SelectLabel>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="flex-1">
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
                  <div className="flex items-center space-x-2 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <Select value={`${sortBy}-${sortDirection}`} onValueChange={(value) => {
                      const [field, direction] = value.split('-');
                      setSortBy(field);
                      setSortDirection(direction);
                    }}>
                      <SelectTrigger className="flex-1">
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
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">View Mode:</span>
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
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full">
                  {sortedOpportunities.length > 0 ? (
                    sortedOpportunities.map((opp, index) => {
                      const originalIndex = opportunities.findIndex(o => o.id === opp.id);
                      
                      if (viewMode === "card") {
                        return (
                          <Card 
                            key={opp.id} 
                            className={`mb-2 cursor-pointer ${originalIndex === selectedOpportunityIndex ? 'bg-blue-200' : '  bg-white'}`} 
                            onClick={() => setSelectedOpportunityIndex(originalIndex)}
                          >
                            <CardHeader className="py-3">
                              <CardTitle className="text-base">{opp.position}</CardTitle>
                              <CardDescription>{opp.company}</CardDescription>
                            </CardHeader>
                            <CardContent className="py-2">
                              <Badge>{opp.status}</Badge>
                              <p className="text-sm mt-2">Applied: {opp.appliedDate}</p>
                              {lastModifiedTimestamps[opp.id] && (
                                <p className="text-xs mt-2 text-gray-500">
                                  Last modified: {new Date(lastModifiedTimestamps[opp.id]).toLocaleString()}
                                </p>
                              )}
                              <p className="text-xs mt-2 text-gray-600 line-clamp-3 whitespace-pre-line">
                                {opp.jobDescription.substring(0, 150)}...
                              </p>
                            </CardContent>
                          </Card>
                        );
                      } else {
                        // List view - more compact
                        return (
                          <div 
                            key={opp.id} 
                            className={`p-2 mb-1 border rounded cursor-pointer ${originalIndex === selectedOpportunityIndex ? 'bg-blue-200 border-blue-300' : 'bg-white border-gray-200'}`}
                            onClick={() => setSelectedOpportunityIndex(originalIndex)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{opp.position}</h4>
                                <p className="text-sm text-gray-600">{opp.company}</p>
                              </div>
                              <div className="text-right">
                                <Badge className="mb-1">{opp.status}</Badge>
                                <p className="text-xs text-gray-500">{opp.appliedDate}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No opportunities match your search criteria</p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("All");
                          setDateFilter("All");
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="col-span-2 flex flex-col">
              {selectedOpportunity ? (
                <>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-blue-700">{selectedOpportunity.position} at {selectedOpportunity.company}</CardTitle>
                      <div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedOpportunityIndex(prev => (prev > 0 ? prev - 1 : opportunities.length - 1))}
                          disabled={selectedOpportunityIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedOpportunityIndex(prev => (prev < opportunities.length - 1 ? prev + 1 : 0))}
                          disabled={selectedOpportunityIndex === opportunities.length - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <CardDescription>
                        {isEditingDate ? (
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="date" 
                              value={editedDate} 
                              onChange={(e) => setEditedDate(e.target.value)}
                              className="w-40"
                            />
                            <Button size="sm" variant="outline" onClick={handleSaveDateChange}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditingDate(false)}>Cancel</Button>
                          </div>
                        ) : (
                          <span>
                            {selectedOpportunity.status === "Interested" ? "Added on: " : "Applied on: "}
                            {selectedOpportunity.appliedDate} 
                            <Button size="sm" variant="ghost" onClick={() => {
                              setIsEditingDate(true);
                              // Convert the date string to YYYY-MM-DD format for the input
                              const dateObj = new Date(selectedOpportunity.appliedDate);
                              const year = dateObj.getFullYear();
                              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                              const day = String(dateObj.getDate()).padStart(2, '0');
                              setEditedDate(`${year}-${month}-${day}`);
                            }}>Edit</Button>
                          </span>
                        )}
                      </CardDescription>
                      <div>
                        <Select 
                          value={selectedOpportunity.status} 
                          onValueChange={(value) => {
                            dispatch({
                              type: 'UPDATE_OPPORTUNITY',
                              payload: {
                                id: selectedOpportunity.id,
                                updates: { status: value }
                              }
                            });
                            
                            // Update last modified timestamp
                            const newTimestamps = {...lastModifiedTimestamps};
                            newTimestamps[selectedOpportunity.id] = new Date().toISOString();
                            setLastModifiedTimestamps(newTimestamps);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
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
                            
                            {/* Legacy statuses */}
                            <SelectGroup>
                              <SelectLabel className="select-category-label">Legacy Statuses</SelectLabel>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {lastModifiedTimestamps[selectedOpportunity.id] && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last modified: {new Date(lastModifiedTimestamps[selectedOpportunity.id]).toLocaleString()}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow overflow-auto">
                    <Tabs defaultValue="details" className="h-full flex flex-col">
                      <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="resume">Resume</TabsTrigger>
                        <TabsTrigger value="chat">Chat</TabsTrigger>
                      </TabsList>
                      <TabsContent value="details" className="flex-grow overflow-auto">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          {/* Left Card - Job Details with enhanced styling */}
                          <Card className="bg-white overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base text-blue-700 flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                  Job Details
                                </CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                  onClick={() => {
                                    setIsEditingJobDetails(true);
                                    setEditedJobDetails({
                                      location: selectedOpportunity.location || "",
                                      salary: selectedOpportunity.salary || "",
                                      applicationUrl: selectedOpportunity.applicationUrl || "",
                                      source: selectedOpportunity.source || ""
                                    });
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </Button>
                              </div>
                            </div>
                            <CardContent className="space-y-4 p-6">
                              {isEditingJobDetails ? (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="location" className="text-sm font-medium text-gray-500">Location</Label>
                                    <Input
                                      id="location"
                                      value={editedJobDetails.location}
                                      onChange={(e) => setEditedJobDetails({...editedJobDetails, location: e.target.value})}
                                      placeholder="e.g., Remote, New York, NY"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="salary" className="text-sm font-medium text-gray-500">Salary Range</Label>
                                    <Input
                                      id="salary"
                                      value={editedJobDetails.salary}
                                      onChange={(e) => setEditedJobDetails({...editedJobDetails, salary: e.target.value})}
                                      placeholder="e.g., $80,000 - $100,000"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="applicationUrl" className="text-sm font-medium text-gray-500">Application URL</Label>
                                    <Input
                                      id="applicationUrl"
                                      value={editedJobDetails.applicationUrl}
                                      onChange={(e) => setEditedJobDetails({...editedJobDetails, applicationUrl: e.target.value})}
                                      placeholder="https://..."
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="source" className="text-sm font-medium text-gray-500">Source</Label>
                                    <Input
                                      id="source"
                                      value={editedJobDetails.source}
                                      onChange={(e) => setEditedJobDetails({...editedJobDetails, source: e.target.value})}
                                      placeholder="e.g., LinkedIn, Indeed, Referral"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-3 mt-4">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setIsEditingJobDetails(false)}
                                      className="bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        dispatch({
                                          type: 'UPDATE_OPPORTUNITY',
                                          payload: {
                                            id: selectedOpportunity.id,
                                            updates: editedJobDetails
                                          }
                                        });
                                        
                                        // Update last modified timestamp
                                        const newTimestamps = {...lastModifiedTimestamps};
                                        newTimestamps[selectedOpportunity.id] = new Date().toISOString();
                                        setLastModifiedTimestamps(newTimestamps);
                                        
                                        setIsEditingJobDetails(false);
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {selectedOpportunity.location || selectedOpportunity.salary || 
                                   selectedOpportunity.source || selectedOpportunity.applicationUrl ? (
                                    <>
                                      {selectedOpportunity.location && (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="current  Color">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Location
                                          </h4>
                                          <p className="text-gray-700 ml-5 mt-1">{selectedOpportunity.location}</p>
                                        </div>
                                      )}
                                      
                                      {selectedOpportunity.salary && (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Salary Range
                                          </h4>
                                          <p className="text-gray-700 ml-5 mt-1 font-medium">{selectedOpportunity.salary}</p>
                                        </div>
                                      )}
                                      
                                      {selectedOpportunity.source && (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Source
                                          </h4>
                                          <p className="text-gray-700 ml-5 mt-1">{selectedOpportunity.source}</p>
                                        </div>
                                      )}
                                      
                                      {selectedOpportunity.applicationUrl && (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                                            </svg>
                                            Application URL
                                          </h4>
                                          <div className="truncate ml-5 mt-1">
                                            <a 
                                              href={selectedOpportunity.applicationUrl} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                            >
                                              {selectedOpportunity.applicationUrl}
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-center h-16 text-center">
                                      <p className="text-blue-400 italic flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        No job details added yet
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </CardContent>
                          </Card>
                          
                          {/* Right Card - Contact Info with enhanced styling */}
                          <Card className="bg-white overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base text-blue-700 flex items-center">
                                  <User className="h-4 w-4 mr-2 text-blue-500" />
                                  Contact Information
                                </CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                  onClick={() => {
                                    setIsEditingContactInfo(true);
                                    setEditedContactInfo({
                                      recruiterName: selectedOpportunity.recruiterName || "",
                                      recruiterEmail: selectedOpportunity.recruiterEmail || "",
                                      recruiterPhone: selectedOpportunity.recruiterPhone || ""
                                    });
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </Button>
                              </div>
                            </div>
                            <CardContent className="space-y-4 p-6">
                              {isEditingContactInfo ? (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="recruiterName" className="text-sm font-medium text-gray-500">Contact Name</Label>
                                    <Input
                                      id="recruiterName"
                                      value={editedContactInfo.recruiterName}
                                      onChange={(e) => setEditedContactInfo({...editedContactInfo, recruiterName: e.target.value})}
                                      placeholder="e.g., John Smith"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="recruiterEmail" className="text-sm font-medium text-gray-500">Contact Email</Label>
                                    <Input
                                      id="recruiterEmail"
                                      value={editedContactInfo.recruiterEmail}
                                      onChange={(e) => setEditedContactInfo({...editedContactInfo, recruiterEmail: e.target.value})}
                                      placeholder="e.g., john.smith@company.com"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="recruiterPhone" className="text-sm font-medium text-gray-500">Contact Phone</Label>
                                    <Input
                                      id="recruiterPhone"
                                      value={editedContactInfo.recruiterPhone}
                                      onChange={(e) => setEditedContactInfo({...editedContactInfo, recruiterPhone: e.target.value})}
                                      placeholder="e.g., (555) 123-4567"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-3 mt-4">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setIsEditingContactInfo(false)}
                                      className="bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        dispatch({
                                          type: 'UPDATE_OPPORTUNITY',
                                          payload: {
                                            id: selectedOpportunity.id,
                                            updates: editedContactInfo
                                          }
                                        });
                                        
                                        // Update last modified timestamp
                                        const newTimestamps = {...lastModifiedTimestamps};
                                        newTimestamps[selectedOpportunity.id] = new Date().toISOString();
                                        setLastModifiedTimestamps(newTimestamps);
                                        
                                        setIsEditingContactInfo(false);
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {selectedOpportunity.recruiterName || selectedOpportunity.recruiterEmail ||
                                   selectedOpportunity.recruiterPhone ? (
                                    <>
                                      {selectedOpportunity.recruiterName && (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Name
                                          </h4>
                                          <p className="text-gray-700 ml-5 mt-1 font-medium">{selectedOpportunity.recruiterName}</p>
                                        </div>
                                      )}
                                      
                                      {selectedOpportunity.recruiterEmail && (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Email
                                          </h4>
                                          <div className="ml-5 mt-1">
                                            <a 
                                              href={`mailto:${selectedOpportunity.recruiterEmail}`} 
                                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center"
                                            >
                                              {selectedOpportunity.recruiterEmail}
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                              </svg>
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {selectedOpportunity.recruiterPhone && (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Phone
                                          </h4>
                                          <div className="ml-5 mt-1">
                                            <a 
                                              href={`tel:${selectedOpportunity.recruiterPhone}`} 
                                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center"
                                            >
                                              {selectedOpportunity.recruiterPhone}
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                              </svg>
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-center h-16 text-center">
                                      <p className="text-blue-400 italic flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        No contact information added yet
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Status is always shown */}
                                  <div className={`${(!selectedOpportunity.recruiterName && !selectedOpportunity.recruiterEmail && 
                                                   !selectedOpportunity.recruiterPhone) ? "mt-0" : "mt-2 pt-4 border-t border-gray-100"}`}>
                                    <h4 className="text-sm font-medium text-gray-500 flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                      </svg>
                                      Current Status
                                    </h4>
                                    <div className="ml-5 mt-2">
                                      <Badge className={`
                                        ${selectedOpportunity.status === "Offer Received" || selectedOpportunity.status === "Offer Accepted" ? "bg-green-100 text-green-800 border-green-200" : ""}
                                        ${selectedOpportunity.status === "Applied" || selectedOpportunity.status === "Interested" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                                        ${selectedOpportunity.status === "Interview Scheduled" || selectedOpportunity.status === "First Interview" || selectedOpportunity.status === "Second Interview" ? "bg-purple-100 text-purple-800 border-purple-200" : ""}
                                        ${selectedOpportunity.status === "Rejected" || selectedOpportunity.status === "Withdrawn" ? "bg-red-100 text-red-800 border-red-200" : ""}
                                        px-3 py-1 text-xs rounded-full border
                                      `}>
                                        {selectedOpportunity.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Job Description - Enhanced styling with expand/collapse */}
                        <div className="mb-6 flex-grow">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-blue-600" />
                              Job Description
                              {!isEditingJobDescription && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setIsJobDescriptionExpanded(!isJobDescriptionExpanded)}
                                  className="ml-2"
                                >
                                  {isJobDescriptionExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </Button>
                              )}
                            </h3>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setIsEditingJobDescription(true);
                                setEditedJobDescription(selectedOpportunity.jobDescription);
                              }}
                              className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </Button>
                          </div>
                          {isEditingJobDescription ? (
                            <div className="space-y-3">
                              <Textarea 
                                className={`${isJobDescriptionExpanded ? 'h-[600px]' : 'h-[350px]'} font-mono whitespace-pre-wrap border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-colors`}
                                value={editedJobDescription}
                                onChange={(e) => setEditedJobDescription(e.target.value)}
                              />
                              <div className="flex justify-end space-x-3">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsEditingJobDescription(false)}
                                  className="bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={() => {
                                    dispatch({
                                      type: 'UPDATE_OPPORTUNITY',
                                      payload: {
                                        id: selectedOpportunity.id,
                                        updates: { jobDescription: editedJobDescription }
                                      }
                                    });
                                    
                                    // Update last modified timestamp
                                    const newTimestamps = {...lastModifiedTimestamps};
                                    newTimestamps[selectedOpportunity.id] = new Date().toISOString();
                                    setLastModifiedTimestamps(newTimestamps);
                                    
                                    setIsEditingJobDescription(false);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <ScrollArea className={`${isJobDescriptionExpanded ? 'h-[600px]' : 'h-[350px]'} border rounded-md p-5 bg-white shadow-sm hover:shadow transition-shadow`}>
                              <pre className="whitespace-pre-wrap text-gray-700 font-sans">{selectedOpportunity.jobDescription}</pre>
                            </ScrollArea>
                          )}
                        </div>
                        
                        {/* Notes at Bottom - Changed from amber to blue styling */}
                        <Card className="bg-white border-0 shadow-md overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base text-blue-700 flex items-center">
                                <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                                Notes
                              </CardTitle>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                onClick={() => {
                                  setIsEditingNotes(true);
                                  setEditedNotes(selectedOpportunity.notes || "");
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-6">
                            {isEditingNotes ? (
                              <div className="space-y-3">
                                <Textarea 
                                  className="min-h-[100px] border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-colors"
                                  value={editedNotes}
                                  onChange={(e) => setEditedNotes(e.target.value)}
                                  placeholder="Add notes about this opportunity..."
                                />
                                <div className="flex justify-end space-x-3">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setIsEditingNotes(false)}
                                    className="bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => {
                                      dispatch({
                                        type: 'UPDATE_OPPORTUNITY',
                                        payload: {
                                          id: selectedOpportunity.id,
                                          updates: { notes: editedNotes }
                                        }
                                      });
                                      
                                      // Update last modified timestamp
                                      const newTimestamps = {...lastModifiedTimestamps};
                                      newTimestamps[selectedOpportunity.id] = new Date().toISOString();
                                      setLastModifiedTimestamps(newTimestamps);
                                      
                                      setIsEditingNotes(false);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Save Notes
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="min-h-[100px] bg-blue-50 rounded-md p-4 border border-blue-100">
                                {selectedOpportunity.notes ? (
                                  <p className="whitespace-pre-wrap text-gray-700">{selectedOpportunity.notes}</p>
                                ) : (
                                  <div className="flex items-center justify-center h-16 text-center">
                                    <p className="text-blue-400 italic flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      No notes added yet
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="resume">
                        <h3 className="text-lg font-semibold mb-2">Submitted Resume</h3>
                        <ScrollArea className="h-[400px] border rounded-md p-4 bg-white">
                          <pre>{selectedOpportunity.resume}</pre>
                        </ScrollArea>
                      </TabsContent>
                      <TabsContent value="chat">
                        <ScrollArea className="h-[400px] border rounded-md p-4 mb-4 bg-white">
                          {localChatMessages.map((msg, index) => (
                            <div key={index} className={`flex items-start mb-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                              {msg.role === 'assistant' && <Bot className="mr-2 h-6 w-6 text-blue-500" />}
                              <Card className={msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}>
                                <CardContent className="p-3">
                                  <p>{msg.content}</p>
                                </CardContent>
                              </Card>
                              {msg.role === 'user' && <User className="ml-2 h-6 w-6 text-blue-500" />}
                            </div>
                          ))}
                        </ScrollArea>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {suggestions.map((suggestion, index) => (
                            <Button key={index} variant="outline" onClick={() => setCurrentMessage(suggestion)}>
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                        <div className="flex items-center">
                          <Input
                            placeholder="Type your message here..."
                            className="flex-grow mr-2"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </>
              ) : (
                <CardContent>
                  <p className="text-center text-gray-500">No opportunity selected</p>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resume" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-blue-700">Master Resume</CardTitle>
              <CardDescription>Manage and edit your master resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Label htmlFor="freeze-resume" className="mr-2">
                    {isMasterResumeFrozen ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    {isMasterResumeFrozen ? 'Locked' : 'Unlocked'}
                  </Label>
                  <Switch
                    id="freeze-resume"
                    checked={isMasterResumeFrozen}
                    onCheckedChange={setIsMasterResumeFrozen}
                  />
                </div>
                <Button 
                  disabled={isMasterResumeFrozen}
                  onClick={() => dispatch({ type: 'UPDATE_MASTER_RESUME', payload: masterResume })}
                >
                  Save Changes
                </Button>
              </div>
              <Textarea
                className="min-h-[400px] mb-4 font-mono whitespace-pre-wrap"
                placeholder="Paste your master resume here..."
                value={masterResume}
                onChange={(e) => dispatch({ type: 'UPDATE_MASTER_RESUME', payload: e.target.value })}
                disabled={isMasterResumeFrozen}
              />
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resume Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] border rounded-md p-4">
                      <pre className="whitespace-pre-wrap">{masterResume}</pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Change Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] border rounded-md p-4">
                      <ul className="space-y-2">
                        <li>May 20, 2023: Updated skills section</li>
                        <li>May 15, 2023: Added new work experience</li>
                        <li>May 10, 2023: Initial resume creation</li>
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captain" className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-blue-700">CAPTAIN AI Assistant</CardTitle>
                <CardDescription>Your AI career assistant and opportunity analyzer</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] border rounded-md p-4 mb-4 bg-white">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Bot className="mr-2 h-6 w-6 text-blue-500" />
                      <Card className="bg-gray-100">
                        <CardContent className="p-3">
                          <p>Hello! I'm your CAPTAIN AI assistant. How can I help you with your job search today?</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="flex items-start justify-end">
                      <Card className="bg-blue-100">
                        <CardContent className="p-3">
                          <p>Can you analyze my current job applications and suggest improvements?</p>
                        </CardContent>
                      </Card>
                      <User className="ml-2 h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex items-start">
                      <Bot className="mr-2 h-6 w-6 text-blue-500" />
                      <Card className="bg-gray-100">
                        <CardContent className="p-3">
                          <p>Certainly! I'll analyze your applications and provide suggestions for improvement. Here's what I found:</p>
                          <ul className="list-disc pl-5 mt-2">
                            <li>Your resume for the Software Engineer position at TechCorp could benefit from more specific achievements.</li>
                            <li>For the Data Scientist role at DataInc, consider highlighting your experience with big data technologies.</li>
                            <li>Your application for the Machine Learning Engineer position at AIStartup looks strong, but you might want to elaborate on your NLP projects.</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickChatOptions.map((option, index) => (
                    <Button key={index} variant="outline" onClick={() => setCurrentMessage(option)}>
                      {option}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center">
                  <Input
                    placeholder="Ask CAPTAIN anything..."
                    className="flex-grow mr-2"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                  />
                  <Button><Send className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-blue-700">Job Recommendations</CardTitle>
                <CardDescription>Rate these job opportunities to improve recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{jobRecommendations[currentJobIndex].position}</CardTitle>
                      <CardDescription>{jobRecommendations[currentJobIndex].company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px] border rounded-md p-4 mb-4">
                        <p>{jobRecommendations[currentJobIndex].description}</p>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          // Handle thumbs down logic here
                          setCurrentJobIndex((prevIndex) => (prevIndex + 1) % jobRecommendations.length);
                        }}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          // Handle thumbs up logic here
                          setCurrentJobIndex((prevIndex) => (prevIndex + 1) % jobRecommendations.length);
                        }}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentJobIndex((prevIndex) => (prevIndex + 1) % jobRecommendations.length)}
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-blue-700">Job Search Analytics</CardTitle>
              <CardDescription>Visualize your job search progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-gray-200 rounded-md">
                      <BarChartIcon className="h-32 w-32 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]  flex items-center justify-center bg-gray-200 rounded-md">
                      <PieChartIcon className="h-32 w-32 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Match Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-gray-200 rounded-md">
                      <LineChartIcon className="h-32 w-32 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Application Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-gray-200 rounded-md">
                      <ActivityIcon className="h-32 w-32 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-blue-700">Application Calendar</CardTitle>
              <CardDescription>View your application events and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <ul className="space-y-4">
                        {events.map((event) => (
                          <li key={event.id} className="flex items-center">
                            <CalendarIcon className={`mr-2 h-4 w-4 ${
                              event.type === 'interview' ? 'text-blue-500' : 
                              event.type === 'followup' ? 'text-green-500' : 
                              event.type === 'deadline' ? 'text-red-500' : 
                              'text-purple-500'
                            }`} />
                            <div>
                              <p className="font-semibold">{event.title}</p>
                              <p className="text-sm text-gray-500">{event.date}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      
      {/* Debug Panel Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowDebugPanel(!showDebugPanel)}
        className="fixed bottom-4 right-4 z-50"
      >
        {showDebugPanel ? "Hide Debug" : "Show Debug"}
      </Button>

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="fixed bottom-16 right-4 w-96 h-96 bg-white border shadow-lg rounded-md p-4 overflow-auto z-50">
          <h3 className="font-bold mb-2">Global State</h3>
          <pre className="text-xs">{JSON.stringify(state, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
