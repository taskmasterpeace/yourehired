import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // Adjust import path as needed
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Adjust import path as needed
import { Button } from "@/components/ui/button"; // Adjust import path as needed
import { Opportunity } from "@/context/types"; // Adjust import path as needed
import { FileText } from "lucide-react";
import { OpportunityHeader } from "./OpportunityHeader";
import { JobDetailsSection } from "./JobDetailsSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { NotesSection } from "./NotesSection";
import { TagsSection } from "./TagsSection";
import { KeywordsSection } from "./KeywordsSection";
import { ResumeSection } from "./ResumeSection";
import { AIChatSection } from "./AIChatSection";
import { JobDescriptionSection } from "./JobDescriptionSection";
import ApplicationTimeline from "./ApplicationTimeline";

interface OpportunityDetailsProps {
  opportunity: Opportunity | undefined;
  updateOpportunity: (
    id: string | number,
    updates: Partial<Opportunity>
  ) => void;
  deleteOpportunity: (id: string | number) => void;
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
  isLoadingPrompts?: boolean;
  dispatch?: any;
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
  openGuide,
  isLoadingPrompts = false,
  dispatch,
}: OpportunityDetailsProps) => {
  if (!opportunity) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <FileText
            className={`h-16 w-16 ${
              isDarkMode ? "text-gray-600" : "text-gray-300"
            } mx-auto mb-4`}
          />
          <h3
            className={`text-xl font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            No opportunity selected
          </h3>
          <p
            className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} mt-2`}
          >
            Select an opportunity from the list or add a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`col-span-1 md:col-span-2 flex flex-col ${
        isDarkMode ? "bg-gray-800 border-gray-700" : ""
      }`}
    >
      <OpportunityHeader
        opportunity={opportunity}
        updateOpportunity={updateOpportunity}
        isDarkMode={isDarkMode}
      />
      <CardContent className="flex-grow overflow-hidden">
        <Tabs defaultValue="details" className="h-full flex flex-col">
          <TabsList className="mb-2 overflow-x-auto flex-nowrap gap-1 p-1 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <TabsTrigger
              value="details"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              Job Description
            </TabsTrigger>
            <TabsTrigger
              value="resume"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              Resume
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              AI Assistant
            </TabsTrigger>
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
                <div
                  className={`p-4 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Delete Opportunity
                    </h3>
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
                <div
                  className={`p-4 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <ApplicationTimeline
                    opportunity={opportunity}
                    isDarkMode={isDarkMode}
                  />
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
          <TabsContent
            value="chat"
            className="flex-grow overflow-hidden flex flex-col"
          >
            <AIChatSection
              chatMessages={chatMessages}
              opportunity={opportunity}
              onAddMessage={(opportunityId, message, sender) => {
                if (sender === "user") {
                  // For user messages, we'll set current message and trigger the parent's handler
                  setCurrentMessage(message);

                  // Add the message immediately to the UI for better UX
                  const timestamp = new Date().toISOString();
                  if (dispatch) {
                    dispatch({
                      type: "ADD_CHAT_MESSAGE",
                      payload: {
                        opportunityId,
                        message,
                        sender: "user",
                        timestamp,
                      },
                    });
                  }

                  // Call the parent's handler to process the message
                  setTimeout(() => handleSendMessage(), 10);
                }
              }}
              isDarkMode={isDarkMode}
              resume={opportunity.resume}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
