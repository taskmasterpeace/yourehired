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
  // This stores what's currently displayed in the editor
  const [resumeContent, setResumeContent] = useState(masterResume);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toISOString()
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch last updated timestamp from Supabase
  const fetchLastUpdated = async () => {
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

  // This function is called by the OpenCanvasEditor when "Save Resume" is clicked
  const handleSaveResume = async (contentToSave: string) => {
    console.log(
      "handleSaveResume called with content length:",
      contentToSave.length
    );

    // Content has changed, so save it
    setIsSaving(true);

    try {
      // Save to Supabase
      const supabase = createSupabaseClient();
      const now = new Date().toISOString();

      console.log("Saving to profiles table...");
      console.log("User ID:", user?.id);
      console.log("Content length:", contentToSave.length);

      // DIRECT SAVE TO DATABASE
      const { error } = await supabase
        .from("profiles")
        .update({
          master_resume: contentToSave,
          updated_at: now,
        })
        .eq("id", user?.id);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      // Update state
      setResumeContent(contentToSave);
      updateMasterResume(contentToSave);
      setLastUpdated(now);

      console.log("Save successful");
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
      const content = event.target?.result as string;

      // Set state
      setResumeContent(content);

      // Also save to database
      try {
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

        updateMasterResume(content);
        setLastUpdated(now);

        toast({
          title: "Resume uploaded",
          description: "Your resume has been uploaded and saved.",
        });
      } catch (error) {
        console.error("Error saving uploaded resume:", error);
        toast({
          title: "Error",
          description:
            "The file was uploaded but couldn't be saved to the database.",
          variant: "destructive",
        });
      }

      setIsUploading(false);
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

  // Direct save to database - for the manual save button
  const saveDirectly = async () => {
    try {
      setIsSaving(true);
      const supabase = createSupabaseClient();
      const now = new Date().toISOString();

      // Get content from state
      const content = resumeContent;

      console.log("Direct save button clicked");
      console.log("Content length:", content.length);

      const { error } = await supabase
        .from("profiles")
        .update({
          master_resume: content,
          updated_at: now,
        })
        .eq("id", user.id);

      if (error) throw error;

      setLastUpdated(now);
      updateMasterResume(content);

      toast({
        title: "Resume saved directly",
        description: "Your resume has been saved successfully.",
      });
    } catch (error) {
      console.error("Error in direct save:", error);
      toast({
        title: "Save error",
        description: "There was a problem saving your resume.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch user data on mount
  useEffect(() => {
    if (user?.id) {
      fetchLastUpdated();
    }
  }, [user]);

  // Update local state when master resume prop changes
  useEffect(() => {
    console.log(
      "masterResume prop changed, length:",
      masterResume?.length || 0
    );
    setResumeContent(masterResume);
  }, [masterResume]);

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
              {/* Direct save button for backup */}
              <Button onClick={saveDirectly} disabled={isSaving}>
                {isSaving ? "Saving..." : "Direct Save"}
              </Button>
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
