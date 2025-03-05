import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Opportunity } from '@/context/types';
import { Maximize2, Minimize2, FileText } from 'lucide-react';
import { OpportunityHeader } from './OpportunityHeader';
import { JobDetailsSection } from './JobDetailsSection';
import { ContactInfoSection } from './ContactInfoSection';
import { NotesSection } from './NotesSection';

interface OpportunityDetailsProps {
  opportunity: Opportunity | undefined;
  updateOpportunity: (id: number, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (id: number) => void;
  isDarkMode: boolean;
  chatMessages: { message: string; sender: string; timestamp: string }[];
  handleSendMessage: () => void;
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  suggestions: string[];
  isMasterResumeFrozen: boolean;
  setIsMasterResumeFrozen: (frozen: boolean) => void;
  updateMasterResume: (resume: string) => void;
}

export const OpportunityDetails = ({
  opportunity,
  updateOpportunity,
  deleteOpportunity,
  isDarkMode,
  chatMessages,
  handleSendMessage,
  currentMessage,
  setCurrentMessage,
  suggestions,
  isMasterResumeFrozen,
  setIsMasterResumeFrozen,
  updateMasterResume
}: OpportunityDetailsProps) => {
  const [isEditingJobDescription, setIsEditingJobDescription] = useState(false);
  const [editedJobDescription, setEditedJobDescription] = useState("");
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] = useState(false);

  if (!opportunity) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <FileText className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
          <h3 className={`text-xl font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No opportunity selected</h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Select an opportunity from the list or add a new one</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={`col-span-1 md:col-span-2 flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <OpportunityHeader 
        opportunity={opportunity} 
        updateOpportunity={updateOpportunity}
        isDarkMode={isDarkMode}
      />
      
      <CardContent className="flex-grow overflow-hidden">
        <Tabs defaultValue="details" className="h-full flex flex-col">
          <TabsList className="mb-2 overflow-x-auto flex-nowrap">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="description">Job Description</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-grow overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JobDetailsSection 
                opportunity={opportunity} 
                updateOpportunity={updateOpportunity}
                isDarkMode={isDarkMode}
              />
              
              <ContactInfoSection 
                opportunity={opportunity} 
                updateOpportunity={updateOpportunity}
                isDarkMode={isDarkMode}
              />
              
              <div className="col-span-1 md:col-span-2">
                <NotesSection 
                  opportunity={opportunity} 
                  updateOpportunity={updateOpportunity}
                  isDarkMode={isDarkMode}
                />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Opportunity</h3>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this opportunity?")) {
                          deleteOpportunity(opportunity.id);
                        }
                      }}
                    >
                      Delete Opportunity
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="description" className="flex-grow overflow-auto">
            <Card>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Job Description</h3>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => setIsJobDescriptionExpanded(!isJobDescriptionExpanded)}
                    >
                      {isJobDescriptionExpanded ? (
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
                        setIsEditingJobDescription(true);
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
                {isEditingJobDescription ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editedJobDescription}
                      onChange={(e) => setEditedJobDescription(e.target.value)}
                      className="font-mono whitespace-pre-wrap"
                      rows={isJobDescriptionExpanded ? 30 : 15}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          updateOpportunity(opportunity.id, { jobDescription: editedJobDescription });
                          setIsEditingJobDescription(false);
                        }}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setIsEditingJobDescription(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={`font-mono whitespace-pre-wrap ${isJobDescriptionExpanded ? 'h-auto' : 'max-h-[400px] overflow-y-auto'}`}>
                    {opportunity.jobDescription || "No job description available"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Resume and Chat tabs would go here, but we'll keep them in the main component for now */}
          <TabsContent value="resume" className="flex-grow overflow-auto">
            {/* Resume content from main component */}
          </TabsContent>
          
          <TabsContent value="chat" className="flex-grow overflow-hidden flex flex-col">
            {/* Chat content from main component */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
