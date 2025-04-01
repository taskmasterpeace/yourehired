import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  ThumbsUp,
  Lock,
  Unlock,
  Sparkles,
  Info,
  RefreshCw,
  FileText,
  Clock,
} from "lucide-react";
import { Opportunity } from "../../context/types";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeSectionProps {
  opportunity: Opportunity;
  updateOpportunity: (
    id: string | number,
    updates: Partial<Opportunity>
  ) => void;
  isMasterResumeFrozen: boolean;
  setIsMasterResumeFrozen: (frozen: boolean) => void;
  updateMasterResume: (resume: string) => void;
  suggestions: string[];
  isDarkMode: boolean;
  masterResume?: string; // Add master resume as an optional prop
}

export const ResumeSection = ({
  opportunity,
  updateOpportunity,
  isMasterResumeFrozen,
  setIsMasterResumeFrozen,
  updateMasterResume,
  suggestions,
  isDarkMode,
  masterResume = "",
}: ResumeSectionProps) => {
  const [showTailoredInfo, setShowTailoredInfo] = useState(false);
  const [isRetailoringResume, setIsRetailoringResume] = useState(false);

  // Detect if this is likely a tailored resume (different from master resume)
  const isTailoredResume =
    opportunity.resume &&
    masterResume &&
    opportunity.resume !== masterResume &&
    opportunity.resume.length > 100; // Ensure it's substantial

  // Handle re-tailoring the resume
  const handleRetailorResume = async () => {
    if (!opportunity.jobDescription || !masterResume) return;

    setIsRetailoringResume(true);

    try {
      // Call the API to re-tailor the resume
      const response = await fetch("/api/openai-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          resume: masterResume,
          jobDescription: opportunity.jobDescription,
          position: opportunity.position,
          company: opportunity.company,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.content && typeof data.content === "string") {
        // Update the opportunity with the new tailored resume
        updateOpportunity(opportunity.id, { resume: data.content });
      } else {
        throw new Error("Invalid response from AI service");
      }
    } catch (error) {
      console.error("Error re-tailoring resume:", error);
      alert("Failed to re-tailor resume. Please try again later.");
    } finally {
      setIsRetailoringResume(false);
    }
  };

  const resumeModificationTime =
    opportunity.updatedAt || new Date().toISOString();
  const formattedTime = new Date(resumeModificationTime).toLocaleString();

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex flex-col">
            <CardTitle className="text-sm font-medium">
              Resume for This Application
            </CardTitle>
            {isTailoredResume && (
              <CardDescription className="flex items-center text-xs mt-1">
                <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                AI-Tailored for this job
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto ml-1 text-xs underline"
                  onClick={() => setShowTailoredInfo(!showTailoredInfo)}
                >
                  {showTailoredInfo ? "Hide info" : "Learn more"}
                </Button>
              </CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isTailoredResume && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={handleRetailorResume}
                disabled={isRetailoringResume || !opportunity.jobDescription}
              >
                {isRetailoringResume ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Re-tailoring...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Re-tailor
                  </>
                )}
              </Button>
            )}
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

      {/* Tailored resume info box */}
      <AnimatePresence>
        {showTailoredInfo && isTailoredResume && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`mx-6 mb-4 p-3 rounded-md text-sm ${
              isDarkMode
                ? "bg-blue-900/20 border border-blue-800 text-blue-300"
                : "bg-blue-50 border border-blue-100 text-blue-700"
            }`}
          >
            <div className="flex">
              <Info className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
              <div>
                <p className="mb-1">
                  This resume has been optimized by AI for this specific job
                  opportunity based on the job description.
                </p>
                <p className="text-xs flex items-center mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  Last tailored on {formattedTime}
                </p>
                {masterResume && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs ${
                        isDarkMode
                          ? "border-blue-700 text-blue-300 hover:bg-blue-900/30"
                          : "border-blue-200 text-blue-700 hover:bg-blue-100"
                      }`}
                      onClick={() =>
                        updateOpportunity(opportunity.id, {
                          resume: masterResume,
                        })
                      }
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Revert to Master Resume
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CardContent className="py-2">
        <Textarea
          value={opportunity.resume || ""}
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
          placeholder="No resume content. You can paste a resume here or create a master resume in your profile."
        />

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">AI Suggestions</h4>
          <div className="space-y-2">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-2 p-2 rounded ${
                    isDarkMode
                      ? "bg-blue-900/20 text-blue-300"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <ThumbsUp className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))
            ) : (
              <p
                className={`text-sm italic ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Loading suggestions...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
