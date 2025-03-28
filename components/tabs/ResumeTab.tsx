import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Save, Upload, Download, Edit, Eye } from "lucide-react";
import { toast } from "../ui/use-toast";
import { createSupabaseClient } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
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
  const [memories, setMemories] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
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

  // Save changes to the resume
  const handleSaveResume = async (content: string) => {
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
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setResumeContent(content);

      setIsUploading(false);
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded and is ready to edit.",
      });
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

  // Handle memory generation
  const handleMemoryGenerated = (memory: string) => {
    setMemories((prev) => [...prev, memory]);
  };

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
                powered by OpenCanvas
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
                accept=".txt,.doc,.docx,.pdf,.rtf"
                className="hidden"
                onChange={handleResumeUpload}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor">
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Resume Editor</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              {/* OpenCanvas Editor */}
              <OpenCanvasEditor
                initialContent={resumeContent}
                onSave={handleSaveResume}
                isDarkMode={isDarkMode}
                onGenerateMemory={handleMemoryGenerated}
              />
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Choose a template style for your resume. This affects how your
                resume will look when exported or applied to job applications.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  className={`cursor-pointer ${
                    selectedTemplate === "standard"
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => setSelectedTemplate("standard")}
                >
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2">Standard</h3>
                    <p className="text-sm text-gray-500">
                      A classic resume layout suitable for most industries.
                    </p>
                    <div className="mt-4 h-40 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      <p className="text-xs text-gray-500">
                        Standard Template Preview
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer ${
                    selectedTemplate === "modern" ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedTemplate("modern")}
                >
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2">Modern</h3>
                    <p className="text-sm text-gray-500">
                      A contemporary design with accent colors and modern
                      typography.
                    </p>
                    <div className="mt-4 h-40 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      <p className="text-xs text-gray-500">
                        Modern Template Preview
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer ${
                    selectedTemplate === "minimal" ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedTemplate("minimal")}
                >
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2">Minimal</h3>
                    <p className="text-sm text-gray-500">
                      A clean, minimalist design focused on content.
                    </p>
                    <div className="mt-4 h-40 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      <p className="text-xs text-gray-500">
                        Minimal Template Preview
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Editor Settings</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Customize how the resume editor works.
                  </p>

                  {/* This will be expanded with more settings in the future */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input type="checkbox" id="auto-save" className="mr-2" />
                      <label htmlFor="auto-save" className="text-sm">
                        Enable auto-save (every 30 seconds)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="spell-check"
                        className="mr-2"
                        defaultChecked
                      />
                      <label htmlFor="spell-check" className="text-sm">
                        Enable spell checking
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">AI Features</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Your resume editor comes with built-in AI assistance powered
                    by OpenAI. These features help you improve your resume with
                    smart suggestions and feedback.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="mr-2 mt-1">✅</div>
                      <div>
                        <p className="text-sm font-medium">Quick Actions</p>
                        <p className="text-xs text-gray-500">
                          Apply professional improvements to your resume
                          sections with one click
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mr-2 mt-1">✅</div>
                      <div>
                        <p className="text-sm font-medium">
                          Insightful Memories
                        </p>
                        <p className="text-xs text-gray-500">
                          Get personalized tips as you edit your resume
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mr-2 mt-1">✅</div>
                      <div>
                        <p className="text-sm font-medium">Version Control</p>
                        <p className="text-xs text-gray-500">
                          Save and restore previous versions of your resume
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
