import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import {
  Sparkles,
  Info,
  FileText,
  Clock,
  Copy,
  Save,
  CheckCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Opportunity } from "../../context/types";
import { motion, AnimatePresence } from "framer-motion";
import { MarkdownRenderer } from "../opportunities/MarkdownRenderer";

interface ResumeSectionProps {
  opportunity: Opportunity;
  updateOpportunity: (
    id: string | number,
    updates: Partial<Opportunity>
  ) => void;
  isDarkMode: boolean;
  masterResume?: string;
}

export const ResumeSection = ({
  opportunity,
  updateOpportunity,
  isDarkMode,
  masterResume = "",
}: ResumeSectionProps) => {
  const [showTailoredInfo, setShowTailoredInfo] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [localResume, setLocalResume] = useState(opportunity.resume || "");
  const [isExpanded, setIsExpanded] = useState(false);

  // Update local resume when opportunity changes
  useEffect(() => {
    setLocalResume(opportunity.resume || "");
    setIsEdited(false);
  }, [opportunity.id, opportunity.resume]);

  // Detect if this is likely a tailored resume (different from master resume)
  const isTailoredResume =
    opportunity.resume &&
    masterResume &&
    opportunity.resume !== masterResume &&
    opportunity.resume.length > 100;

  // Handle saving the resume changes
  const handleSaveResume = () => {
    updateOpportunity(opportunity.id, { resume: localResume });
    setIsEdited(false);
  };

  // Copy resume to clipboard
  const handleCopyResume = () => {
    navigator.clipboard.writeText(localResume);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const resumeModificationTime =
    opportunity.updatedAt || new Date().toISOString();
  const formattedTime = new Date(resumeModificationTime).toLocaleString();

  return (
    <Card className={`${isDarkMode ? "border-gray-700" : ""}`}>
      <CardHeader className="py-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex flex-col">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Resume for This Application
            </CardTitle>
            {isTailoredResume && (
              <CardDescription className="flex items-center text-xs mt-1">
                <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                Customized for this job
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? "Edit" : "Preview"}
            </Button>
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
                  This resume has been customized for this specific job
                  opportunity.
                </p>
                <p className="text-xs flex items-center mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  Last modified on {formattedTime}
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
                      onClick={() => {
                        updateOpportunity(opportunity.id, {
                          resume: masterResume,
                        });
                        setLocalResume(masterResume);
                      }}
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
        {isPreviewMode ? (
          <div
            className={`p-4 border rounded-md ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            } min-h-[300px] ${
              isExpanded ? "h-auto" : "max-h-[400px] overflow-y-auto"
            }`}
          >
            {localResume ? (
              <MarkdownRenderer content={localResume} isDarkMode={isDarkMode} />
            ) : (
              <div className="h-full flex items-center justify-center text-center p-4">
                <p
                  className={`text-sm italic ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No resume content. Switch to Edit mode to add content.
                </p>
              </div>
            )}
          </div>
        ) : (
          <Textarea
            value={localResume}
            onChange={(e) => {
              setLocalResume(e.target.value);
              setIsEdited(true);
            }}
            className={`font-mono whitespace-pre-wrap ${
              isDarkMode ? "bg-gray-800 border-gray-700" : ""
            }`}
            rows={isExpanded ? 30 : 15}
            placeholder="No resume content. You can paste a resume here or create a master resume in your profile."
          />
        )}
      </CardContent>
      <CardFooter
        className={`flex flex-wrap justify-between gap-2 pt-2 pb-4 ${
          isDarkMode ? "border-gray-700" : ""
        }`}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyResume}
            className={`${
              isDarkMode ? "border-gray-700 hover:bg-gray-700" : ""
            }`}
            disabled={!localResume}
          >
            {isCopied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
        {isEdited && !isPreviewMode && (
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveResume}
            className={`${isDarkMode ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          >
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
