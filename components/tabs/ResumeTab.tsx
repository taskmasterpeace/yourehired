import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface ResumeTabProps {
  masterResume: string;
  updateMasterResume: (resume: string) => void;
  opportunities: any[];
  dispatch: any;
  isDarkMode: boolean;
  user: any;
}

export function ResumeTab({
  masterResume,
  updateMasterResume,
  opportunities,
  dispatch,
  isDarkMode,
  user
}: ResumeTabProps) {
  return (
    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader>
        <CardTitle>Master Resume</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This is your master resume that will be used as a template for all job applications.
            Edit it here to update your base resume.
          </p>
          <Textarea
            value={masterResume}
            onChange={(e) => updateMasterResume(e.target.value)}
            className="font-mono min-h-[400px]"
            placeholder="Paste your resume here..."
          />
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
