import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Opportunity } from '@/context/types';
import { Edit } from 'lucide-react';

interface JobDetailsSectionProps {
  opportunity: Opportunity;
  updateOpportunity: (id: number, updates: Partial<Opportunity>) => void;
  isDarkMode: boolean;
}

export const JobDetailsSection = ({
  opportunity,
  updateOpportunity,
  isDarkMode
}: JobDetailsSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    location: opportunity.location || '',
    salary: opportunity.salary || '',
    applicationUrl: opportunity.applicationUrl || '',
    source: opportunity.source || ''
  });

  return (
    <div className={`p-4 mb-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Job Details</h3>
        {!isEditing ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setEditedDetails({
                location: opportunity.location || "",
                salary: opportunity.salary || "",
                applicationUrl: opportunity.applicationUrl || "",
                source: opportunity.source || ""
              });
              setIsEditing(true);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => {
                updateOpportunity(opportunity.id, editedDetails);
                setIsEditing(false);
              }}
            >
              Save
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={editedDetails.location}
              onChange={(e) => setEditedDetails({...editedDetails, location: e.target.value})}
              placeholder="e.g., Remote, New York, NY"
            />
          </div>
          <div>
            <Label htmlFor="salary">Salary Range</Label>
            <Input
              id="salary"
              value={editedDetails.salary}
              onChange={(e) => setEditedDetails({...editedDetails, salary: e.target.value})}
              placeholder="e.g., $80,000 - $100,000"
            />
          </div>
          <div>
            <Label htmlFor="applicationUrl">Application URL</Label>
            <Input
              id="applicationUrl"
              value={editedDetails.applicationUrl}
              onChange={(e) => setEditedDetails({...editedDetails, applicationUrl: e.target.value})}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={editedDetails.source}
              onChange={(e) => setEditedDetails({...editedDetails, source: e.target.value})}
              placeholder="e.g., LinkedIn, Indeed, Referral"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {opportunity.location && opportunity.location.trim() !== "" && (
            <div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400'  : 'text-gray-500'}`}>Location</span>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {opportunity.location}
              </p>
            </div>
          )}
          
          {opportunity.salary && opportunity.salary.trim() !== "" && (
            <div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400'  : 'text-gray-500'}`}>Salary Range</span>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {opportunity.salary}
              </p>
            </div>
          )}
          
          {opportunity.applicationUrl && opportunity.applicationUrl.trim() !== "" && (
            <div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400'  : 'text-gray-500'}`}>Application URL</span>
              <p>
                <a 
                  href={opportunity.applicationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {opportunity.applicationUrl}
                </a>
              </p>
            </div>
          )}
          
          {opportunity.source && opportunity.source.trim() !== "" && (
            <div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400'  : 'text-gray-500'}`}>Source</span>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {opportunity.source}
              </p>
            </div>
          )}
          
          {(!opportunity.location || opportunity.location.trim() === "") &&
           (!opportunity.salary || opportunity.salary.trim() === "") &&
           (!opportunity.applicationUrl || opportunity.applicationUrl.trim() === "") &&
           (!opportunity.source || opportunity.source.trim() === "") && (
            <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No job details added yet
            </p>
          )}
        </div>
      )}
    </div>
  );
};
