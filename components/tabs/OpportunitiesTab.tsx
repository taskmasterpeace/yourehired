import React, { useState, useCallback, useRef } from "react";
import { OpportunityList } from "../opportunities/OpportunityList";
import { OpportunityDetails } from "../opportunities/OpportunityDetails";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { PlusCircle } from "lucide-react";
import { Opportunity, ChatMessage } from "../../context/types";
import { ApplicationService } from "@/lib/application-service";

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
  // Add chatMessages prop
  chatMessages?: Record<string | number, ChatMessage[]>;
}
// Import the same dependencies as before

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
  // Keep most state variables the same
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("lastModified");
  const [sortDirection, setSortDirection] = useState("desc");
  const [viewMode, setViewMode] = useState("card");
  const [isBatchSelectMode, setIsBatchSelectMode] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<(string | number)[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Single flag for all processing

  const [newOpportunity, setNewOpportunity] = useState({
    company: "",
    position: "",
    jobDescription: "",
    status: "Interested",
    appliedDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [currentMessage, setCurrentMessage] = useState("");
  const [isMasterResumeFrozen, setIsMasterResumeFrozen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Create ApplicationService instance only once
  const applicationService = useRef(new ApplicationService()).current;

  // Helper function to convert from Opportunity to JobApplication
  const convertToJobApplication = useCallback((opp: Opportunity) => {
    const tags = opp.tags ? opp.tags.map((tag: any) => tag.name) : [];

    return {
      id:
        typeof opp.id === "string" && opp.id.includes("-") ? opp.id : undefined,
      companyName: opp.company,
      positionTitle: opp.position,
      status: opp.status,
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
      statusHistory: [],
      events: [],
    };
  }, []);

  // Handle update by updating state AND saving to Supabase
  const handleUpdateOpportunity = useCallback(
    async (id: string | number, updates: Partial<Opportunity>) => {
      try {
        // Update in state
        updateOpportunity(id, updates);

        // Update timestamp
        const newTimestamps = { ...lastModifiedTimestamps };
        newTimestamps[id] = new Date().toISOString();
        setLastModifiedTimestamps(newTimestamps);

        // Find the updated opportunity
        const opportunityIndex = opportunities.findIndex(
          (opp) => opp.id === id
        );
        if (opportunityIndex === -1) return;

        // Create merged opportunity object
        const updatedOpportunity = {
          ...opportunities[opportunityIndex],
          ...updates,
        };

        // Convert and save to Supabase
        const jobApp = convertToJobApplication(updatedOpportunity);
        await applicationService.saveApplication(jobApp);
      } catch (error) {
        console.error("Error saving to Supabase:", error);
      }
    },
    [
      opportunities,
      updateOpportunity,
      lastModifiedTimestamps,
      setLastModifiedTimestamps,
      convertToJobApplication,
      applicationService,
    ]
  );

  // Handle deleting an opportunity
  const deleteOpportunity = useCallback(
    async (id: string | number) => {
      // Prevent processing if already processing something else
      if (isProcessing) return;

      try {
        setIsProcessing(true);

        // Only do this inside component code, not from an OpportunityDetails prop callback
        const confirmed = window.confirm(
          "Are you sure you want to delete this opportunity?"
        );
        if (!confirmed) {
          setIsProcessing(false);
          return;
        }

        // If it's a Supabase ID, delete from Supabase
        if (typeof id === "string" && id.includes("-")) {
          await applicationService.deleteApplication(id);
        }

        // Delete from state
        dispatch({ type: "DELETE_OPPORTUNITY", payload: id });

        // Handle selection adjustment
        const deletedIndex = opportunities.findIndex((opp) => opp.id === id);
        const totalOpportunities = opportunities.length;

        if (deletedIndex === selectedOpportunityIndex) {
          // If we deleted the selected opportunity
          if (totalOpportunities > 1) {
            // Select the first opportunity if available
            setSelectedOpportunityIndex(0);
          }
        } else if (deletedIndex < selectedOpportunityIndex) {
          // If we deleted an opportunity before the selected one, adjust index
          setSelectedOpportunityIndex(selectedOpportunityIndex - 1);
        }
      } catch (error) {
        console.error("Error deleting opportunity:", error);
        alert("Failed to delete opportunity. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      dispatch,
      opportunities,
      selectedOpportunityIndex,
      setSelectedOpportunityIndex,
      applicationService,
    ]
  );

  // Helper function for batch deletion
  const handleBatchDelete = useCallback(async () => {
    if (selectedJobIds.length === 0 || isProcessing) return;

    try {
      setIsProcessing(true);

      const confirmed = window.confirm(
        `Are you sure you want to delete ${selectedJobIds.length} selected job(s)?`
      );
      if (!confirmed) {
        setIsProcessing(false);
        return;
      }

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
          } catch (e) {
            console.error(`Failed to delete ${id} from Supabase:`, e);
          }
        }
      }

      // Delete from state
      idsToDelete.forEach((id) => {
        dispatch({ type: "DELETE_OPPORTUNITY", payload: id });
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
    }
  }, [
    selectedJobIds,
    isProcessing,
    opportunities,
    selectedOpportunityIndex,
    dispatch,
    setSelectedOpportunityIndex,
    applicationService,
  ]);

  // Toggle job selection function remains the same
  const toggleJobSelection = useCallback((id: string | number) => {
    if (id === -1) {
      setSelectedJobIds([]);
      return;
    }

    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
  }, []);

  // Select multiple jobs function remains the same
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

  // Simplified add opportunity function to prevent duplicate adds
  const handleAddOpportunity = useCallback(async () => {
    if (isProcessing) return;

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

      // Create the new opportunity object
      const newOpp = {
        ...newOpportunity,
        id: uniqueId,
        appliedDate: formattedDate,
        resume: masterResume,
        location: "",
        salary: "",
        applicationUrl: "",
        source: "",
        recruiterName: "",
        recruiterEmail: "",
        recruiterPhone: "",
      };

      // Save directly to Supabase first
      const jobApp = convertToJobApplication(newOpp);
      const result = await applicationService.saveApplication(jobApp);

      // If we got a Supabase ID, use it
      const finalId =
        result && typeof result === "object" && "id" in result
          ? result.id
          : uniqueId;

      // Update the ID in our new opportunity
      const finalOpp = {
        ...newOpp,
        id: finalId,
      };

      // Add to state with the Supabase ID
      dispatch({ type: "ADD_OPPORTUNITY", payload: finalOpp });

      // Update timestamp
      const newTimestamps = { ...lastModifiedTimestamps };
      newTimestamps[finalId] = new Date().toISOString();
      setLastModifiedTimestamps(newTimestamps);

      // Reset form and close dialog
      setNewOpportunity({
        company: "",
        position: "",
        jobDescription: "",
        status: "Interested",
        appliedDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setShowAddDialog(false);

      // Select the new opportunity
      setTimeout(() => {
        const newIndex = opportunities.length; // It will be at the end
        setSelectedOpportunityIndex(newIndex);
      }, 100);
    } catch (error) {
      console.error("Error adding opportunity:", error);
      alert("Failed to add opportunity. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    newOpportunity,
    masterResume,
    dispatch,
    lastModifiedTimestamps,
    setLastModifiedTimestamps,
    convertToJobApplication,
    applicationService,
    opportunities.length,
    setSelectedOpportunityIndex,
  ]);

  // Handler for OpportunityDetails deletes - doesn't show confirmation dialog itself
  const handleOpportunityDetailsDelete = useCallback(
    (id: string | number) => {
      deleteOpportunity(id);
    },
    [deleteOpportunity]
  );

  // Other utility functions remain the same
  const handleSendMessage = useCallback(() => {
    if (!currentMessage.trim() || !opportunities[selectedOpportunityIndex])
      return;

    dispatch({
      type: "ADD_CHAT_MESSAGE",
      payload: {
        opportunityId: opportunities[selectedOpportunityIndex].id,
        message: currentMessage,
        sender: "user",
      },
    });

    setCurrentMessage("");

    setTimeout(() => {
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        payload: {
          opportunityId: opportunities[selectedOpportunityIndex].id,
          message: "This is a placeholder response.",
          sender: "ai",
        },
      });
    }, 1000);
  }, [currentMessage, opportunities, selectedOpportunityIndex, dispatch]);

  // Get messages for selected opportunity
  const selectedOpportunityId = opportunities[selectedOpportunityIndex]?.id;
  const opportunityMessages = selectedOpportunityId
    ? chatMessages[selectedOpportunityId] || []
    : [];

  const openGuide = useCallback((guideId: string, sectionId?: string) => {
    console.log(
      `Opening guide: ${guideId}, section: ${sectionId || "default"}`
    );
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <div className="md:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Job Opportunities</h2>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Job Opportunity</DialogTitle>
              </DialogHeader>
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
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newOpportunity.status}
                    onValueChange={(value) =>
                      setNewOpportunity({ ...newOpportunity, status: value })
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
                    rows={4}
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
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddOpportunity} disabled={isProcessing}>
                  {isProcessing ? "Adding..." : "Add Job"}
                </Button>
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
          deleteOpportunity={handleOpportunityDetailsDelete}
          isDarkMode={isDarkMode}
          chatMessages={opportunityMessages}
          handleSendMessage={handleSendMessage}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          suggestions={suggestions}
          isMasterResumeFrozen={isMasterResumeFrozen}
          setIsMasterResumeFrozen={setIsMasterResumeFrozen}
          updateMasterResume={(resume: string) =>
            dispatch({ type: "UPDATE_MASTER_RESUME", payload: resume })
          }
          openGuide={openGuide}
        />
      </div>
    </div>
  );
}
