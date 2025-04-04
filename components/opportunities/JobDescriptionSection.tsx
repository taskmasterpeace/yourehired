import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Maximize2, Minimize2, Copy, CheckCircle, Edit } from "lucide-react";
import { Opportunity } from "../../context/types";

interface JobDescriptionSectionProps {
  opportunity: Opportunity;
  // Update this to accept string | number for id
  updateOpportunity: (
    id: string | number,
    updates: Partial<Opportunity>
  ) => void;
  isDarkMode: boolean;
}

export const JobDescriptionSection = ({
  opportunity,
  updateOpportunity,
  isDarkMode,
}: JobDescriptionSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJobDescription, setEditedJobDescription] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(opportunity.jobDescription || "");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className={isDarkMode ? "border-gray-700 bg-gray-800" : ""}>
      <CardHeader className="py-3">
        <div className="flex justify-between items-center">
          <h3
            className={`text-sm font-medium ${isDarkMode ? "text-white" : ""}`}
          >
            Job Description
          </h3>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 ${
                isDarkMode ? "hover:bg-gray-700 text-gray-300" : ""
              }`}
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
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 ${
                isDarkMode ? "hover:bg-gray-700 text-gray-300" : ""
              }`}
              onClick={handleCopy}
              title={isCopied ? "Copied!" : "Copy to clipboard"}
              disabled={!opportunity.jobDescription}
            >
              {isCopied ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 ${
                isDarkMode ? "hover:bg-gray-700 text-gray-300" : ""
              }`}
              onClick={() => {
                setEditedJobDescription(opportunity.jobDescription || "");
                setIsEditing(true);
              }}
              title="Edit job description"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editedJobDescription}
              onChange={(e) => setEditedJobDescription(e.target.value)}
              className={`font-mono whitespace-pre-wrap ${
                isDarkMode ? "bg-gray-800 border-gray-700 text-gray-300" : ""
              }`}
              rows={isExpanded ? 30 : 15}
            />
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                onClick={() => {
                  updateOpportunity(opportunity.id, {
                    jobDescription: editedJobDescription,
                  });
                  setIsEditing(false);
                }}
                className={isDarkMode ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className={
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : ""
                }
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`font-mono whitespace-pre-wrap ${
              isExpanded ? "h-auto" : "max-h-[400px] overflow-y-auto"
            } ${isDarkMode ? "text-gray-300" : ""}`}
          >
            {opportunity.jobDescription || (
              <span
                className={`italic ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No job description available
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
