import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Maximize2, Minimize2 } from 'lucide-react';
import { Opportunity } from '../../context/types';

interface JobDescriptionSectionProps {
  opportunity: Opportunity;
  updateOpportunity: (id: number, updates: Partial<Opportunity>) => void;
  isDarkMode: boolean;
}

export const JobDescriptionSection = ({
  opportunity,
  updateOpportunity,
  isDarkMode
}: JobDescriptionSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJobDescription, setEditedJobDescription] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Job Description</h3>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => {
                navigator.clipboard.writeText(opportunity.jobDescription);
                // You could add a toast notification here
              }}
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => {
                setEditedJobDescription(opportunity.jobDescription);
                setIsEditing(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        {isEditing ?  (
          <div className="space-y-3">
            <Textarea
              value={editedJobDescription}
              onChange={(e) => setEditedJobDescription(e.target.value)}
              className="font-mono whitespace-pre-wrap"
              rows={isExpanded ? 30 : 15}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                size="sm" 
                onClick={() => {
                  updateOpportunity(opportunity.id, { jobDescription: editedJobDescription });
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
          </div>
        ) : (
          <div className={`font-mono whitespace-pre-wrap ${isExpanded ? 'h-auto' : 'max-h-[400px] overflow-y-auto'}`}>
            {opportunity.jobDescription || "No job description available"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
