import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Opportunity } from "@/context/types";
import { FileText, Image as ImageIcon } from "lucide-react";
import { OpportunityHeader } from "./OpportunityHeader";
import { JobDetailsSection } from "./JobDetailsSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { NotesSection } from "./NotesSection";
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
  openGuide,
  isLoadingPrompts = false,
  dispatch,
}: OpportunityDetailsProps) => {
  const [assistantAvatar, setAssistantAvatar] = useState<string>("");
  const [workspaceImage, setWorkspaceImage] = useState<string>("");
  const [isGeneratingAvatars, setIsGeneratingAvatars] =
    useState<boolean>(false);
  const [isGeneratingWorkspace, setIsGeneratingWorkspace] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("details");

  // Load or generate avatar and workspace image when opportunity changes
  useEffect(() => {
    if (!opportunity) return;

    // Check for cached assistant avatar
    const storedAvatars = localStorage.getItem(`avatars_${opportunity.id}`);
    if (storedAvatars) {
      try {
        const avatars = JSON.parse(storedAvatars);
        if (avatars.assistantAvatar) {
          console.log("Loading cached avatar");
          setAssistantAvatar(avatars.assistantAvatar);
        } else {
          generateAssistantAvatar();
        }
      } catch (error) {
        console.error("Error parsing cached avatar:", error);
        generateAssistantAvatar();
      }
    } else {
      generateAssistantAvatar();
    }

    // Check for cached workspace image
    const storedWorkspace = localStorage.getItem(`workspace_${opportunity.id}`);
    if (storedWorkspace) {
      try {
        const workspace = JSON.parse(storedWorkspace);
        if (workspace.imageUrl) {
          console.log("Loading cached workspace image");
          setWorkspaceImage(workspace.imageUrl);
        } else {
          generateWorkspaceImage();
        }
      } catch (error) {
        console.error("Error parsing cached workspace image:", error);
        generateWorkspaceImage();
      }
    } else {
      generateWorkspaceImage();
    }
  }, [opportunity]);

  // Function to generate assistant avatar - simplified
  const generateAssistantAvatar = async () => {
    if (!opportunity || isGeneratingAvatars) return;

    setIsGeneratingAvatars(true);

    try {
      // Generate assistant avatar with simplified approach
      const assistantResponse = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: opportunity.position,
          jobDescription: opportunity.jobDescription,
        }),
      });

      const assistantData = await assistantResponse.json();

      // If successful, update the avatar
      if (assistantData.success && assistantData.imageUrl) {
        const assistantAvatarUrl = String(assistantData.imageUrl);

        // Store in state
        setAssistantAvatar(assistantAvatarUrl);

        // Cache in localStorage
        localStorage.setItem(
          `avatars_${opportunity.id}`,
          JSON.stringify({
            assistantAvatar: assistantAvatarUrl,
          })
        );
      } else {
        console.error(
          "Failed to generate assistant avatar:",
          assistantData.error
        );
      }
    } catch (error) {
      console.error("Error generating assistant avatar:", error);
    } finally {
      setIsGeneratingAvatars(false);
    }
  };

  // Function to generate workspace image
  const generateWorkspaceImage = async () => {
    if (!opportunity || isGeneratingWorkspace) return;

    setIsGeneratingWorkspace(true);

    try {
      const response = await fetch("/api/replicate-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: opportunity.position,
          jobDescription: opportunity.jobDescription,
        }),
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        const imageUrl = String(data.imageUrl);

        // Store in state
        setWorkspaceImage(imageUrl);

        // Cache in localStorage
        localStorage.setItem(
          `workspace_${opportunity.id}`,
          JSON.stringify({
            imageUrl: imageUrl,
          })
        );
      } else {
        console.error("Failed to generate workspace image:", data.error);
      }
    } catch (error) {
      console.error("Error generating workspace image:", error);
    } finally {
      setIsGeneratingWorkspace(false);
    }
  };

  // Format date as MM/DD/YYYY
  const formatDate = (date: string | number | Date) => {
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
      .getDate()
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

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
        <Tabs
          defaultValue="details"
          className="h-full flex flex-col"
          onValueChange={(value) => setActiveTab(value)}
        >
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
            <div className="grid grid-cols-1 gap-4">
              {/* Workspace Visualization Card - First Item */}
              <div
                className={`rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                {isGeneratingWorkspace ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
                      <p
                        className={`${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Generating workspace based on job description...
                      </p>
                    </div>
                  </div>
                ) : workspaceImage ? (
                  <div className="relative">
                    <img
                      src={workspaceImage}
                      alt={`Workspace for ${opportunity.position} at ${opportunity.company}`}
                      className="w-full h-auto rounded-md object-cover"
                      style={{ maxHeight: "450px" }}
                      onError={() => {
                        console.error("Failed to load workspace image");
                        setWorkspaceImage("");
                      }}
                    />
                    {/* Dark gradient overlay from bottom */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
                      style={{
                        borderBottomLeftRadius: "0.375rem",
                        borderBottomRightRadius: "0.375rem",
                      }}
                    ></div>
                    {/* Employer name with drop shadow */}
                    <div className="absolute bottom-14 left-6 text-white">
                      <h3 className="text-xl font-semibold drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
                        {opportunity.company}
                      </h3>
                    </div>
                    {/* Job title and date side by side */}
                    <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-white">
                      <p className="text-lg">{opportunity.position}</p>
                      <p className="text-sm opacity-90">
                        {formatDate(opportunity.appliedDate)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-24 bg-gray-100 dark:bg-gray-700 rounded">
                    <div className="text-center">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p
                        className={`${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Preparing workspace visualization...
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Other Details */}
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
              </div>
              <div className="col-span-1">
                <KeywordsSection
                  opportunity={opportunity}
                  updateOpportunity={updateOpportunity}
                  isDarkMode={isDarkMode}
                  openGuide={openGuide}
                />
              </div>
              <div className="col-span-1">
                <NotesSection
                  opportunity={opportunity}
                  updateOpportunity={updateOpportunity}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="col-span-1">
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
              <div className="col-span-1 mt-4">
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
              isDarkMode={isDarkMode}
            />
          </TabsContent>
          <TabsContent
            value="chat"
            className="flex-grow overflow-hidden flex flex-col"
          >
            {isGeneratingAvatars ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <h3
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Personalizing your chat experience...
                  </h3>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } mt-2`}
                  >
                    Generating assistant avatar for this conversation
                  </p>
                </div>
              </div>
            ) : (
              <AIChatSection
                chatMessages={chatMessages}
                opportunity={opportunity}
                onAddMessage={(opportunityId, message, sender) => {
                  if (sender === "user") {
                    setCurrentMessage(message);
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
                    setTimeout(() => handleSendMessage(), 10);
                  }
                }}
                isDarkMode={isDarkMode}
                resume={opportunity.resume}
                assistantAvatar={assistantAvatar}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
