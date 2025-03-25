"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { useNotifications } from "@/context/NotificationContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationBell from "@/components/notifications/NotificationBell";
const NotificationCenter = dynamic(
  () =>
    import("@/components/notifications/NotificationCenter").then(
      (mod) => mod.default
    ),
  { ssr: false }
);
// Force reload - using correct paths for root location
import { AuthModal } from "@/components/auth/AuthModal";
import { ResumeTab } from "@/components/tabs/ResumeTab";
import { CaptainTab } from "@/components/tabs/CaptainTab";
import { CalendarTab } from "@/components/tabs/CalendarTab";
import { AnalyticsTab } from "@/components/tabs/AnalyticsTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";
import { HelpTab } from "@/components/tabs/HelpTab";
import { OpportunitiesTab } from "@/components/tabs/OpportunitiesTab";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Calendar as CalendarIcon2, LogOut } from "lucide-react";

import { useAppState } from "@/context/context";
import { Opportunity, CalendarEvent } from "@/context/types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Lock, ArrowUp, HelpCircle, Settings } from "lucide-react";
import { loadUserData, saveUserData, useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth-service";
import { promptsByStatus, promptsByCategory } from "@/utils/constants/prompts";
import { initialJobRecommendations } from "@/utils/constants/sampleData";
import { StatusChange, JobRecommendation, RatedRecommendation } from "@/types";
import { ProtectedContent } from "@/components/ProtectedContent";
import { allGuides } from "@/components/help/guides";
export default function CAPTAINGui() {
  const { state, dispatch } = useAppState();
  const { opportunities, masterResume, events, chatMessages } = state;
  const {
    user,

    isLoading: authLoading,

    localStorageOnly,
    setLocalStorageOnly,
  } = useAuth();
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
  // Load user data when user logs in
  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        try {
          // Get data from Supabase
          const userData = await loadUserData();

          // Check if we have opportunities from Supabase
          if (userData.opportunities && userData.opportunities.length > 0) {
            // If we have data from the cloud and user is not in local-only mode,
            // completely replace the opportunities with cloud data
            if (!localStorageOnly) {
              console.log("Replacing local opportunities with cloud data");

              // Rather than adding one by one, just set the entire array at once
              // This assumes we've added a 'SET_OPPORTUNITIES' action to our reducer
              dispatch({
                type: "SET_OPPORTUNITIES",
                payload: userData.opportunities,
              });

              // Also update the resume and events
              if (userData.resume) {
                dispatch({
                  type: "UPDATE_MASTER_RESUME",
                  payload: userData.resume,
                });
              }

              if (userData.events && userData.events.length > 0) {
                // Similar approach for events - replace all at once
                dispatch({ type: "SET_EVENTS", payload: userData.events });
              }

              // Update last modified timestamps for all opportunities
              const newTimestamps = { ...lastModifiedTimestamps };
              userData.opportunities.forEach((opp) => {
                newTimestamps[opp.id] = new Date().toISOString();
              });
              setLastModifiedTimestamps(newTimestamps);

              console.log(
                `Loaded ${userData.opportunities.length} opportunities from cloud`
              );
            } else {
              console.log("User in local-only mode, not loading cloud data");
            }
          } else {
            console.log("No opportunities found in cloud storage");
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    }

    fetchUserData();
  }, [user, localStorageOnly]);

  // Save user data when it changes
  useEffect(() => {
    async function persistUserData() {
      if (user) {
        try {
          await saveUserData({
            opportunities,
            resume: masterResume,
            events,
          });
        } catch (error) {
          console.error("Error saving user data:", error);
        }
      }
    }

    // Debounce to avoid too many saves
    const timeoutId = setTimeout(persistUserData, 1000);
    return () => clearTimeout(timeoutId);
  }, [opportunities, masterResume, events, user]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("opportunities");
  const [helpView, setHelpView] = useState<{
    active: boolean;
    guideId?: string;
    sectionId?: string;
  }>({ active: false });

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
    Record<number, string>
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
  const updateLastModified = (opportunityId: number) => {
    const newTimestamps = { ...lastModifiedTimestamps };
    newTimestamps[opportunityId] = new Date().toISOString();
    setLastModifiedTimestamps(newTimestamps);
  };

  // Helper function for updating an opportunity
  const updateOpportunity = (
    opportunityId: number,
    updates: Partial<Opportunity>
  ) => {
    // Get the current opportunity
    const currentOpp = opportunities.find((opp) => opp.id === opportunityId);

    // Only proceed if we found the opportunity
    if (!currentOpp) {
      console.error(`Opportunity with ID ${opportunityId} not found`);
      return;
    }

    // If we're updating status, record this change
    if (updates.status && updates.status !== currentOpp.status) {
      const newStatusChange = {
        id: Date.now(),
        opportunityId,
        oldStatus: currentOpp.status,
        newStatus: updates.status,
        date: new Date().toISOString(),
        company: currentOpp.company,
        position: currentOpp.position,
      };

      setStatusChanges((prev) => [...prev, newStatusChange]);
    }

    dispatch({
      type: "UPDATE_OPPORTUNITY",
      payload: {
        id: opportunityId,
        updates,
      },
    });
    updateLastModified(opportunityId);
  };

  // Generate analytics data using useMemo to prevent recalculation on every render
  const analytics = useMemo(() => {
    // Status distribution
    const statusCounts = opportunities.reduce((acc, opp) => {
      acc[opp.status] = (acc[opp.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get all applications with valid dates and sort them
    const applicationsWithDates = opportunities
      .filter((opp) => opp.appliedDate)
      .map((opp) => {
        try {
          return {
            id: opp.id,
            date: new Date(opp.appliedDate),
          };
        } catch (e) {
          return null;
        }
      })
      .filter((app) => app !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Generate timeline data for different periods
    const generateTimelineData = (days: number) => {
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
          totalCount: 0,
        });
      }

      // Count applications for each date
      let runningTotal = 0;
      datePoints.forEach((point, index) => {
        // Count applications on this specific date
        const appsOnDate = applicationsWithDates.filter(
          (app) =>
            app.date.getDate() === point.date.getDate() &&
            app.date.getMonth() === point.date.getMonth() &&
            app.date.getFullYear() === point.date.getFullYear()
        );

        point.count = appsOnDate.length;
        runningTotal += point.count;
        point.totalCount = runningTotal;
      });

      return datePoints;
    };

    // Generate data for different time periods

    // Fix for all-time view date calculation
    const getDateDifference = (date1: Date, date2: Date): number => {
      return Math.ceil(
        (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
      );
    };

    const timelineData = {
      "7days": generateTimelineData(7),
      "30days": generateTimelineData(30),
      "90days": generateTimelineData(90),
      all:
        applicationsWithDates.length > 0
          ? (() => {
              // For all-time view, use actual application dates
              const firstAppDate = applicationsWithDates[0].date;
              const daysDiff = getDateDifference(new Date(), firstAppDate);
              return generateTimelineData(Math.min(daysDiff, 365)); // Cap at 365 days
            })()
          : [],
    };

    // Response rate
    const responseCount = opportunities.filter((opp) =>
      [
        "Screening",
        "Technical Assessment",
        "First Interview",
        "Second Interview",
        "Final Interview",
        "Offer Received",
        "Offer Accepted",
        "Offer Declined",
      ].includes(opp.status)
    ).length;

    const responseRate =
      opportunities.length > 0
        ? ((responseCount / opportunities.length) * 100).toFixed(1)
        : "0";

    // Interview conversion rate
    const interviewCount = opportunities.filter((opp) =>
      [
        "First Interview",
        "Second Interview",
        "Final Interview",
        "Offer Received",
        "Offer Accepted",
        "Offer Declined",
      ].includes(opp.status)
    ).length;

    const interviewRate =
      responseCount > 0
        ? ((interviewCount / responseCount) * 100).toFixed(1)
        : "0";

    // Offer rate
    const offerCount = opportunities.filter((opp) =>
      ["Offer Received", "Offer Accepted", "Offer Declined"].includes(
        opp.status
      )
    ).length;

    const offerRate =
      interviewCount > 0
        ? ((offerCount / interviewCount) * 100).toFixed(1)
        : "0";

    // Weekly application count
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyApplicationCount = opportunities.filter((opp) => {
      const appDate = new Date(opp.appliedDate);
      return appDate >= startOfWeek;
    }).length;

    // Helper function to calculate application streak
    const calculateStreak = (opportunities: Opportunity[]) => {
      const today = new Date();
      let streak = 0;

      // Check the past 30 days for consecutive applications
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date();
        checkDate.setDate(today.getDate() - i);

        const hasApplication = opportunities.some((opp) => {
          const appDate = new Date(opp.appliedDate);
          return appDate.toDateString() === checkDate.toDateString();
        });

        if (hasApplication) {
          streak++;
        } else if (streak > 0) {
          // Break on first day with no applications
          break;
        }
      }

      return streak;
    };

    // Job Search Level System
    const calculateJobSearchLevel = (opportunities: Opportunity[]) => {
      const baseScore = opportunities.length * 10;
      const interviewBonus =
        opportunities.filter((opp: Opportunity) =>
          [
            "Screening",
            "Technical Assessment",
            "First Interview",
            "Second Interview",
            "Final Interview",
          ].includes(opp.status)
        ).length * 25;
      const offerBonus =
        opportunities.filter((opp: Opportunity) =>
          ["Offer Received", "Offer Accepted"].includes(opp.status)
        ).length * 100;

      const totalScore = baseScore + interviewBonus + offerBonus;

      // Define levels
      const level = Math.floor(totalScore / 100) + 1;
      const nextLevelScore = level * 100;
      const progress = totalScore % 100;

      return {
        level,
        progress,
        nextLevelScore,
        pointsToNextLevel: nextLevelScore - totalScore,
        totalScore,
      };
    };

    // Achievement System
    const calculateAchievements = (
      opportunities: Opportunity[],
      events: CalendarEvent[]
    ) => {
      return [
        {
          id: "first_application",
          name: "First Steps",
          description: "Submit your first job application",
          icon: "Rocket",
          unlocked: opportunities.length > 0,
          progress: Math.min(opportunities.length, 1),
          total: 1,
        },
        {
          id: "application_milestone",
          name: "Application Sprint",
          description: "Apply to 20 jobs",
          icon: "Send",
          unlocked: opportunities.length >= 20,
          progress: Math.min(opportunities.length, 20),
          total: 20,
        },
        {
          id: "interview_milestone",
          name: "Interview Pro",
          description: "Secure 5 interviews",
          icon: "Users",
          unlocked:
            opportunities.filter((opp: Opportunity) =>
              [
                "First Interview",
                "Second Interview",
                "Final Interview",
              ].includes(opp.status)
            ).length >= 5,
          progress: opportunities.filter((opp: Opportunity) =>
            ["First Interview", "Second Interview", "Final Interview"].includes(
              opp.status
            )
          ).length,
          total: 5,
        },
        {
          id: "offer_milestone",
          name: "Offer Collector",
          description: "Receive 3 job offers",
          icon: "Award",
          unlocked:
            opportunities.filter((opp: Opportunity) =>
              ["Offer Received", "Offer Accepted", "Offer Declined"].includes(
                opp.status
              )
            ).length >= 3,
          progress: opportunities.filter((opp: Opportunity) =>
            ["Offer Received", "Offer Accepted", "Offer Declined"].includes(
              opp.status
            )
          ).length,
          total: 3,
        },
        {
          id: "diverse_applications",
          name: "Explorer",
          description: "Apply to 10 different companies",
          icon: "Globe",
          unlocked:
            new Set(opportunities.map((opp: Opportunity) => opp.company))
              .size >= 10,
          progress: Math.min(
            new Set(opportunities.map((opp: Opportunity) => opp.company)).size,
            10
          ),
          total: 10,
        },
        {
          id: "streak_week",
          name: "Perfect Week",
          description: "Apply to at least one job every day for a week",
          icon: "CalendarIcon2",
          unlocked: calculateStreak(opportunities) >= 7,
          progress: Math.min(calculateStreak(opportunities), 7),
          total: 7,
        },
      ];
    };

    // Weekly Activity Patterns
    const calculateDayOfWeekActivity = (
      opportunities: Opportunity[],
      events: CalendarEvent[]
    ) => {
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const activityByDay = daysOfWeek.map((day) => ({ day, count: 0 }));

      // Count applications by day of week
      opportunities.forEach((opp: Opportunity) => {
        try {
          const date = new Date(opp.appliedDate);
          const dayIndex = date.getDay();
          activityByDay[dayIndex].count += 1;
        } catch (e) {
          // Handle invalid dates
        }
      });

      // Count events by day of week
      events.forEach((event: CalendarEvent) => {
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
      const leastActiveDay =
        [...activityByDay]
          .filter((day) => day.count > 0)
          .sort((a, b) => a.count - b.count)[0] ||
        sortedDays[sortedDays.length - 1];

      return {
        activityByDay,
        mostActiveDay,
        leastActiveDay,
      };
    };

    // Weekly Challenges
    const generateWeeklyChallenges = () => {
      // Helper function for date difference calculation
      const getDateDifference = (date1: Date, date2: Date): number => {
        return Math.ceil(
          (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
        );
      };

      // Get current week number
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(
        (getDateDifference(now, startOfYear) + startOfYear.getDay() + 1) / 7
      );

      // This week's applications
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setDate(now.getDate() - now.getDay());

      const applicationsThisWeek = opportunities.filter((opp: Opportunity) => {
        try {
          const appDate = new Date(opp.appliedDate);
          return appDate >= startOfThisWeek && appDate <= now;
        } catch (e) {
          return false;
        }
      }).length;

      // Generate weekly challenges
      return [
        {
          id: `week_${weekNumber}_1`,
          name: "Application Sprint",
          description: "Apply to 5 jobs this week",
          reward: "50 points",
          icon: "Send",
          target: 5,
          progress: applicationsThisWeek,
          complete: applicationsThisWeek >= 5,
        },
        {
          id: `week_${weekNumber}_2`,
          name: "Quality Applications",
          description: "Write 3 custom cover letters",
          reward: "75 points",
          icon: "FileText",
          target: 3,
          progress: events.filter(
            (event: CalendarEvent) =>
              event.type === "followup" &&
              event.date >= startOfThisWeek.toISOString()
          ).length,
          complete:
            events.filter(
              (event: CalendarEvent) =>
                event.type === "followup" &&
                event.date >= startOfThisWeek.toISOString()
            ).length >= 3,
        },
        {
          id: `week_${weekNumber}_3`,
          name: "Network Builder",
          description: "Attend 1 networking event",
          reward: "100 points",
          icon: "Users",
          target: 1,
          progress: 0,
          complete: false,
        },
      ];
    };

    // Job Search Insights
    const generateJobSearchInsights = (opportunities: Opportunity[]) => {
      const insights: { title: string; description: string; icon: string }[] =
        [];

      // Only generate insights if we have enough data
      if (opportunities.length < 5) {
        return insights;
      }

      // Response rate by company size
      const largeCompanies = opportunities.filter(
        (opp: Opportunity) =>
          opp.company.includes("Inc") ||
          opp.company.includes("Corp") ||
          opp.company.includes("LLC")
      );
      const largeCompanyResponseRate =
        largeCompanies.length > 0
          ? (largeCompanies.filter((opp: Opportunity) =>
              ["Screening", "Technical Assessment", "First Interview"].includes(
                opp.status
              )
            ).length /
              largeCompanies.length) *
            100
          : 0;

      const smallCompanies = opportunities.filter(
        (opp: Opportunity) =>
          !opp.company.includes("Inc") &&
          !opp.company.includes("Corp") &&
          !opp.company.includes("LLC")
      );
      const smallCompanyResponseRate =
        smallCompanies.length > 0
          ? (smallCompanies.filter((opp: Opportunity) =>
              ["Screening", "Technical Assessment", "First Interview"].includes(
                opp.status
              )
            ).length /
              smallCompanies.length) *
            100
          : 0;

      // Add company size insight if there's a significant difference
      if (largeCompanies.length > 3 && smallCompanies.length > 3) {
        if (largeCompanyResponseRate > smallCompanyResponseRate + 10) {
          insights.push({
            title: "Large Companies Favor Your Profile",
            description: `You're getting ${largeCompanyResponseRate.toFixed(
              0
            )}% response rate from larger companies vs ${smallCompanyResponseRate.toFixed(
              0
            )}% from smaller ones. Consider focusing more on established companies.`,
            icon: "Building",
          });
        } else if (smallCompanyResponseRate > largeCompanyResponseRate + 10) {
          insights.push({
            title: "Startups & Small Companies Respond Better",
            description: `You're getting ${smallCompanyResponseRate.toFixed(
              0
            )}% response rate from smaller companies vs ${largeCompanyResponseRate.toFixed(
              0
            )}% from larger ones. Consider targeting more startups and small businesses.`,
            icon: "Home",
          });
        }
      }

      // Application volume insight
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const applicationsLast30Days = opportunities.filter(
        (opp: Opportunity) => {
          try {
            const appDate = new Date(opp.appliedDate);
            return appDate >= last30Days;
          } catch (e) {
            return false;
          }
        }
      ).length;

      // Add application volume insights
      if (applicationsLast30Days < 10) {
        insights.push({
          title: "Increase Your Application Volume",
          description:
            "You've submitted only " +
            applicationsLast30Days +
            " applications in the last 30 days. Consider increasing your application rate to improve your chances.",
          icon: "TrendingUp",
        });
      } else if (applicationsLast30Days > 30) {
        insights.push({
          title: "Strong Application Volume",
          description:
            "You've submitted " +
            applicationsLast30Days +
            " applications in the last 30 days. Your high volume approach increases your chances of finding opportunities.",
          icon: "Award",
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
      activeApplications: opportunities.filter(
        (opp) =>
          ![
            "Rejected",
            "Withdrawn",
            "Offer Declined",
            "Position Filled",
            "Position Cancelled",
          ].includes(opp.status)
      ).length,
      weeklyApplicationCount,
      jobSearchStats: calculateJobSearchLevel(opportunities),
      achievements: calculateAchievements(opportunities, events),
      weeklyPatterns: calculateDayOfWeekActivity(opportunities, events),
      weeklyChallenges: generateWeeklyChallenges(),
      jobSearchInsights: generateJobSearchInsights(opportunities),
    };
  }, [opportunities, events]);

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

  // Sort the filtered opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case "lastModified":
        const aTime = lastModifiedTimestamps[a.id]
          ? new Date(lastModifiedTimestamps[a.id]).getTime()
          : 0;
        const bTime = lastModifiedTimestamps[b.id]
          ? new Date(lastModifiedTimestamps[b.id]).getTime()
          : 0;
        return sortDirection === "asc" ? aTime - bTime : bTime - aTime;

      case "appliedDate":
        const aDate = new Date(a.appliedDate).getTime();
        const bDate = new Date(b.appliedDate).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;

      case "company":
        const compResult = a.company.localeCompare(b.company);
        return sortDirection === "asc" ? compResult : -compResult;

      case "position":
        const posResult = a.position.localeCompare(b.position);
        return sortDirection === "asc" ? posResult : -posResult;

      case "status":
        const statResult = a.status.localeCompare(b.status);
        return sortDirection === "asc" ? statResult : -statResult;

      default:
        return 0;
    }
  });

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

    // Use dispatch instead of setState
    dispatch({ type: "ADD_OPPORTUNITY", payload: newOpp });

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

  const handleSaveDateChange = () => {
    const selectedOpportunity = opportunities[selectedOpportunityIndex];
    // Convert from YYYY-MM-DD to a more readable format
    const dateObj = new Date(editedDate);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Use the helper function to update the opportunity
    updateOpportunity(selectedOpportunity.id, { appliedDate: formattedDate });

    setIsEditingDate(false);
  };

  const [localChatMessages, setLocalChatMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Get chat messages for the selected opportunity
  const opportunityMessages = useMemo(() => {
    if (!selectedOpportunity) return [];
    return chatMessages[selectedOpportunity.id] || [];
  }, [chatMessages, selectedOpportunity]);

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

  // Fix for all-time view date calculation

  // Weekly Activity Patterns
  const calculateDayOfWeekActivity = (
    opportunities: Opportunity[],
    events: CalendarEvent[]
  ) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const activityByDay = daysOfWeek.map((day) => ({ day, count: 0 }));

    // Count applications by day of week
    opportunities.forEach((opp: Opportunity) => {
      try {
        const date = new Date(opp.appliedDate);
        const dayIndex = date.getDay();
        activityByDay[dayIndex].count += 1;
      } catch (e) {
        // Handle invalid dates
      }
    });

    // Count events by day of week
    events.forEach((event: CalendarEvent) => {
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
    const leastActiveDay =
      [...activityByDay]
        .filter((day) => day.count > 0)
        .sort((a, b) => a.count - b.count)[0] ||
      sortedDays[sortedDays.length - 1];

    return {
      activityByDay,
      mostActiveDay,
      leastActiveDay,
    };
  };

  // Weekly Challenges
  const generateWeeklyChallenges = () => {
    // Helper function for date difference calculation
    const getDateDifference = (date1: Date, date2: Date): number => {
      return Math.ceil(
        (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
      );
    };

    // Get current week number
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      (getDateDifference(now, startOfYear) + startOfYear.getDay() + 1) / 7
    );

    // This week's applications
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());

    const applicationsThisWeek = opportunities.filter((opp: Opportunity) => {
      try {
        const appDate = new Date(opp.appliedDate);
        return appDate >= startOfThisWeek && appDate <= now;
      } catch (e) {
        return false;
      }
    }).length;

    // Generate weekly challenges
    return [
      {
        id: `week_${weekNumber}_1`,
        name: "Application Sprint",
        description: "Apply to 5 jobs this week",
        reward: "50 points",
        icon: "Send",
        target: 5,
        progress: applicationsThisWeek,
        complete: applicationsThisWeek >= 5,
      },
      {
        id: `week_${weekNumber}_2`,
        name: "Quality Applications",
        description: "Write 3 custom cover letters",
        reward: "75 points",
        icon: "FileText",
        target: 3,
        progress: events.filter(
          (event: CalendarEvent) =>
            event.type === "followup" &&
            event.date >= startOfThisWeek.toISOString()
        ).length,
        complete:
          events.filter(
            (event: CalendarEvent) =>
              event.type === "followup" &&
              event.date >= startOfThisWeek.toISOString()
          ).length >= 3,
      },
      {
        id: `week_${weekNumber}_3`,
        name: "Network Builder",
        description: "Attend 1 networking event",
        reward: "100 points",
        icon: "Users",
        target: 1,
        progress: 0,
        complete: false,
      },
    ];
  };

  // Job Search Insights
  const generateJobSearchInsights = (opportunities: Opportunity[]) => {
    const insights: { title: string; description: string; icon: string }[] = [];

    // Only generate insights if we have enough data
    if (opportunities.length < 5) {
      return insights;
    }

    // Response rate by company size
    const largeCompanies = opportunities.filter(
      (opp: Opportunity) =>
        opp.company.includes("Inc") ||
        opp.company.includes("Corp") ||
        opp.company.includes("LLC")
    );
    const largeCompanyResponseRate =
      largeCompanies.length > 0
        ? (largeCompanies.filter((opp: Opportunity) =>
            ["Screening", "Technical Assessment", "First Interview"].includes(
              opp.status
            )
          ).length /
            largeCompanies.length) *
          100
        : 0;

    const smallCompanies = opportunities.filter(
      (opp: Opportunity) =>
        !opp.company.includes("Inc") &&
        !opp.company.includes("Corp") &&
        !opp.company.includes("LLC")
    );
    const smallCompanyResponseRate =
      smallCompanies.length > 0
        ? (smallCompanies.filter((opp: Opportunity) =>
            ["Screening", "Technical Assessment", "First Interview"].includes(
              opp.status
            )
          ).length /
            smallCompanies.length) *
          100
        : 0;

    // Add company size insight if there's a significant difference
    if (largeCompanies.length > 3 && smallCompanies.length > 3) {
      if (largeCompanyResponseRate > smallCompanyResponseRate + 10) {
        insights.push({
          title: "Large Companies Favor Your Profile",
          description: `You're getting ${largeCompanyResponseRate.toFixed(
            0
          )}% response rate from larger companies vs ${smallCompanyResponseRate.toFixed(
            0
          )}% from smaller ones. Consider focusing more on established companies.`,
          icon: "Building",
        });
      } else if (smallCompanyResponseRate > largeCompanyResponseRate + 10) {
        insights.push({
          title: "Startups & Small Companies Respond Better",
          description: `You're getting ${smallCompanyResponseRate.toFixed(
            0
          )}% response rate from smaller companies vs ${largeCompanyResponseRate.toFixed(
            0
          )}% from larger ones. Consider targeting more startups and small businesses.`,
          icon: "Home",
        });
      }
    }

    // Application volume insight
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const applicationsLast30Days = opportunities.filter((opp: Opportunity) => {
      try {
        const appDate = new Date(opp.appliedDate);
        return appDate >= last30Days;
      } catch (e) {
        return false;
      }
    }).length;

    // Add application volume insights
    if (applicationsLast30Days < 10) {
      insights.push({
        title: "Increase Your Application Volume",
        description:
          "You've submitted only " +
          applicationsLast30Days +
          " applications in the last 30 days. Consider increasing your application rate to improve your chances.",
        icon: "TrendingUp",
      });
    } else if (applicationsLast30Days > 30) {
      insights.push({
        title: "Strong Application Volume",
        description:
          "You've submitted " +
          applicationsLast30Days +
          " applications in the last 30 days. Your high volume approach increases your chances of finding opportunities.",
        icon: "Award",
      });
    }

    return insights;
  };

  return isClientSide ? (
    <div className="min-h-screen flex flex-col">
      <div
        className={`container mx-auto p-2 sm:p-4 ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
        } flex-grow flex flex-col`}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4 items-end">
            <img
              src="/logo.png"
              alt="Hey You're Hired! Logo"
              className="h-24 w-24 mr-2"
            />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
              Hey You're Hired!
            </h1>
          </div>

          {/* Local storage indicator */}
          {localStorageOnly && (
            <div className="hidden md:flex bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium items-center">
              <Lock className="h-3 w-3 mr-1" />
              Local Storage Only
            </div>
          )}

          {/* Add NotificationBell here */}
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <NotificationBell />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="end">
                <NotificationCenter
                  notifications={notificationContext?.notifications || []}
                  onClearAll={notificationContext?.clearAllNotifications}
                  onClearOne={notificationContext?.clearNotification}
                  onMarkAllRead={notificationContext?.markAllAsRead}
                  onMarkOneRead={notificationContext?.markAsRead}
                  isDarkMode={isDarkMode}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Authentication UI */}
          <div className="ml-auto flex items-center gap-2">
            {authLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm hidden md:inline">{user.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <AuthModal
                trigger={
                  <Button variant="outline" size="sm">
                    Sifgn In
                  </Button>
                }
              />
            )}
          </div>
        </div>

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
                localStorageOnly={localStorageOnly}
                setLocalStorageOnly={setLocalStorageOnly}
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
        <Dialog
          open={showStorageOptionsDialog}
          onOpenChange={setShowStorageOptionsDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Data Storage Options</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Hey You're Hired! offers two ways to store your job application
                data:
              </p>

              <div className="space-y-3">
                <div className="p-3 border rounded-md">
                  <h3 className="font-medium">Cloud Storage (Default)</h3>
                  <p className="text-sm text-gray-600">
                    Your data is securely stored on our servers and available on
                    any device when you log in.
                  </p>
                  <div className="text-sm text-green-600 mt-1">
                    ✓ Access from anywhere
                    <br />
                    ✓ Data backup
                    <br />✓ Device synchronization
                  </div>
                </div>

                <div className="p-3 border rounded-md">
                  <h3 className="font-medium">Local Storage Only</h3>
                  <p className="text-sm text-gray-600">
                    Your data stays only on this device and is never sent to our
                    servers.
                  </p>
                  <div className="text-sm text-blue-600 mt-1">
                    ✓ Enhanced privacy
                    <br />
                    ✓ Works offline
                    <br />✓ No server storage
                  </div>
                </div>
              </div>

              <p className="text-sm">
                You can change this setting anytime in the Privacy Settings
                section.
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
          <div
            className={`fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 z-50 ${
              isDarkMode
                ? "bg-gray-800 text-gray-200"
                : "bg-white text-gray-800"
            } border-t border-l ${
              isDarkMode ? "border-gray-700" : "border-gray-300"
            } shadow-lg`}
          >
            <div
              className={`flex justify-between items-center p-2 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-300"
              }`}
            >
              <h3 className="font-medium">Debug Panel</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowDebugPanel(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                      <h4 className="text-sm font-medium">
                        Selected Opportunity Index
                      </h4>
                      <pre
                        className={`text-xs p-1 rounded ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        {selectedOpportunityIndex}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">Active Tab</h4>
                      <pre
                        className={`text-xs p-1 rounded ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        {activeTab}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">
                        Opportunities Count
                      </h4>
                      <pre
                        className={`text-xs p-1 rounded ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        {opportunities.length}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">Events Count</h4>
                      <pre
                        className={`text-xs p-1 rounded ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        {events.length}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">
                        Selected Opportunity
                      </h4>
                      <pre
                        className={`text-xs p-1 rounded ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        } overflow-auto max-h-40`}
                      >
                        {JSON.stringify(selectedOpportunity, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">
                        Job Recommendations
                      </h4>
                      <pre
                        className={`text-xs p-1 rounded ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        } overflow-auto max-h-40`}
                      >
                        {JSON.stringify(
                          {
                            total: jobRecommendations.length,
                            current: currentRecommendationIndex,
                            rated: ratedRecommendations.length,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">Storage Mode</h4>
                      <pre
                        className={`text-xs p-1 rounded ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        {localStorageOnly
                          ? "Local Storage Only"
                          : "Cloud + Local Storage"}
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="props">
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium">Component Props</h4>
                      <p className="text-xs text-gray-500">
                        No props available for root component
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance">
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium">Render Count</h4>
                      <p className="text-xs">
                        Component render metrics would appear here
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">
                        Local Storage Usage
                      </h4>
                      <pre
                        className={`text-xs p-1 rounded ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        {(() => {
                          try {
                            const usage = JSON.stringify(
                              localStorage.getItem("captainAppState")
                            ).length;
                            return `${(usage / 1024).toFixed(2)} KB / 5MB (${(
                              (usage / (5 * 1024 * 1024)) *
                              100
                            ).toFixed(2)}%)`;
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
                              activeTab,
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
                            localStorage.removeItem("captainAppState");
                            alert(
                              "Local storage cleared. Refresh to reset app."
                            );
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
          <AuthModal
            trigger={<button id="auth-modal-trigger">Sign In</button>}
          />
        </div>

        {/* Footer */}
        <footer
          className={`mt-8 py-4 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                } mb-3 sm:mb-0`}
              >
                © 2025 Hey You're Hired!
              </p>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                    id="footer-dark-mode"
                  />
                  <Label
                    htmlFor="footer-dark-mode"
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {isDarkMode ? "Dark Mode" : "Light Mode"}
                  </Label>
                </div>

                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <a
                    href="#"
                    className={`hover:text-blue-400 mr-3 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Privacy
                  </a>
                  <a
                    href="#"
                    className={`hover:text-blue-400 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Terms
                  </a>
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
