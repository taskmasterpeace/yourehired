import React, { useState, useCallback, useRef, useEffect } from "react";
import { OpportunityList } from "../opportunities/OpportunityList";
import { OpportunityDetails } from "../opportunities/OpportunityDetails";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  PlusCircle,
  Sparkles,
  FileText,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { Opportunity, ChatMessage } from "../../context/types";
import { ApplicationService } from "@/lib/application-service";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { JobUrlInput } from "@/components/opportunities/JobUrlInput";

interface OpportunitiesTabProps {
  opportunities: Opportunity[];
  selectedOpportunityIndex: number;
  setSelectedOpportunityIndex: (index: number) => void;
  updateOpportunity: (
    id: string | number,
    updates: Partial<Opportunity>
  ) => void;
  isDarkMode: boolean;
  user: any;
  masterResume: string;
  dispatch: any;
  lastModifiedTimestamps?: Record<string | number, string>;
  setLastModifiedTimestamps?: (
    timestamps: Record<string | number, string>
  ) => void;
  chatMessages?: Record<string | number, ChatMessage[]>;
}

export function OpportunitiesTab({
  opportunities,
  selectedOpportunityIndex,
  setSelectedOpportunityIndex,
  updateOpportunity,
  isDarkMode,
  user,
  masterResume,
  dispatch,
  lastModifiedTimestamps = {},
  setLastModifiedTimestamps = () => {},
  chatMessages = {},
}: OpportunitiesTabProps) {
  // Basic state variables
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("lastModified");
  const [sortDirection, setSortDirection] = useState("desc");
  const [viewMode, setViewMode] = useState("card");
  const [isBatchSelectMode, setIsBatchSelectMode] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<(string | number)[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  // State for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogProps, setConfirmDialogProps] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Track if a delete confirmation is currently showing
  const deleteConfirmShowing = useRef(false);

  // Add state for tailoring the resume
  const [isTailoringResume, setIsTailoringResume] = useState(false);
  const [tailoringProgress, setTailoringProgress] = useState(0);
  const [tailoringError, setTailoringError] = useState("");

  // State for master resume warning
  const [showMasterResumeWarning, setShowMasterResumeWarning] = useState(false);

  // New state for two-step job creation flow
  const [extractionStep, setExtractionStep] = useState<"url" | "review">("url");
  const [newOpportunity, setNewOpportunity] = useState({
    company: "",
    position: "",
    jobDescription: "",
    status: "Interested",
    appliedDate: new Date().toISOString().split("T")[0],
    notes: "",
    tailorResume: true, // Default to true for better UX
    location: "",
    salary: "",
    applicationUrl: "",
  });

  // Check if master resume exists
  const hasMasterResume = masterResume && masterResume.trim() !== "";

  // Show master resume warning when dialog opens
  useEffect(() => {
    if (showAddDialog && !hasMasterResume && extractionStep === "review") {
      setShowMasterResumeWarning(true);
      // Auto-disable resume tailoring if no master resume exists
      setNewOpportunity((prev) => ({
        ...prev,
        tailorResume: false,
      }));
    }
  }, [showAddDialog, hasMasterResume, extractionStep]);

  // Use a ref for ApplicationService to ensure we don't create duplicate instances
  const applicationService = useRef(new ApplicationService()).current;

  // Function to show confirmation dialog
  const showConfirmation = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setConfirmDialogProps({
        title,
        message,
        onConfirm,
      });
      setShowConfirmDialog(true);
      deleteConfirmShowing.current = true;
    },
    []
  );

  // Reset form function
  const resetForm = () => {
    setNewOpportunity({
      company: "",
      position: "",
      jobDescription: "",
      status: "Interested",
      appliedDate: new Date().toISOString().split("T")[0],
      notes: "",
      tailorResume: true,
      location: "",
      salary: "",
      applicationUrl: "",
    });
    setExtractionStep("url");
    setIsTailoringResume(false);
    setTailoringProgress(0);
    setTailoringError("");
    setShowMasterResumeWarning(false);
  };

  // Handler for job data extraction from Firecrawl
  const handleJobDataExtracted = (jobData: {
    company: string;
    position: string;
    location: string;
    salary: string;
    jobDescription: string;
    applicationUrl?: string;
  }) => {
    setNewOpportunity({
      ...newOpportunity,
      company: jobData.company || "",
      position: jobData.position || "",
      location: jobData.location || "",
      salary: jobData.salary || "",
      jobDescription: jobData.jobDescription || "",
      applicationUrl: jobData.applicationUrl || newOpportunity.applicationUrl,
    });
  };

  // Function to move to the review step after extraction
  const handleExtractionComplete = () => {
    setExtractionStep("review");
  };

  // Helper function to convert from Opportunity to JobApplication
  const convertToJobApplication = useCallback((opp: Opportunity) => {
    const tags = opp.tags ? opp.tags.map((tag: any) => tag.name || tag) : [];
    // Generate a valid ID
    const id =
      typeof opp.id === "string" && opp.id.includes("-") ? opp.id : uuidv4();
    // Convert the status to the expected type
    const status = opp.status as any;
    return {
      id,
      companyName: opp.company,
      positionTitle: opp.position,
      status,
      dateAdded: new Date().toISOString(),
      dateApplied: opp.appliedDate,
      jobDescription: opp.jobDescription || "",
      location: opp.location || "",
      salary: opp.salary || "",
      contactName: opp.recruiterName || "",
      contactEmail: opp.recruiterEmail || "",
      contactPhone: opp.recruiterPhone || "",
      url: opp.applicationUrl || "",
      notes: opp.notes || "",
      tags,
      resume: opp.resume || "", // Include the resume field
      statusHistory: [],
      events: [],
    };
  }, []);

  // Function to update the last modified timestamp
  const updateModifiedTimestamp = useCallback(
    (id: string | number) => {
      const newTimestamp = new Date().toISOString();
      const newTimestamps = { ...lastModifiedTimestamps };
      newTimestamps[id] = newTimestamp;
      setLastModifiedTimestamps(newTimestamps);
      console.log(`Updated timestamp for opportunity ${id} to ${newTimestamp}`);
      return newTimestamp;
    },
    [lastModifiedTimestamps, setLastModifiedTimestamps]
  );

  // Improved update opportunity function that ensures all fields are properly saved
  const handleUpdateOpportunity = useCallback(
    async (id: string | number, updates: Partial<Opportunity>) => {
      try {
        console.log("Updating opportunity:", id, updates);
        // Update the local state
        updateOpportunity(id, updates);
        // Always update the timestamp when any change is made
        updateModifiedTimestamp(id);
        // Find the opportunity in the opportunities array
        const opportunityIndex = opportunities.findIndex(
          (opp) => opp.id === id
        );
        if (opportunityIndex === -1) {
          console.error(`Cannot find opportunity with ID ${id}`);
          return;
        }
        // Create the complete updated opportunity by merging with updates
        const updatedOpportunity = {
          ...opportunities[opportunityIndex],
          ...updates,
        };
        // Convert to JobApplication format for Supabase
        const jobApp = convertToJobApplication(updatedOpportunity);
        // Save to Supabase
        console.log("Saving to Supabase:", jobApp);
        const result = await applicationService.saveApplication(jobApp);
        console.log("Supabase save result:", result);
        // If we got a new Supabase ID, update our state
        if (
          result &&
          typeof result === "object" &&
          "id" in result &&
          result.id !== id
        ) {
          console.log(`Updating opportunity ID from ${id} to ${result.id}`);
          dispatch({
            type: "UPDATE_OPPORTUNITY",
            payload: { id, updates: { id: result.id } },
          });
        }
      } catch (error) {
        console.error("Error updating opportunity:", error);
      }
    },
    [
      updateOpportunity,
      opportunities,
      updateModifiedTimestamp,
      convertToJobApplication,
      applicationService,
      dispatch,
    ]
  );

  // Function to ensure we only show one delete confirmation
  const deleteOpportunity = useCallback(
    async (id: string | number) => {
      // If already showing a confirmation or processing, don't proceed
      if (deleteConfirmShowing.current || isProcessing) return;

      showConfirmation(
        "Confirm Deletion",
        "Are you sure you want to delete this opportunity?",
        async () => {
          try {
            setIsProcessing(true);

            // If it's a Supabase ID, delete from Supabase
            if (typeof id === "string" && id.includes("-")) {
              await applicationService.deleteApplication(id);
              console.log(`Deleted from Supabase: ${id}`);
            }

            // Delete from state
            dispatch({ type: "DELETE_OPPORTUNITY", payload: id });
            console.log(`Deleted from state: ${id}`);

            // Handle selection adjustment
            const deletedIndex = opportunities.findIndex(
              (opp) => opp.id === id
            );
            if (deletedIndex === selectedOpportunityIndex) {
              // If we deleted the selected one
              if (opportunities.length > 1) {
                setSelectedOpportunityIndex(0);
              }
            } else if (deletedIndex < selectedOpportunityIndex) {
              // If we deleted one before the selected one
              setSelectedOpportunityIndex(selectedOpportunityIndex - 1);
            }
          } catch (error) {
            console.error("Error deleting opportunity:", error);
            alert("Failed to delete opportunity. Please try again.");
          } finally {
            setIsProcessing(false);
            deleteConfirmShowing.current = false;
          }
        }
      );
    },
    [
      isProcessing,
      opportunities,
      selectedOpportunityIndex,
      applicationService,
      dispatch,
      setSelectedOpportunityIndex,
      showConfirmation,
    ]
  );

  // Handler for OpportunityDetails to call deleteOpportunity
  const handleDeleteFromDetails = useCallback(
    (id: string | number) => {
      // The confirmation will be handled inside deleteOpportunity
      deleteOpportunity(id);
    },
    [deleteOpportunity]
  );

  // Helper function for batch deletion
  const handleBatchDelete = useCallback(() => {
    if (
      selectedJobIds.length === 0 ||
      isProcessing ||
      deleteConfirmShowing.current
    )
      return;

    showConfirmation(
      "Confirm Deletion",
      `Are you sure you want to delete ${selectedJobIds.length} selected job(s)?`,
      async () => {
        try {
          setIsProcessing(true);

          const idsToDelete = [...selectedJobIds];
          // Check if selected opportunity will be deleted
          const selectedId = opportunities[selectedOpportunityIndex]?.id;
          const willDeleteSelected = idsToDelete.includes(selectedId);

          // Get count of deleted before the selected one
          const deletedBeforeCount = willDeleteSelected
            ? 0
            : idsToDelete.filter((id) => {
                const oppIndex = opportunities.findIndex((o) => o.id === id);
                return oppIndex !== -1 && oppIndex < selectedOpportunityIndex;
              }).length;

          // Delete from Supabase first
          for (const id of idsToDelete) {
            if (typeof id === "string" && id.includes("-")) {
              try {
                await applicationService.deleteApplication(id);
                console.log(`Deleted from Supabase: ${id}`);
              } catch (e) {
                console.error(`Failed to delete ${id} from Supabase:`, e);
              }
            }
          }

          // Delete from state
          idsToDelete.forEach((id) => {
            dispatch({ type: "DELETE_OPPORTUNITY", payload: id });
            console.log(`Deleted from state: ${id}`);
          });

          // Reset selection
          setSelectedJobIds([]);
          setIsBatchSelectMode(false);

          // Adjust selected index
          if (willDeleteSelected) {
            if (opportunities.length > idsToDelete.length) {
              setSelectedOpportunityIndex(0);
            }
          } else if (deletedBeforeCount > 0) {
            setSelectedOpportunityIndex(
              Math.max(0, selectedOpportunityIndex - deletedBeforeCount)
            );
          }
        } catch (error) {
          console.error("Error batch deleting:", error);
          alert("Failed to delete some opportunities. Please try again.");
        } finally {
          setIsProcessing(false);
          deleteConfirmShowing.current = false;
        }
      }
    );
  }, [
    selectedJobIds,
    isProcessing,
    opportunities,
    selectedOpportunityIndex,
    applicationService,
    dispatch,
    setSelectedOpportunityIndex,
    showConfirmation,
  ]);

  // Handle status updates specifically
  const handleStatusUpdate = useCallback(
    async (id: string | number, newStatus: string) => {
      // This ensures status updates are treated specially and always saved
      console.log(`Status update for ${id}: ${newStatus}`);
      try {
        // First update in state
        handleUpdateOpportunity(id, { status: newStatus });
        // Try to update the status directly in Supabase as well for redundancy
        if (typeof id === "string" && id.includes("-")) {
          await applicationService.updateApplicationStatus(
            id,
            newStatus as any
          );
          console.log(
            `Updated status in Supabase directly: ${id} => ${newStatus}`
          );
        }
      } catch (error) {
        console.error("Error updating status:", error);
      }
    },
    [handleUpdateOpportunity, applicationService]
  );

  // Toggle job selection function
  const toggleJobSelection = useCallback((id: string | number) => {
    if (id === -1) {
      setSelectedJobIds([]);
      return;
    }
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
  }, []);

  // Select multiple jobs function
  const selectMultipleJobs = useCallback((ids: (string | number)[]) => {
    setSelectedJobIds((prev) => {
      const newSelected = [...prev];
      ids.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      return newSelected;
    });
  }, []);

  // Function to navigate to the master resume page
  const goToMasterResumePage = useCallback(() => {
    // Close the current dialog
    setShowAddDialog(false);
    // Navigate to the master resume page (adjust this based on your actual navigation)
    window.location.href = "/profile?tab=resume";
    // Or if you're using a router like Next.js:
    // router.push('/profile?tab=resume');
  }, []);

  // New function to tailor the resume using AI - with better error handling and fallbacks
  const tailorResumeWithAI = async (
    jobDescription: string,
    position: string,
    company: string,
    masterResume: string
  ) => {
    try {
      // Check if we have the required parameters
      if (!jobDescription || !jobDescription.trim()) {
        throw new Error("Job description is required for resume tailoring");
      }
      if (!masterResume || !masterResume.trim()) {
        throw new Error("Master resume is required for tailoring");
      }
      setIsTailoringResume(true);
      setTailoringProgress(10);
      setTailoringError("");
      console.log("Starting resume tailoring...");
      setTailoringProgress(30);
      // Call OpenAI API for resume tailoring
      const response = await fetch("/api/openai-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          resume: masterResume,
          jobDescription: jobDescription,
          position: position || "Not specified",
          company: company || "Not specified",
        }),
      });
      setTailoringProgress(70);
      // Get the response data
      const data = await response.json();
      // Check if the API returned an error
      if (!response.ok) {
        console.error("API error response:", data);
        throw new Error(data.error || `API error: ${response.status}`);
      }
      setTailoringProgress(90);
      // Check for content in the response
      if (!data || !data.content) {
        // Check if there's a fallback content for graceful degradation
        if (data.fallbackContent) {
          console.log("Using fallback content");
          setTailoringProgress(100);
          return masterResume; // Use master resume as fallback
        }
        console.error("Received empty content from API:", data);
        throw new Error("AI service returned empty content");
      }
      console.log("Resume tailoring successful!");
      setTailoringProgress(100);
      return data.content;
    } catch (error) {
      console.error("Error tailoring resume:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setTailoringError(errorMessage);
      // Always return the master resume as fallback so job creation can continue
      return masterResume;
    }
  };

  // Modified handleAddOpportunity to include resume tailoring
  const handleAddOpportunity = useCallback(async () => {
    if (isProcessing) return;
    // Check for master resume if tailoring is requested
    if (
      newOpportunity.tailorResume &&
      (!masterResume || masterResume.trim() === "")
    ) {
      setTailoringError("Cannot tailor resume: No master resume found");
      return;
    }
    try {
      setIsProcessing(true);
      // Generate a unique ID and format the date
      const uniqueId = Date.now();
      const formattedDate = new Date(
        newOpportunity.appliedDate
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      // Initialize with empty resume or master resume
      let resumeContent = hasMasterResume ? masterResume : "";
      // If tailoring is requested, generate the tailored resume
      if (
        newOpportunity.tailorResume &&
        newOpportunity.jobDescription &&
        hasMasterResume
      ) {
        try {
          const tailoredResume = await tailorResumeWithAI(
            newOpportunity.jobDescription,
            newOpportunity.position,
            newOpportunity.company,
            masterResume
          );
          if (tailoredResume) {
            console.log("Successfully received tailored resume");
            resumeContent = tailoredResume;
          } else {
            // If tailoring failed, use the master resume
            console.warn(
              "Resume tailoring failed, using master resume instead"
            );
          }
        } catch (tailoringError) {
          console.error("Error during resume tailoring:", tailoringError);
          // Continue with master resume
        }
      }
      // Create the new opportunity object
      const newOpp = {
        ...newOpportunity,
        id: uniqueId, // Will be replaced with Supabase ID later
        appliedDate: formattedDate,
        resume: resumeContent, // Use the tailored resume if available
        location: newOpportunity.location || "",
        salary: newOpportunity.salary || "",
        applicationUrl: newOpportunity.applicationUrl || "",
        source: "",
        recruiterName: "",
        recruiterEmail: "",
        recruiterPhone: "",
      };
      // Save to Supabase first to get a proper ID
      const jobApp = convertToJobApplication(newOpp);
      console.log("Saving new opportunity to Supabase:", jobApp);
      // Here's the key fix - save only once
      const result = await applicationService.saveApplication(jobApp);
      console.log("Save result:", result);
      // Use the Supabase ID if available
      const finalId =
        result && typeof result === "object" && "id" in result
          ? result.id
          : uniqueId;
      // Update our object with the final ID
      const finalOpp = {
        ...newOpp,
        id: finalId,
      };
      // Add to state with the correct ID - just once
      dispatch({ type: "ADD_OPPORTUNITY", payload: finalOpp });
      console.log(`Added new opportunity with ID ${finalId} to state`);
      // Set the timestamp
      updateModifiedTimestamp(finalId);
      // If we tailored the resume, also save it as a resume version
      if (newOpportunity.tailorResume && resumeContent !== masterResume) {
        try {
          // Save the tailored resume as a version
          await applicationService.saveResumeVersion({
            user_id: user.id,
            content: resumeContent,
            name: `Tailored for ${newOpportunity.position} at ${newOpportunity.company}`,
            timestamp: new Date().toISOString(),
            is_current: false, // Don't make it the current version
            application_id: String(finalId), // Always convert to string
          });
          console.log("Saved tailored resume version");
          // Add a success message to the chat
          const timestamp = new Date().toISOString();
          dispatch({
            type: "ADD_CHAT_MESSAGE",
            payload: {
              opportunityId: finalId,
              message:
                "I've created a tailored resume for this job application based on the job description. You can review and edit it in the Resume tab.",
              sender: "ai",
              timestamp,
            },
          });
        } catch (error) {
          console.error("Error saving resume version:", error);
        }
      }
      // Reset form and close dialog
      resetForm();
      setShowAddDialog(false);
      // Select the new opportunity
      setTimeout(() => {
        const newIndex = opportunities.length; // It will be at the end
        setSelectedOpportunityIndex(newIndex);
      }, 100);
    } catch (error) {
      console.error("Error adding opportunity:", error);
      alert("Failed to add opportunity. Please try again.");
      setTailoringError(
        error instanceof Error ? error.message : "Failed to add opportunity"
      );
    } finally {
      setIsProcessing(false);
      setIsTailoringResume(false);
      setTailoringProgress(0);
    }
  }, [
    isProcessing,
    newOpportunity,
    masterResume,
    hasMasterResume,
    convertToJobApplication,
    applicationService,
    dispatch,
    updateModifiedTimestamp,
    opportunities.length,
    setSelectedOpportunityIndex,
    user.id,
  ]);

  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || !opportunities[selectedOpportunityIndex])
      return;
    const opportunityId = opportunities[selectedOpportunityIndex].id;
    const timestamp = new Date().toISOString();
    // Add user message to chat
    dispatch({
      type: "ADD_CHAT_MESSAGE",
      payload: {
        opportunityId,
        message: currentMessage,
        sender: "user",
        timestamp,
      },
    });
    // Clear input
    setCurrentMessage("");
    try {
      // Prepare context for AI
      const selectedOpp = opportunities[selectedOpportunityIndex];
      const context = {
        company: selectedOpp.company,
        position: selectedOpp.position,
        status: selectedOpp.status,
        jobDescription: selectedOpp.jobDescription,
        notes: selectedOpp.notes || "",
      };
      // Get existing messages to provide conversation history
      const existingMessages = chatMessages[opportunityId] || [];
      // Prepare messages array for OpenAI
      const messagesToSend = [
        {
          role: "system",
          content: `You are an AI career assistant helping with job applications. You have access to the following information about this job opportunity:
Company: ${context.company}
Position: ${context.position}
Status: ${context.status}
Job Description: ${context.jobDescription || "Not provided"}
Be helpful, concise, and provide actionable advice. If the user asks about the job description, resume optimization,
or interview tips, use the context above to give personalized guidance.`,
        },
        // Add conversation history (last 10 messages)
        ...existingMessages.slice(-10).map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.message,
        })),
        // Add the new message
        { role: "user", content: currentMessage },
      ];
      // Call the OpenAI API
      const response = await fetch("/api/openai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesToSend,
          opportunityContext: context,
        }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      // Add AI response to chat
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        payload: {
          opportunityId,
          message: data.content || "I'm sorry, I couldn't generate a response.",
          sender: "ai",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error in AI chat:", error);
      // Add error message
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        payload: {
          opportunityId,
          message:
            "I'm sorry, there was an error processing your request. Please try again.",
          sender: "ai",
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [
    currentMessage,
    opportunities,
    selectedOpportunityIndex,
    dispatch,
    chatMessages,
  ]);

  // Help guide opener
  const openGuide = useCallback((guideId: string, sectionId?: string) => {
    console.log(
      `Opening guide: ${guideId}, section: ${sectionId || "default"}`
    );
  }, []);

  // Improved display of the error message in the UI
  const displayTailoringError = tailoringError
    ? `${tailoringError}. Using master resume instead.`
    : "";

  // Get messages for selected opportunity
  const selectedOpportunityId = opportunities[selectedOpportunityIndex]?.id;
  const opportunityMessages = selectedOpportunityId
    ? chatMessages[selectedOpportunityId] || []
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          setShowConfirmDialog(open);
          if (!open) deleteConfirmShowing.current = false;
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{confirmDialogProps.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>{confirmDialogProps.message}</AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                deleteConfirmShowing.current = false;
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirmDialogProps.onConfirm();
                setShowConfirmDialog(false);
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="md:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Job Opportunities</h2>
          <Dialog
            open={showAddDialog}
            onOpenChange={(open) => {
              if (!open) resetForm();
              setShowAddDialog(open);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                {" "}
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {extractionStep === "url"
                    ? "Add Job from URL"
                    : "Review Job Details"}
                </DialogTitle>
                <DialogDescription>
                  {extractionStep === "url"
                    ? "Paste a job URL to automatically extract the details"
                    : "Review and edit the extracted job details before adding"}
                </DialogDescription>
              </DialogHeader>
              {extractionStep === "url" ? (
                // Step 1: Job URL Input
                <JobUrlInput
                  onDataExtracted={handleJobDataExtracted}
                  onExtractionComplete={handleExtractionComplete}
                />
              ) : (
                // Step 2: Review Extracted Data
                <>
                  {showMasterResumeWarning && !hasMasterResume && (
                    <Alert className="mb-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <AlertTitle className="text-amber-700 dark:text-amber-300">
                        Master Resume Required
                      </AlertTitle>
                      <AlertDescription className="text-amber-600 dark:text-amber-400">
                        <p className="mb-2">
                          You need to create a master resume before AI can
                          tailor it for specific jobs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Button
                            variant="outline"
                            className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                            onClick={() => setShowMasterResumeWarning(false)}
                          >
                            Continue Without Resume
                          </Button>
                          <Button
                            variant="default"
                            className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-700 dark:hover:bg-amber-600"
                            onClick={goToMasterResumePage}
                          >
                            Create Master Resume
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newOpportunity.company}
                        onChange={(e) =>
                          setNewOpportunity({
                            ...newOpportunity,
                            company: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={newOpportunity.position}
                        onChange={(e) =>
                          setNewOpportunity({
                            ...newOpportunity,
                            position: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newOpportunity.location}
                        onChange={(e) =>
                          setNewOpportunity({
                            ...newOpportunity,
                            location: e.target.value,
                          })
                        }
                        placeholder="Remote, Hybrid, or Office location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input
                        id="salary"
                        value={newOpportunity.salary}
                        onChange={(e) =>
                          setNewOpportunity({
                            ...newOpportunity,
                            salary: e.target.value,
                          })
                        }
                        placeholder="e.g. $80,000-$100,000/year"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="applicationUrl">Job URL</Label>
                      <Input
                        id="applicationUrl"
                        value={newOpportunity.applicationUrl}
                        onChange={(e) =>
                          setNewOpportunity({
                            ...newOpportunity,
                            applicationUrl: e.target.value,
                          })
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newOpportunity.status}
                        onValueChange={(value) =>
                          setNewOpportunity({
                            ...newOpportunity,
                            status: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Interested">Interested</SelectItem>
                          <SelectItem value="Preparing Application">
                            Preparing Application
                          </SelectItem>
                          <SelectItem value="Applied">Applied</SelectItem>
                          <SelectItem value="Application Acknowledged">
                            Application Acknowledged
                          </SelectItem>
                          <SelectItem value="First Interview">
                            First Interview
                          </SelectItem>
                          <SelectItem value="Second Interview">
                            Second Interview
                          </SelectItem>
                          <SelectItem value="Final Interview">
                            Final Interview
                          </SelectItem>
                          <SelectItem value="Offer Received">
                            Offer Received
                          </SelectItem>
                          <SelectItem value="Offer Accepted">
                            Offer Accepted
                          </SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appliedDate">Date</Label>
                      <Input
                        id="appliedDate"
                        type="date"
                        value={newOpportunity.appliedDate}
                        onChange={(e) =>
                          setNewOpportunity({
                            ...newOpportunity,
                            appliedDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobDescription">Job Description</Label>
                      <Textarea
                        id="jobDescription"
                        rows={6}
                        value={newOpportunity.jobDescription}
                        onChange={(e) =>
                          setNewOpportunity({
                            ...newOpportunity,
                            jobDescription: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        rows={2}
                        value={newOpportunity.notes}
                        onChange={(e) =>
                          setNewOpportunity({
                            ...newOpportunity,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Add any personal notes about this opportunity"
                      />
                    </div>
                    {/* Resume tailoring section */}
                    <div className="space-y-2 pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="tailorResume" className="font-medium">
                            Tailor Resume with AI
                          </Label>
                          <p
                            className={`text-xs mt-1 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {hasMasterResume
                              ? "Create a customized version of your resume for this job"
                              : "Requires a master resume to be created first"}
                          </p>
                        </div>
                        <Switch
                          id="tailorResume"
                          checked={newOpportunity.tailorResume}
                          onCheckedChange={(checked) =>
                            setNewOpportunity({
                              ...newOpportunity,
                              tailorResume: checked,
                            })
                          }
                          disabled={!hasMasterResume}
                        />
                      </div>
                      <AnimatePresence>
                        {newOpportunity.tailorResume && hasMasterResume && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`rounded-md p-3 text-sm ${
                              isDarkMode
                                ? "bg-blue-900/20 text-blue-300"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            <div className="flex items-start">
                              <Sparkles className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                              <div>
                                <p>
                                  AI will analyze the job description and create
                                  a tailored version of your resume that
                                  highlights relevant skills and experience.
                                </p>
                                <p className="mt-1 text-xs">
                                  The original master resume is preserved, and
                                  you can edit the tailored version later.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* Info for users without a master resume */}
                      <AnimatePresence>
                        {!hasMasterResume && !showMasterResumeWarning && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`rounded-md p-3 text-sm mt-2 ${
                              isDarkMode
                                ? "bg-blue-900/10 text-blue-300"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            <div className="flex items-start">
                              <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                              <div>
                                <p>
                                  You'll need to create a master resume before
                                  AI can tailor it for specific jobs.
                                </p>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-blue-500 dark:text-blue-400"
                                  onClick={goToMasterResumePage}
                                >
                                  Go to Profile to Create Master Resume
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              )}
              <DialogFooter>
                {extractionStep === "url" ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                ) : (
                  <>
                    {/* Tailoring progress indicator */}
                    <AnimatePresence>
                      {isTailoringResume && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="w-full"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            <span className="text-sm">
                              {tailoringProgress < 100
                                ? `Tailoring resume: ${tailoringProgress}%`
                                : "Resume tailored successfully!"}
                            </span>
                          </div>
                          <Progress value={tailoringProgress} className="h-2" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* Error message if resume tailoring fails */}
                    <AnimatePresence>
                      {tailoringError && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="mt-2 text-red-500 text-sm"
                        >
                          Error: {displayTailoringError}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex justify-end space-x-2 w-full">
                      <Button
                        variant="outline"
                        onClick={() => setExtractionStep("url")}
                        disabled={isProcessing}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleAddOpportunity}
                        disabled={
                          isProcessing ||
                          !newOpportunity.company ||
                          !newOpportunity.position ||
                          (newOpportunity.tailorResume && !hasMasterResume)
                        }
                      >
                        {isProcessing ? (
                          <>
                            {isTailoringResume ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {tailoringProgress < 100
                                  ? `Creating...`
                                  : "Adding Job..."}
                              </>
                            ) : (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding Job...
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {newOpportunity.tailorResume && hasMasterResume ? (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Add with Tailored Resume
                              </>
                            ) : (
                              "Add Job"
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
          selectMultipleJobs={selectMultipleJobs}
          handleBatchDelete={handleBatchDelete}
          isDarkMode={isDarkMode}
          dispatch={dispatch}
        />
      </div>
      <div className="md:col-span-2">
        <OpportunityDetails
          opportunity={opportunities[selectedOpportunityIndex]}
          updateOpportunity={handleUpdateOpportunity}
          deleteOpportunity={handleDeleteFromDetails}
          isDarkMode={isDarkMode}
          chatMessages={opportunityMessages}
          handleSendMessage={handleSendMessage}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          openGuide={openGuide}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}
