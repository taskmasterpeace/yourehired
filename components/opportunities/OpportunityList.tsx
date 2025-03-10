import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "../../components/ui/select";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Search, Filter, CalendarIcon } from 'lucide-react';
import { Opportunity } from '../../context/types';
import { StatusBadge } from './StatusBadge';

interface OpportunityListProps {
  opportunities: Opportunity[];
  selectedOpportunityIndex: number;
  setSelectedOpportunityIndex: (index: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortDirection: string;
  setSortDirection: (direction: string) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  lastModifiedTimestamps: Record<number, string>;
  isBatchSelectMode: boolean;
  setIsBatchSelectMode: (mode: boolean) => void;
  selectedJobIds: number[];
  toggleJobSelection: (id: number) => void;
  handleBatchDelete: () => void;
  isDarkMode: boolean;
}

export const OpportunityList = ({
  opportunities,
  selectedOpportunityIndex,
  setSelectedOpportunityIndex,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  viewMode,
  setViewMode,
  lastModifiedTimestamps,
  isBatchSelectMode,
  setIsBatchSelectMode,
  selectedJobIds,
  toggleJobSelection,
  handleBatchDelete,
  isDarkMode
}: OpportunityListProps) => {
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

  return (
    <Card className={`col-span-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50'} flex flex-col`}>
      <CardHeader>
        <CardTitle className={isDarkMode ? 'text-blue-400' : 'text-blue-700'}>Job List</CardTitle>
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
          
          <div className="flex flex-wrap gap-1 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={statusFilter === "All" ? "bg-blue-100" : ""}
              onClick={() => setStatusFilter("All")}
            >
              All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={statusFilter === "Applied" ? "bg-blue-100" : ""}
              onClick={() => setStatusFilter("Applied")}
            >
              Applied
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={statusFilter.includes("Interview") ? "bg-purple-100" : ""}
              onClick={() => setStatusFilter("First Interview")}
            >
              Interviews
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={statusFilter === "Offer Received" ? "bg-green-100" : ""}
              onClick={() => setStatusFilter("Offer Received")}
            >
              Offers
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                className="px-2"
                onClick={() => setViewMode("card")}
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
          <div className="flex items-center flex-wrap gap-2">
            <Button 
              variant={isBatchSelectMode ? "default" : "outline"} 
              size="sm"
              onClick={() => {
                setIsBatchSelectMode(!isBatchSelectMode);
                if (isBatchSelectMode) {
                  // Clear selection when exiting batch mode
                  toggleJobSelection(-1);
                }
              }}
            >
              {isBatchSelectMode ? "Cancel Selection" : "Select Jobs"}
            </Button>
            
            {isBatchSelectMode && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Select all visible jobs
                    sortedOpportunities.forEach(opp => {
                      if (!selectedJobIds.includes(opp.id)) {
                        toggleJobSelection(opp.id);
                      }
                    });
                  }}
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
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <Card 
                      className={`mb-2 cursor-pointer ${
                        originalIndex === selectedOpportunityIndex 
                          ? isDarkMode ? 'bg-blue-900' : 'bg-blue-200' 
                          : isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`} 
                      onClick={() => {
                        if (isBatchSelectMode) {
                          toggleJobSelection(opp.id);
                        } else {
                          // Find the index in the original opportunities array
                          const index = opportunities.findIndex(o => o.id === opp.id);
                          if (index !== -1) {
                            setSelectedOpportunityIndex(index);
                          } else {
                            setSelectedOpportunityIndex(originalIndex);
                          }
                        }
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{opp.company}</h3>
                            <p className="text-sm text-gray-600">{opp.position}</p>
                          </div>
                          <StatusBadge status={opp.status} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{opp.appliedDate}</p>
                        <p className="text-xs text-gray-400">
                          Updated: {lastModifiedTimestamps[opp.id] 
                            ? new Date(lastModifiedTimestamps[opp.id]).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) 
                            : 'Never'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                );
              } else {
                // List view
                return (
                  <div 
                    key={opp.id}
                    className={`flex items-center p-2 mb-1 rounded cursor-pointer ${
                      originalIndex === selectedOpportunityIndex 
                        ? isDarkMode ? 'bg-blue-900' : 'bg-blue-200' 
                        : isDarkMode ? 'bg-gray-700' : 'bg-white'
                    }`}
                    onClick={() => {
                      if (isBatchSelectMode) {
                        toggleJobSelection(opp.id);
                      } else {
                        // Find the index in the original opportunities array
                        const index = opportunities.findIndex(o => o.id === opp.id);
                        if (index !== -1) {
                          setSelectedOpportunityIndex(index);
                        } else {
                          setSelectedOpportunityIndex(originalIndex);
                        }
                      }
                    }}
                  >
                    {isBatchSelectMode && (
                      <input 
                        type="checkbox" 
                        checked={selectedJobIds.includes(opp.id)}
                        onChange={() => toggleJobSelection(opp.id)}
                        className="h-5 w-5 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold truncate">{opp.company}</h3>
                        <StatusBadge status={opp.status} />
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
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>No opportunities found</p>
              <p className="text-sm mt-2">Try adjusting your filters or add a new opportunity</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
