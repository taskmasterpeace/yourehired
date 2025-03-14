import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Opportunity } from '../../context/types';
import { FileText } from 'lucide-react';
import { OpportunityHeader } from './OpportunityHeader';
import { JobDetailsSection } from './JobDetailsSection';
import { ContactInfoSection } from './ContactInfoSection';
import { NotesSection } from './NotesSection';
import { TagsSection } from './TagsSection';
import { KeywordsSection } from './KeywordsSection';
import { ResumeSection } from './ResumeSection';
import { AIChatSection } from './AIChatSection';
import { JobDescriptionSection } from './JobDescriptionSection';
import ApplicationTimeline from './ApplicationTimeline';

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
  openGuide?: (guideId: string, sectionId?: string) => void;
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
  updateMasterResume,
  openGuide
}: OpportunityDetailsProps) => {
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);

  // Helper function to get prompts based on status
  const getPromptsForStatus = (status: string) => {
    // This is a simplified version - in a real implementation, you'd have a more comprehensive mapping
    return [
      "Analyze this job description and identify my top 3 matching qualifications",
      "Help me prepare for an interview for this position",
      "What skills should I emphasize in my application for this role?",
      "Draft a follow-up email for this application"
    ];
  };

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
                <TagsSection
                  opportunity={opportunity}
                  updateOpportunity={updateOpportunity}
                  isDarkMode={isDarkMode}
                  openGuide={openGuide}
                />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <KeywordsSection
                  opportunity={opportunity}
                  updateOpportunity={updateOpportunity}
                  isDarkMode={isDarkMode}
                  openGuide={openGuide}
                />
              </div>
              
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
                      onClick={() => deleteOpportunity(opportunity.id)}
                    >
                      Delete Opportunity
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 mt-8">
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <ApplicationTimeline opportunity={opportunity} isDarkMode={isDarkMode} />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="description" className="flex-grow overflow-auto">
            <JobDescriptionSection 
              opportunity={opportunity}
              updateOpportunity={updateOpportunity}
              isDarkMode={isDarkMode}
            />
          </TabsContent>
          
          <TabsContent value="resume" className="flex-grow overflow-auto">
            <ResumeSection
              opportunity={opportunity}
              updateOpportunity={updateOpportunity}
              isMasterResumeFrozen={isMasterResumeFrozen}
              setIsMasterResumeFrozen={setIsMasterResumeFrozen}
              updateMasterResume={updateMasterResume}
              suggestions={suggestions}
              isDarkMode={isDarkMode}
            />
          </TabsContent>
          
          <TabsContent value="chat" className="flex-grow overflow-hidden flex flex-col">
            <AIChatSection
              chatMessages={chatMessages}
              handleSendMessage={handleSendMessage}
              currentMessage={currentMessage}
              setCurrentMessage={setCurrentMessage}
              aiPrompts={aiPrompts}
              isLoadingPrompts={isLoadingPrompts}
              isDarkMode={isDarkMode}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
