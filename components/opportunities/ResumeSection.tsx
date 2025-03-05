import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThumbsUp } from 'lucide-react';
import { Lock, Unlock } from 'lucide-react';
import { Opportunity } from '@/context/types';

interface ResumeSectionProps {
  opportunity: Opportunity;
  updateOpportunity: (id: number, updates: Partial<Opportunity>) => void;
  isMasterResumeFrozen: boolean;
  setIsMasterResumeFrozen: (frozen: boolean) => void;
  updateMasterResume: (resume: string) => void;
  suggestions: string[];
  isDarkMode: boolean;
}

export const ResumeSection = ({
  opportunity,
  updateOpportunity,
  isMasterResumeFrozen,
  setIsMasterResumeFrozen,
  updateMasterResume,
  suggestions,
  isDarkMode
}: ResumeSectionProps) => {
  return (
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
  );
};
