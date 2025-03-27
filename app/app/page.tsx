"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";
// Extract components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DebugPanel from "@/components/DebugPanel";
import StorageOptionsDialog from "@/components/settings/StorageOptionsDialog";
import NotificationBell from "@/components/notifications/NotificationBell";
const NotificationCenter = dynamic(
  () =>
    import("@/components/notifications/NotificationCenter").then(
      (mod) => mod.default
    ),
  { ssr: false }
);

import { ResumeTab } from "@/components/tabs/ResumeTab";
import { CaptainTab } from "@/components/tabs/CaptainTab";
import { CalendarTab } from "@/components/tabs/CalendarTab";
import { AnalyticsTab } from "@/components/tabs/AnalyticsTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";
import { HelpTab } from "@/components/tabs/HelpTab";
import { OpportunitiesTab } from "@/components/tabs/OpportunitiesTab";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useAppState } from "@/context/context";
import { Opportunity, CalendarEvent } from "@/context/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, HelpCircle, Settings } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth-service";
import { promptsByStatus, promptsByCategory } from "@/utils/constants/prompts";
import { initialJobRecommendations } from "@/utils/constants/sampleData";
import { StatusChange, JobRecommendation, RatedRecommendation } from "@/types";
import { ProtectedContent } from "@/components/ProtectedContent";
import { allGuides } from "@/components/help/guides";
import { useAnalytics } from "@/context/useAnalytics";

export default function CAPTAINGui() {
  const { state, dispatch, loading: stateLoading } = useAppState();
  const { opportunities, masterResume, events, chatMessages } = state;
  const { user, isLoading: authLoading } = useAuth();
  const notificationContext = useNotifications();
  const [showStorageOptionsDialog, setShowStorageOptionsDialog] =
    useState(false);
  const [isClientSide, setIsClientSide] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Set client-side flag after initial render
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!authLoading && !user && typeof window !== "undefined") {
      // Check if we're not on the login page already
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/landing";
      }
    }
  }, [user, authLoading]);

  // Show welcome message when user logs in
  useEffect(() => {
    if (user && !localStorage.getItem("welcomed")) {
      // Set a flag to avoid showing the welcome message repeatedly
      localStorage.setItem("welcomed", "true");
      // Show welcome message
      alert(`Welcome, ${user.email}! Your account is now connected.`);
    }
    // Show storage options explanation for first-time users
    if (user && !localStorage.getItem("storageOptionsExplained")) {
      setShowStorageOptionsDialog(true);
      localStorage.setItem("storageOptionsExplained", "true");
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
  const [lastModifiedTimestamps, setLastModifiedTimestamps] = useState<
    Record<string | number, string>
  >({});
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] =
    useState(false);

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
    source: "",
  });
  const [editedContactInfo, setEditedContactInfo] = useState({
    recruiterName: "",
    recruiterEmail: "",
    recruiterPhone: "",
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
    date: new Date().toISOString().split("T")[0],
    type: "interview",
    opportunityId: "",
    notes: "",
  });

  // Batch selection states
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [isBatchSelectMode, setIsBatchSelectMode] = useState(false);

  // Mobile touch handling
  const [touchStart, setTouchStart] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Status change tracking
  const [statusChanges, setStatusChanges] = useState<StatusChange[]>([]);

  // AI prompt states
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);

  // Timeline period state
  const [timelinePeriod, setTimelinePeriod] = useState("30days");
  const [jobRecommendations, setJobRecommendations] = useState<
    JobRecommendation[]
  >(initialJobRecommendations);
  const [currentRecommendationIndex, setCurrentRecommendationIndex] =
    useState(0);
  const [ratedRecommendations, setRatedRecommendations] = useState<
    RatedRecommendation[]
  >([]);
  const [totalRecommendations, setTotalRecommendations] = useState(3); // Initial count based on default recommendations
  const [recommendationsPreview, setRecommendationsPreview] = useState<
    JobRecommendation[]
  >([]);

  // Define selectedOpportunity before any useEffect that uses it
  const selectedOpportunity =
    opportunities.length > 0
      ? opportunities[selectedOpportunityIndex]
      : undefined;

  // Debug logging for selection issues
  useEffect(() => {
    console.log("Selected opportunity index:", selectedOpportunityIndex);
    console.log("Selected opportunity:", selectedOpportunity);
    console.log("All opportunities:", opportunities);
  }, [selectedOpportunityIndex, selectedOpportunity, opportunities]);

  // Helper function to open a specific guide
  const openGuide = useCallback((guideId: string, sectionId?: string) => {
    setActiveTab("help");
    setHelpView({ active: true, guideId, sectionId });
  }, []);

  // Helper function to get prompts based on status
  const getPromptsForStatus = (status: string): string[] => {
    // Default prompts if status doesn't match any category
    const defaultPrompts = [
      "Help me craft a compelling cover letter for this position",
      "Draft an email following up on my application",
      "What questions should I prepare for an interview for this role?",
      "How do I negotiate salary for this position?",
    ];
    // If status is undefined or not in our map, return default prompts
    if (!status || !(status in promptsByStatus)) {
      console.log("Using default prompts - status not found:", status);
      return defaultPrompts;
    }
    // Get the category based on status
    let category = "";
    if (
      ["Bookmarked", "Interested", "Recruiter Contact", "Networking"].includes(
        status
      )
    ) {
      category = "Initial Contact";
    } else if (
      ["Preparing Application", "Applied", "Application Acknowledged"].includes(
        status
      )
    ) {
      category = "Application";
    } else if (
      [
        "Screening",
        "Technical Assessment",
        "First Interview",
        "Second Interview",
        "Final Interview",
        "Reference Check",
      ].includes(status)
    ) {
      category = "Interview Process";
    } else if (
      [
        "Negotiating",
        "Offer Received",
        "Offer Accepted",
        "Offer Declined",
        "Rejected",
        "Withdrawn",
        "Position Filled",
        "Position Cancelled",
      ].includes(status)
    ) {
      category = "Decision";
    } else if (["Following Up", "Waiting"].includes(status)) {
      category = "Follow-up";
    }
    // Get prompts from our predefined list
    const statusPrompts =
      status in promptsByStatus
        ? promptsByStatus[status as keyof typeof promptsByStatus]
        : [];
    const categoryPrompts =
      category in promptsByCategory
        ? promptsByCategory[category as keyof typeof promptsByCategory]
        : [];
    // Prioritize status-specific prompts but ensure variety
    // Return 3 from status and 1 from category for more specificity
    const selectedStatusPrompts = statusPrompts.slice(0, 3);
    const selectedCategoryPrompts = categoryPrompts
      .filter((prompt: string) => !selectedStatusPrompts.includes(prompt))
      .slice(0, 1);
    const result = [...selectedStatusPrompts, ...selectedCategoryPrompts];
    // If we somehow ended up with no prompts, return the defaults
    return result.length > 0 ? result : defaultPrompts;
  };

  // Function to generate chat prompt based on the opportunity
  const generateChatPrompt = (prompt: string): string => {
    if (!selectedOpportunity) {
      return `${prompt}`;
    }
    return `${prompt}\n\nContext about this job opportunity:
Company: ${selectedOpportunity.company}
Position: ${selectedOpportunity.position}
Status: ${selectedOpportunity.status}
Job Description: ${
      selectedOpportunity.jobDescription || "No job description available."
    }
Notes: ${selectedOpportunity.notes || "No notes available."}`;
  };

  // Helper function for updating last modified timestamp
  const updateLastModified = (opportunityId: string | number) => {
    const newTimestamps = { ...lastModifiedTimestamps };
    newTimestamps[opportunityId] = new Date().toISOString();
    setLastModifiedTimestamps(newTimestamps);
  };

  // Helper function for updating an opportunity
  const updateOpportunity = (
    id: string | number,
    updates: Partial<Opportunity>
  ) => {
    // Get the current opportunity
    const currentOpp = opportunities.find((opp) => opp.id === id);
    // Only proceed if we found the opportunity
    if (!currentOpp) {
      console.error(`Opportunity with ID ${id} not found`);
      return;
    }
    // If we're updating status, record this change
    if (updates.status && updates.status !== currentOpp.status) {
      const newStatusChange = {
        id: Date.now(),
        opportunityId: id,
        oldStatus: currentOpp.status,
        newStatus: updates.status,
        date: new Date().toISOString(),
        company: currentOpp.company,
        position: currentOpp.position,
      };
      setStatusChanges((prev) => [...prev, newStatusChange]);
    }
    console.log(`Updating opportunity ${id} with:`, updates);
    dispatch({
      type: "UPDATE_OPPORTUNITY",
      payload: {
        id,
        updates,
      },
    });
    // Convert id to number for lastModifiedTimestamps if it's a string
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    updateLastModified(numericId);
  };

  // Generate analytics data using useMemo to prevent recalculation on every render
  const analytics = useAnalytics(opportunities, events, statusChanges);

  // Filter opportunities based on search term, status filter, and date filter
  const filteredOpportunities = opportunities.filter((opp) => {
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
      switch (dateFilter) {
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

  // // Sort the filtered opportunities
  // const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
  //   switch (sortBy) {
  //     case "lastModified":
  //       const aTime = lastModifiedTimestamps[a.id]
  //         ? new Date(lastModifiedTimestamps[a.id]).getTime()
  //         : 0;
  //       const bTime = lastModifiedTimestamps[b.id]
  //         ? new Date(lastModifiedTimestamps[b.id]).getTime()
  //         : 0;
  //       return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
  //     case "appliedDate":
  //       const aDate = new Date(a.appliedDate).getTime();
  //       const bDate = new Date(b.appliedDate).getTime();
  //       return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
  //     case "company":
  //       const compResult = a.company.localeCompare(b.company);
  //       return sortDirection === "asc" ? compResult : -compResult;
  //     case "position":
  //       const posResult = a.position.localeCompare(b.position);
  //       return sortDirection === "asc" ? posResult : -posResult;
  //     case "status":
  //       const statResult = a.status.localeCompare(b.status);
  //       return sortDirection === "asc" ? statResult : -statResult;
  //     default:
  //       return 0;
  //   }
  // });

  const [newOpportunity, setNewOpportunity] = useState({
    company: "",
    position: "",
    jobDescription: "",
    status: "Interested", // Default is "Interested"
    appliedDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    recruiterName: "",
    recruiterEmail: "",
    recruiterPhone: "",
    notes: "",
    location: "",
    salary: "",
    applicationUrl: "",
    source: "",
    tags: [],
  });

  const handleNewOpportunityChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Use a timestamp for a unique ID
    const uniqueId = Date.now();
    const newOpp = {
      ...newOpportunity,
      id: uniqueId,
      appliedDate: formattedDate,
      resume: masterResume, // Use the master resume for the new opportunity
    };

    // Log before dispatching for debugging
    console.log("Creating new opportunity with ID:", uniqueId);
    console.log("New opportunity data:", newOpp);

    // Use dispatch instead of setState
    dispatch({ type: "ADD_OPPORTUNITY", payload: newOpp });

    // Log after dispatching
    console.log("Dispatched ADD_OPPORTUNITY for:", uniqueId);
    console.log("Current opportunities count:", opportunities.length + 1);

    // Update last modified timestamp
    updateLastModified(uniqueId);

    // After the state update, find the index of the new opportunity and select it
    // We need to do this in the next render cycle to ensure the state has updated
    setTimeout(() => {
      const newIndex = opportunities.findIndex((opp) => opp.id === uniqueId);
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
      appliedDate: new Date().toISOString().split("T")[0],
      recruiterName: "",
      recruiterEmail: "",
      recruiterPhone: "",
      notes: "",
      location: "",
      salary: "",
      applicationUrl: "",
      source: "",
      tags: [],
    });
  };

  // const handleSaveDateChange = () => {
  //   const selectedOpportunity = opportunities[selectedOpportunityIndex];
  //   // Convert from YYYY-MM-DD to a more readable format
  //   const dateObj = new Date(editedDate);
  //   const formattedDate = dateObj.toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   });
  //   // Use the helper function to update the opportunity
  //   updateOpportunity(selectedOpportunity.id, { appliedDate: formattedDate });
  //   setIsEditingDate(false);
  // };

  const [localChatMessages, setLocalChatMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // // Get chat messages for the selected opportunity
  // const opportunityMessages = useMemo(() => {
  //   if (!selectedOpportunity) return [];
  //   return chatMessages[selectedOpportunity.id] || [];
  // }, [chatMessages, selectedOpportunity]);

  useEffect(() => {
    if (selectedOpportunity) {
      fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "suggestions",
          resume: selectedOpportunity.resume,
          jobDescription: selectedOpportunity.jobDescription,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          // Try to parse as JSON, but handle failures
          return response.text().then((text) => {
            try {
              return JSON.parse(text);
            } catch (e) {
              console.error(
                "Failed to parse response as JSON:",
                text.substring(0, 100) + "..."
              );
              return { suggestions: [] }; // Return a default value
            }
          });
        })
        .then((data) => setSuggestions(data.suggestions || []))
        .catch((error) => {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        });
    }
  }, [selectedOpportunity]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() === "" || !selectedOpportunity) return;
    // Add user message to global state
    dispatch({
      type: "ADD_CHAT_MESSAGE",
      payload: {
        opportunityId: selectedOpportunity.id,
        message: currentMessage,
        sender: "user",
      },
    });
    const userMessage = { role: "user", content: currentMessage };
    setLocalChatMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "chat",
          messages: [
            {
              role: "system",
              content: `You are a career advisor. The user's resume is: ${selectedOpportunity.resume}\n\nThe job description is: ${selectedOpportunity.jobDescription}`,
            },
            ...localChatMessages,
            userMessage,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      // Add AI response to global state
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        payload: {
          opportunityId: selectedOpportunity.id,
          message: data.content || "I'm sorry, I couldn't generate a response.",
          sender: "ai",
        },
      });
      setLocalChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content || "I'm sorry, I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error("Error in chat:", error);
      // Add error message to global state
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        payload: {
          opportunityId: selectedOpportunity.id,
          message: "I'm sorry, there was an error processing your request.",
          sender: "ai",
        },
      });
      setLocalChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, there was an error processing your request.",
        },
      ]);
    }
  };

  const [activeTab, setActiveTab] = useState("opportunities");
  const [helpView, setHelpView] = useState<{
    active: boolean;
    guideId?: string;
    sectionId?: string;
  }>({ active: false });

  if (stateLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="h-16 w-16 bg-blue-200 rounded-full animate-pulse mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading You're Hired!...</h2>
        </div>
      </div>
    );
  }
  return isClientSide ? (
    <div className="min-h-screen flex flex-col">
      <div
        className={`container mx-auto p-2 sm:p-4 ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
        } flex-grow flex flex-col`}
      >
        <Header
          isDarkMode={isDarkMode}
          user={user}
          authLoading={authLoading}
          notifications={notificationContext?.notifications || []}
          onClearAll={notificationContext?.clearAllNotifications}
          onClearOne={notificationContext?.clearNotification}
          onMarkAllRead={notificationContext?.markAllAsRead}
          onMarkOneRead={notificationContext?.markAsRead}
        />
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            if (value === "help") {
              setHelpView({ active: true });
            } else {
              setHelpView({ active: false });
            }
          }}
          className={`${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg shadow-md flex-grow flex flex-col`}
        >
          <TabsList
            className={`mb-4 p-2 ${
              isDarkMode ? "bg-gray-700" : "bg-blue-100"
            } rounded-t-lg sticky top-0 z-10 flex w-full justify-center`}
          >
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
          <TabsContent
            value="opportunities"
            className="p-2 sm:p-4 flex-grow overflow-auto"
          >
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
                chatMessages={chatMessages}
              />
            </ProtectedContent>
          </TabsContent>
          <TabsContent
            value="resume"
            className="p-2 sm:p-4 flex-grow overflow-auto"
          >
            <ProtectedContent>
              <ResumeTab
                masterResume={masterResume}
                updateMasterResume={(resume: string) =>
                  dispatch({ type: "UPDATE_MASTER_RESUME", payload: resume })
                }
                opportunities={opportunities}
                dispatch={dispatch}
                isDarkMode={isDarkMode}
                user={user}
              />
            </ProtectedContent>
          </TabsContent>
          <TabsContent
            value="captain"
            className="p-2 sm:p-4 flex-grow overflow-auto"
          >
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
          <TabsContent
            value="analytics"
            className="p-2 sm:p-4 flex-grow overflow-auto"
          >
            <ProtectedContent>
              <AnalyticsTab
                analytics={analytics}
                opportunities={opportunities}
                isDarkMode={isDarkMode}
                user={user}
              />
            </ProtectedContent>
          </TabsContent>
          <TabsContent
            value="calendar"
            className="p-2 sm:p-4 flex-grow overflow-auto"
          >
            <ProtectedContent>
              <CalendarTab
                events={events}
                opportunities={opportunities}
                isDarkMode={isDarkMode}
                user={user}
                dispatch={dispatch}
              />
            </ProtectedContent>
          </TabsContent>
          <TabsContent
            value="settings"
            className="p-2 sm:p-4 flex-grow overflow-auto"
          >
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
              />
            </ProtectedContent>
          </TabsContent>
          <TabsContent
            value="help"
            className="p-2 sm:p-4 flex-grow overflow-auto"
          >
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
          <Button
            className="fixed bottom-4 right-4 rounded-full md:hidden h-10 w-10 p-0"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
        {/* Storage Options Dialog */}
        <StorageOptionsDialog
          open={showStorageOptionsDialog}
          onOpenChange={setShowStorageOptionsDialog}
        />
        {/* Debug panel */}
        <DebugPanel
          showDebugPanel={showDebugPanel}
          setShowDebugPanel={setShowDebugPanel}
          isDarkMode={isDarkMode}
          selectedOpportunityIndex={selectedOpportunityIndex}
          activeTab={activeTab}
          opportunities={opportunities}
          events={events}
          selectedOpportunity={selectedOpportunity}
          jobRecommendations={jobRecommendations}
          currentRecommendationIndex={currentRecommendationIndex}
          ratedRecommendations={ratedRecommendations}
        />

        {/* Footer */}
        <Footer isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
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
