import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Upload, Download } from "lucide-react";
import { toast } from "../ui/use-toast";
import { createSupabaseClient } from "@/lib/supabase";
import { OpenCanvasEditor } from "../openCanvas/OpenCanvas";

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
  user,
}: ResumeTabProps) {
  const [resumeContent, setResumeContent] = useState(masterResume);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toISOString()
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch last updated timestamp from Supabase
  const fetchLastUpdated = async () => {
    if (!user?.id) return;

    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("updated_at")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data && data.updated_at) {
        setLastUpdated(data.updated_at);
      }
    } catch (error) {
      console.error("Error fetching last updated timestamp:", error);
    }
  };

  // Save changes to the resume
  const handleSaveResume = async (content: string) => {
    console.log("handleSaveResume called with content length:", content.length);

    setIsSaving(true);

    try {
      // Update local state
      setResumeContent(content);
      updateMasterResume(content);

      // Save to Supabase if user is logged in
      if (user?.id) {
        const supabase = createSupabaseClient();
        const now = new Date().toISOString();

        const { error } = await supabase
          .from("profiles")
          .update({
            master_resume: content,
            updated_at: now,
          })
          .eq("id", user.id);

        if (error) throw error;

        setLastUpdated(now);
      }

      toast({
        title: "Resume saved",
        description: "Your master resume has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving resume:", error);
      toast({
        title: "Error saving resume",
        description: "There was a problem saving your resume to the database.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload for resume
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;

        // Update local state
        setResumeContent(content);
        updateMasterResume(content);

        // Save to database
        if (user?.id) {
          const supabase = createSupabaseClient();
          const now = new Date().toISOString();

          const { error } = await supabase
            .from("profiles")
            .update({
              master_resume: content,
              updated_at: now,
            })
            .eq("id", user.id);

          if (error) throw error;

          setLastUpdated(now);
        }

        toast({
          title: "Resume uploaded",
          description: "Your resume has been uploaded and saved successfully.",
        });
      } catch (error) {
        console.error("Error saving uploaded resume:", error);
        toast({
          title: "Error saving",
          description:
            "Your resume was uploaded but could not be saved to the database.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your resume file.",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
  };

  // Download resume as a text file
  const handleDownloadResume = () => {
    const blob = new Blob([resumeContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "master-resume.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Update local content when masterResume prop changes
  useEffect(() => {
    if (masterResume !== resumeContent) {
      console.log("Updating local state from masterResume prop");
      setResumeContent(masterResume);
    }
  }, [masterResume]);

  // Fetch user data on mount
  useEffect(() => {
    if (user?.id) {
      fetchLastUpdated();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Master Resume</CardTitle>
              <CardDescription>
                Create and edit your master resume with our advanced editor
              </CardDescription>
              <p className="text-xs text-gray-400 mt-2">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadResume}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleResumeUpload}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* OpenCanvas Editor */}
          <OpenCanvasEditor
            initialContent={resumeContent}
            onSave={handleSaveResume}
            isDarkMode={isDarkMode}
            readOnly={false}
            user={user}
          />
        </CardContent>
      </Card>
    </div>
  );
}
