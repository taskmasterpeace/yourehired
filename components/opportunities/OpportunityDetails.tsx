import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Opportunity } from '@/context/types';
import { Maximize2, Minimize2, FileText, Lock, Unlock, User, Bot, MessageSquare, Send, ChevronRight, ThumbsUp } from 'lucide-react';
import { OpportunityHeader } from './OpportunityHeader';
import { JobDetailsSection } from './JobDetailsSection';
import { ContactInfoSection } from './ContactInfoSection';
import { NotesSection } from './NotesSection';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion } from "framer-motion";

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
          
          <TabsContent value="resume" className="flex-grow overflow-auto">
            <Card>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium">Resume for This Application</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Switch
                        checked={isMasterResumeFrozen}
                        onCheckedChange={setIsMasterResumeFrozen}
                        id="freeze-resume"
                      />
                      <Label htmlFor="freeze-resume" className="text-xs">
                        {isMasterResumeFrozen ? (
                          <div className="flex items-center">
                            <Lock className="h-3 w-3 mr-1" />
                            <span>Frozen</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Unlock className="h-3 w-3 mr-1" />
                            <span>Synced with Master</span>
                          </div>
                        )}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <Textarea
                  value={opportunity.resume}
                  onChange={(e) => {
                    const newResume = e.target.value;
                    updateOpportunity(opportunity.id, { resume: newResume });
                    
                    // If not frozen, also update the master resume
                    if (!isMasterResumeFrozen) {
                      updateMasterResume(newResume);
                    }
                  }}
                  className="font-mono whitespace-pre-wrap"
                  rows={15}
                />
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">AI Suggestions</h4>
                  <div className="space-y-2">
                    {suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                          <ThumbsUp className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">Loading suggestions...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="chat" className="flex-grow overflow-hidden flex flex-col">
            <Card className="flex-grow flex flex-col overflow-hidden">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Chat with AI Assistant</CardTitle>
                <CardDescription>
                  Ask questions about the job, get resume advice, or prepare for interviews
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden flex flex-col p-0">
                <div className="flex-grow overflow-y-auto p-4">
                  {chatMessages.length > 0 ? (
                    <>
                      {chatMessages.map((msg, index) => (
                        <div 
                          key={index} 
                          className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[90%] sm:max-w-[80%] rounded-lg p-3 ${
                              msg.sender === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="flex items-center mb-1">
                              {msg.sender === 'user' ? (
                                <>
                                  <span className="text-xs opacity-75">You</span>
                                  <User className="h-3 w-3 ml-1 opacity-75" />
                                </>
                              ) : (
                                <>
                                  <Bot className="h-3 w-3 mr-1 opacity-75" />
                                  <span className="text-xs opacity-75">AI Assistant</span>
                                </>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                            <div className="text-right">
                              <span className="text-xs opacity-75">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                      <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
                      <p className="text-gray-500 max-w-md mt-1">
                        Start a conversation with the AI assistant to get help with your job application
                      </p>
                      
                      {/* New section for suggested prompts */}
                      <div className="w-full max-w-md mt-6">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-700">Suggested prompts for this stage:</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setIsLoadingPrompts(true);
                              setTimeout(() => {
                                setAiPrompts(getPromptsForStatus(opportunity.status));
                                setIsLoadingPrompts(false);
                              }, 300);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {isLoadingPrompts ? (
                            // Loading placeholders
                            Array(4).fill(0).map((_, i) => (
                              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
                            ))
                          ) : (
                            aiPrompts.map((prompt, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                <Button
                                  variant="outline"
                                  className="justify-start text-left h-auto py-3 w-full"
                                  onClick={() => {
                                    setCurrentMessage(prompt);
                                    setTimeout(() => handleSendMessage(), 100);
                                  }}
                                >
                                  {prompt}
                                </Button>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Add prompt suggestion section for when there are already messages */}
                {chatMessages.length > 0 && (
                  <div className="px-4 mb-4">
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                        <ChevronRight className="h-4 w-4 mr-1" />
                        <span>Show suggested prompts</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <div className="grid grid-cols-1 gap-2">
                          {isLoadingPrompts ? (
                            Array(4).fill(0).map((_, i) => (
                              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
                            ))
                          ) : (
                            aiPrompts.map((prompt, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-start text-left h-auto py-2 w-full text-sm"
                                  onClick={() => {
                                    setCurrentMessage(prompt);
                                    setTimeout(() => handleSendMessage(), 100);
                                  }}
                                >
                                  {prompt}
                                </Button>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
                
                <div className="p-4 border-t">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-grow"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      className="self-end"
                      onClick={handleSendMessage}
                      disabled={currentMessage.trim() === ""}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
