import React, { useState } from 'react';
import { CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "../../components/ui/select";
import { Opportunity } from '../../context/types';
import { StatusBadge } from './StatusBadge';
import { Edit } from 'lucide-react';

interface OpportunityHeaderProps {
  opportunity: Opportunity;
  updateOpportunity: (id: number, updates: Partial<Opportunity>) => void;
  isDarkMode: boolean;
}

export const OpportunityHeader = ({
  opportunity,
  updateOpportunity,
  isDarkMode
}: OpportunityHeaderProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editedTitle, setEditedTitle] = useState(opportunity.position);
  const [editedCompany, setEditedCompany] = useState(opportunity.company);
  const [editedDate, setEditedDate] = useState("");

  const handleSaveDateChange = () => {
    // Convert from YYYY-MM-DD to a more readable format
    const dateObj = new Date(editedDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    updateOpportunity(opportunity.id, { appliedDate: formattedDate });
    setIsEditingDate(false);
  };

  return (
    <CardHeader className="pb-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          {isEditingCompany ? (
            <div className="flex items-center space-x-2">
              <Input
                value={editedCompany}
                onChange={(e) => setEditedCompany(e.target.value)}
                className="w-full"
                autoFocus
              />
              <Button 
                size="sm" 
                onClick={() => {
                  updateOpportunity(opportunity.id, { company: editedCompany });
                  setIsEditingCompany(false);
                }}
              >
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setEditedCompany(opportunity.company);
                  setIsEditingCompany(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <CardTitle className="text-xl">{opportunity.company}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-6 w-6 p-0" 
                onClick={() => {
                  setEditedCompany(opportunity.company);
                  setIsEditingCompany(true);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {isEditingTitle ? (
            <div className="flex items-center space-x-2 mt-1">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full"
                autoFocus
              />
              <Button 
                size="sm" 
                onClick={() => {
                  updateOpportunity(opportunity.id, { position: editedTitle });
                  setIsEditingTitle(false);
                }}
              >
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setEditedTitle(opportunity.position);
                  setIsEditingTitle(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <CardDescription className="text-lg font-medium">{opportunity.position}</CardDescription>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-6 w-6 p-0" 
                onClick={() => {
                  setEditedTitle(opportunity.position);
                  setIsEditingTitle(true);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-start sm:items-end">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select 
              value={opportunity.status} 
              onValueChange={(value) => {
                updateOpportunity(opportunity.id, { status: value });
              }}
              className="w-full sm:w-[200px]"
            >
              <SelectTrigger className={
                opportunity.status === 'Offer Received' || opportunity.status === 'Offer Accepted' ? 'border-green-300 bg-green-50' :
                opportunity.status === 'Rejected' || opportunity.status === 'Withdrawn' ? 'border-red-300 bg-red-50' :
                opportunity.status === 'Applied' ? 'border-blue-300 bg-blue-50' :
                opportunity.status.includes('Interview') ? 'border-purple-300 bg-purple-50' :
                'border-gray-300 bg-gray-50'
              }>
                <SelectValue placeholder="Select status">
                  <StatusBadge status={opportunity.status} />
                </SelectValue>
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
            
            <div className="text-xs text-gray-500 hidden sm:block">
              Status
            </div>
          </div>
          
          <div className="flex items-center mt-2">
            {isEditingDate ? (
              <div className="flex items-center flex-wrap gap-2">
                <Input
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="w-40"
                />
                <Button size="sm" onClick={handleSaveDateChange} className="mr-1">Save</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditingDate(false)}>Cancel</Button>
              </div>
            ) : (
              <>
                <span className="text-sm text-gray-500 mr-2">{opportunity.appliedDate}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => {
                    // Convert from "Month Day, Year" to YYYY-MM-DD
                    const date = new Date(opportunity.appliedDate);
                    setEditedDate(date.toISOString().split('T')[0]);
                    setIsEditingDate(true);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </CardHeader>
  );
};
