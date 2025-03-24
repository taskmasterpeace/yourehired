import React, { useState } from 'react';
import { OpportunityList } from "../opportunities/OpportunityList";
import { OpportunityDetails } from "../opportunities/OpportunityDetails";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { PlusCircle } from 'lucide-react';

interface OpportunitiesTabProps {
  opportunities: any[];
  selectedOpportunityIndex: number;
  setSelectedOpportunityIndex: (index: number) => void;
  updateOpportunity: (id: number, updates: any) => void;
  isDarkMode: boolean;
  user: any;
  masterResume: string;
  dispatch: any;
  lastModifiedTimestamps?: Record<number, string>;
  setLastModifiedTimestamps?: (timestamps: Record<number, string>) => void;
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
  setLastModifiedTimestamps = () => {}
}: OpportunitiesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("lastModified");
  const [sortDirection, setSortDirection] = useState("desc");
  const [viewMode, setViewMode] = useState("card");
  const [isBatchSelectMode, setIsBatchSelectMode] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    company: "",
    position: "",
    jobDescription: "",
    status: "Interested",
    appliedDate: new Date().toISOString().split('T')[0],
  });
  const [currentMessage, setCurrentMessage] = useState("");
  const [isMasterResumeFrozen, setIsMasterResumeFrozen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Helper function for deleting an opportunity
  const deleteOpportunity = (id: number) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      dispatch({ type: 'DELETE_OPPORTUNITY', payload: id });
      
      // If we deleted the currently selected opportunity, select the first one
      if (opportunities[selectedOpportunityIndex]?.id === id) {
        setSelectedOpportunityIndex(0);
      }
    }
  };

  // Helper function for batch deletion
  const handleBatchDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedJobIds.length} selected job(s)?`)) {
      // Create a copy of the IDs to prevent issues during deletion
      const idsToDelete = [...selectedJobIds];
      
      // First check if the currently selected opportunity will be deleted
      const selectedId = opportunities[selectedOpportunityIndex]?.id;
      const willDeleteSelected = idsToDelete.includes(selectedId);
      
      // Delete all selected opportunities at once
      idsToDelete.forEach(id => {
        dispatch({ type: 'DELETE_OPPORTUNITY', payload: id });
      });
      
      // Reset the selection state
      setSelectedJobIds([]);
      setIsBatchSelectMode(false);
      
      // If we deleted the currently selected opportunity, select the first one
      if (willDeleteSelected) {
        setSelectedOpportunityIndex(0);
      }
    }
  };

  // Toggle function for selecting/deselecting a job
  const toggleJobSelection = (id: number) => {
    if (id === -1) {
      setSelectedJobIds([]);
      return;
    }
    
    if (selectedJobIds.includes(id)) {
      setSelectedJobIds(selectedJobIds.filter(jobId => jobId !== id));
    } else {
      setSelectedJobIds([...selectedJobIds, id]);
    }
  };

  // Function to select multiple jobs at once
  const selectMultipleJobs = (ids: number[]) => {
    setSelectedJobIds((prevSelected) => {
      const newSelected = [...prevSelected];
      
      // Add all the IDs that aren't already selected
      ids.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      
      return newSelected;
    });
  };

  // Handle adding a new opportunity
  const handleAddOpportunity = () => {
    const uniqueId = Date.now();
    const formattedDate = new Date(newOpportunity.appliedDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const newOpp = {
      ...newOpportunity,
      id: uniqueId,
      appliedDate: formattedDate,
      resume: masterResume,
    };
    
    dispatch({ type: 'ADD_OPPORTUNITY', payload: newOpp });
    
    // Update last modified timestamp
    const newTimestamps = {...lastModifiedTimestamps};
    newTimestamps[uniqueId] = new Date().toISOString();
    setLastModifiedTimestamps(newTimestamps);
    
    // Reset form and close dialog
    setNewOpportunity({
      company: "",
      position: "",
      jobDescription: "",
      status: "Interested",
      appliedDate: new Date().toISOString().split('T')[0],
    });
    setShowAddDialog(false);
    
    // Select the new opportunity
    setTimeout(() => {
      const newIndex = opportunities.length; // It will be at the end
      setSelectedOpportunityIndex(newIndex);
    }, 0);
  };

  // Mock function for chat
  const handleSendMessage = () => {
    if (!currentMessage.trim() || !opportunities[selectedOpportunityIndex]) return;
    
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: {
        opportunityId: opportunities[selectedOpportunityIndex].id,
        message: currentMessage,
        sender: 'user'
      }
    });
    
    setCurrentMessage("");
    
    // Mock AI response
    setTimeout(() => {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          opportunityId: opportunities[selectedOpportunityIndex].id,
          message: "This is a placeholder response. In a real implementation, this would be generated by an AI.",
          sender: 'ai'
        }
      });
    }, 1000);
  };

  // Get chat messages for the selected opportunity
  const opportunityMessages = opportunities[selectedOpportunityIndex]?.id 
    ? (opportunities[selectedOpportunityIndex]?.chatMessages || [])
    : [];

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
                    onChange={(e) => setNewOpportunity({...newOpportunity, company: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input 
                    id="position" 
                    value={newOpportunity.position}
                    onChange={(e) => setNewOpportunity({...newOpportunity, position: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newOpportunity.status} 
                    onValueChange={(value) => setNewOpportunity({...newOpportunity, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interested">Interested</SelectItem>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
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
                    onChange={(e) => setNewOpportunity({...newOpportunity, appliedDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea 
                    id="jobDescription" 
                    rows={5}
                    value={newOpportunity.jobDescription}
                    onChange={(e) => setNewOpportunity({...newOpportunity, jobDescription: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddOpportunity}>Add Job</Button>
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
          updateOpportunity={updateOpportunity}
          deleteOpportunity={deleteOpportunity}
          isDarkMode={isDarkMode}
          chatMessages={opportunityMessages}
          handleSendMessage={handleSendMessage}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          suggestions={suggestions}
          isMasterResumeFrozen={isMasterResumeFrozen}
          setIsMasterResumeFrozen={setIsMasterResumeFrozen}
          updateMasterResume={(resume: string) => dispatch({ type: 'UPDATE_MASTER_RESUME', payload: resume })}
        />
      </div>
    </div>
  );
}
