import React, { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Card } from "../ui/card";
import {
  Wand2,
  History,
  Lightbulb,
  Lock,
  Unlock,
  Save,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "../ui/use-toast";
import { OpenCanvasShim } from "./opencanvas-shim";
import {
  ResumeService,
  ResumeVersion as DBResumeVersion,
  QuickAction as DBQuickAction,
} from "@/context/resume-service";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Progress } from "../ui/progress";
import { motion, AnimatePresence } from "framer-motion";

// Define types based on Open Canvas API
interface ResumeVersion {
  id: string;
  content: string;
  timestamp: string;
  name?: string;
}

interface QuickAction {
  id: string;
  name: string;
  prompt: string;
  category?: "resume" | "general" | "custom";
}

interface OpenCanvasEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  isDarkMode?: boolean;
  readOnly?: boolean;
  user?: any;
}

export function OpenCanvasEditor({
  initialContent,
  onSave,
  isDarkMode = false,
  readOnly = false,
  user,
}: OpenCanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<any>(null);
  const resumeService = new ResumeService();
  const [isLoaded, setIsLoaded] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loadedVersions, setLoadedVersions] = useState<ResumeVersion[]>([]);
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isDeletingVersion, setIsDeletingVersion] = useState<string | null>(
    null
  );
  const [versionName, setVersionName] = useState("");
  const [showVersionNameDialog, setShowVersionNameDialog] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([
    {
      id: "improve",
      name: "Improve Writing",
      prompt: "Improve this resume section to sound more professional",
      category: "resume",
    },
    {
      id: "keywords",
      name: "Add Keywords",
      prompt: "Add relevant industry keywords to this section",
      category: "resume",
    },
    {
      id: "achievements",
      name: "Highlight Achievements",
      prompt: "Reformat to emphasize achievements and quantifiable results",
      category: "resume",
    },
    {
      id: "concise",
      name: "Make Concise",
      prompt: "Make this section more concise without losing important details",
      category: "resume",
    },
    {
      id: "grammar",
      name: "Fix Grammar",
      prompt: "Fix any grammar or spelling issues in this section",
      category: "general",
    },
  ]);
  const [customQuickActions, setCustomQuickActions] = useState<QuickAction[]>(
    []
  );
  const [newQuickAction, setNewQuickAction] = useState({
    name: "",
    prompt: "",
    category: "custom",
  });
  const [showQuickActionDialog, setShowQuickActionDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [isLocked, setIsLocked] = useState(readOnly);
  const [streamingResult, setStreamingResult] = useState("");

  // Progress interval for the loading animation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isProcessing) {
      // Simulate progress steps
      interval = setInterval(() => {
        setProcessingProgress((prev) => {
          // Limit to 90% until we actually get the result
          if (prev < 90) {
            return prev + (90 - prev) * 0.1;
          }
          return prev;
        });
      }, 300);
    } else {
      setProcessingProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing]);

  // Initialize editor directly with our shim
  const initializeEditor = () => {
    if (!containerRef.current) return;
    // Destroy existing instance if there is one
    if (canvasRef.current) {
      try {
        canvasRef.current.destroy();
      } catch (e) {
        console.error("Error destroying previous instance:", e);
      }
    }
    try {
      // Initialize with our shim
      canvasRef.current = new OpenCanvasShim({
        element: containerRef.current,
        initialContent: content,
        onChange: (newContent: string) => {
          setContent(newContent);
        },
        readOnly: isLocked,
        theme: isDarkMode ? "dark" : "light",
      });
      // Add initial version
      const initialVersion: ResumeVersion = {
        id: `version-${Date.now()}`,
        content: initialContent,
        timestamp: new Date().toISOString(),
        name: "Initial Version",
      };
      setVersions([initialVersion]);
      setIsLoaded(true);
    } catch (error) {
      console.error("Error initializing editor:", error);
      toast({
        title: "Editor initialization failed",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      });
    }
  };

  // Load saved versions from database
  useEffect(() => {
    const loadVersions = async () => {
      if (!user?.id) return;
      setIsLoadingVersions(true);
      try {
        const versions = await resumeService.getResumeVersions();
        // Transform to match our component's expected format
        const formattedVersions: ResumeVersion[] = versions.map((v) => ({
          id: v.id,
          content: v.content,
          timestamp: v.timestamp,
          name: v.name,
        }));
        setLoadedVersions(formattedVersions);
        // Also load custom quick actions
        const actions = await resumeService.getQuickActions();
        const formattedActions: QuickAction[] = actions
          .filter((a) => a.category === "custom")
          .map((a) => ({
            id: a.id,
            name: a.name,
            prompt: a.prompt,
            category: "custom" as "custom",
          }));
        setCustomQuickActions(formattedActions);
        // Merge with default quick actions
        setQuickActions((prev) => {
          const defaultActions = prev.filter((a) => a.category !== "custom");
          return [...defaultActions, ...formattedActions];
        });
      } catch (error) {
        console.error("Error loading resume versions:", error);
      } finally {
        setIsLoadingVersions(false);
      }
    };
    loadVersions();
  }, [user?.id]);

  // Save current content as a new version
  const saveVersionWithName = async () => {
    if (!user?.id) {
      toast({
        title: "Not logged in",
        description: "Please log in to save resume versions",
        variant: "destructive",
      });
      return;
    }
    setIsSavingVersion(true);
    try {
      // Save to Supabase
      const result = await resumeService.saveResumeVersion(
        content,
        versionName || undefined
      );
      if (result) {
        // Add to local state
        const newVersion: ResumeVersion = {
          id: result.id,
          content: content,
          timestamp: result.timestamp,
          name: result.name || `Version ${new Date().toLocaleString()}`,
        };
        setLoadedVersions((prev) => [newVersion, ...prev]);
        toast({
          title: "Version saved",
          description: "Your resume version has been saved",
        });
        // Also save main resume
        onSave(content);
      }
    } catch (error) {
      console.error("Error saving version:", error);
      toast({
        title: "Error saving version",
        description: "There was a problem saving your resume version",
        variant: "destructive",
      });
    } finally {
      setIsSavingVersion(false);
      setShowVersionNameDialog(false);
      setVersionName("");
    }
  };

  // Prompt for version name before saving
  const saveVersion = () => {
    setShowVersionNameDialog(true);
  };

  // Delete a version
  const deleteVersion = async (versionId: string) => {
    if (!user?.id || !versionId.includes("-")) {
      // Only database versions can be deleted (those with UUIDs)
      return;
    }
    setIsDeletingVersion(versionId);
    try {
      const success = await resumeService.deleteResumeVersion(versionId);
      if (success) {
        // Remove from local state
        setLoadedVersions((prev) => prev.filter((v) => v.id !== versionId));
        toast({
          title: "Version deleted",
          description: "The resume version has been deleted",
        });
      }
    } catch (error) {
      console.error("Error deleting version:", error);
      toast({
        title: "Error deleting version",
        description: "There was a problem deleting this resume version",
        variant: "destructive",
      });
    } finally {
      setIsDeletingVersion(null);
    }
  };

  // Save a new custom quick action
  const saveQuickAction = async () => {
    if (!user?.id || !newQuickAction.name || !newQuickAction.prompt) {
      toast({
        title: "Invalid input",
        description: "Please provide a name and prompt for your quick action",
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await resumeService.saveQuickAction({
        name: newQuickAction.name,
        prompt: newQuickAction.prompt,
        category: "custom",
      });
      if (result) {
        // Add to local state
        const formattedAction: QuickAction = {
          id: result.id,
          name: result.name,
          prompt: result.prompt,
          category: "custom",
        };
        setCustomQuickActions((prev) => [formattedAction, ...prev]);
        // Update the combined quick actions
        setQuickActions((prev) => {
          const defaultActions = prev.filter((a) => a.category !== "custom");
          return [
            ...defaultActions,
            formattedAction,
            ...prev.filter(
              (a) => a.category === "custom" && a.id !== formattedAction.id
            ),
          ];
        });
        toast({
          title: "Quick action saved",
          description: "Your custom quick action has been saved",
        });
      }
    } catch (error) {
      console.error("Error saving quick action:", error);
    } finally {
      setShowQuickActionDialog(false);
      setNewQuickAction({
        name: "",
        prompt: "",
        category: "custom",
      });
    }
  };

  // Delete a custom quick action
  const deleteQuickAction = async (actionId: string) => {
    if (!user?.id || !actionId.includes("-")) {
      // Only database actions can be deleted (those with UUIDs)
      return;
    }
    try {
      const success = await resumeService.deleteQuickAction(actionId);
      if (success) {
        // Remove from local state
        setCustomQuickActions((prev) => prev.filter((a) => a.id !== actionId));
        // Update the combined quick actions
        setQuickActions((prev) => prev.filter((a) => a.id !== actionId));
        toast({
          title: "Quick action deleted",
          description: "The custom quick action has been deleted",
        });
      }
    } catch (error) {
      console.error("Error deleting quick action:", error);
      toast({
        title: "Error deleting quick action",
        description: "There was a problem deleting this quick action",
        variant: "destructive",
      });
    }
  };

  // Apply a quick action to the selected text with streaming
  const applyQuickAction = async (action: QuickAction) => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    setCurrentAction(action.name);
    setProcessingProgress(10);
    setStreamingResult(""); // Reset streaming result

    try {
      // Get selected text or current section
      const selectedText =
        canvasRef.current.getSelectedText() || selectedSection;

      if (!selectedText) {
        toast({
          title: "No text selected",
          description: "Please select some text or a section first",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Call the API with the stream_quick_action action
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stream_quick_action",
          prompt: action.prompt,
          text: selectedText,
          context: "This is for a professional resume.",
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body received");
      }

      // Set up streaming reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6);

            if (data === "[DONE]") {
              // Streaming is complete
              setProcessingProgress(100);

              // Apply the final result
              setTimeout(() => {
                if (canvasRef.current && streamingResult) {
                  canvasRef.current.replaceSelectedText(streamingResult);
                  setIsProcessing(false);
                  toast({
                    title: "Text improved",
                    description: `Successfully applied "${action.name}"`,
                  });
                }
              }, 500);
              return;
            }

            try {
              const parsedData = JSON.parse(data);
              if (parsedData.content) {
                setStreamingResult(parsedData.content);
                // Update progress based on content length
                setProcessingProgress(
                  Math.min(
                    90,
                    10 + (parsedData.content.length / selectedText.length) * 80
                  )
                );
              }
            } catch (e) {
              console.error("Error parsing streaming data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error with streaming:", error);
      // Fall back to non-streaming API
      fallbackToRegularAPI(
        action,
        canvasRef.current.getSelectedText() || selectedSection
      );
    }
  };

  // Fallback to non-streaming API
  const fallbackToRegularAPI = async (
    action: QuickAction,
    selectedText: string
  ) => {
    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quick_action", // Use regular (non-streaming) action
          prompt: action.prompt,
          text: selectedText,
          context: "This is for a professional resume.",
        }),
      });

      if (!response.ok) throw new Error("Failed to process quick action");
      const data = await response.json();

      // Replace the selected text with improved version
      if (data.result) {
        canvasRef.current.replaceSelectedText(data.result);
        toast({
          title: "Text improved",
          description: `Successfully applied "${action.name}"`,
        });
      }
    } catch (error) {
      console.error("Error applying quick action:", error);
      toast({
        title: "AI error",
        description:
          "There was a problem processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch between edit and preview modes
  const toggleMode = () => {
    if (!canvasRef.current) return;
    if (mode === "edit") {
      setMode("preview");
      canvasRef.current.setPreviewMode(true);
    } else {
      setMode("edit");
      canvasRef.current.setPreviewMode(false);
    }
  };

  // Load a specific version
  const loadVersion = async (version: ResumeVersion) => {
    if (!canvasRef.current) return;
    // Ask for confirmation if current content has changed
    if (content !== version.content) {
      if (
        !confirm(
          "Loading a previous version will replace your current changes. Continue?"
        )
      ) {
        return;
      }
    }
    try {
      // If this is from the database (has an ID with dashes), set it as current
      if (typeof version.id === "string" && version.id.includes("-")) {
        await resumeService.setCurrentVersion(version.id);
      }
      setContent(version.content);
      canvasRef.current.setContent(version.content);
      toast({
        title: "Version loaded",
        description: `Loaded version from ${new Date(
          version.timestamp
        ).toLocaleString()}`,
      });
    } catch (error) {
      console.error("Error loading version:", error);
      toast({
        title: "Error loading version",
        description: "There was a problem loading this resume version",
        variant: "destructive",
      });
    }
  };

  // Toggle locked state
  const toggleLock = () => {
    setIsLocked(!isLocked);
    if (canvasRef.current) {
      canvasRef.current.setReadOnly(!isLocked);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeEditor();
    // Clean up on unmount
    return () => {
      if (canvasRef.current) {
        try {
          canvasRef.current.destroy();
        } catch (e) {
          console.error("Error destroying instance:", e);
        }
      }
    };
  }, []);

  // Re-initialize when dark mode changes
  useEffect(() => {
    if (isLoaded && canvasRef.current) {
      canvasRef.current.setTheme(isDarkMode ? "dark" : "light");
    }
  }, [isDarkMode, isLoaded]);

  // Track content changes
  useEffect(() => {
    if (isLoaded && canvasRef.current && initialContent !== content) {
      canvasRef.current.setContent(initialContent);
      setContent(initialContent);
    }
  }, [initialContent]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, y: -20 },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="flex flex-col space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* OpenCanvas Editor Container */}
      <motion.div
        className="relative"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div
          className={`p-0 min-h-[500px] border rounded-md overflow-hidden ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* Editor container */}
          <div ref={containerRef} className="w-full h-full min-h-[500px]" />

          {/* Loading state */}
          <AnimatePresence>
            {!isLoaded && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Loading editor...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Processing Overlay */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <h3 className="text-lg font-semibold mb-2">
                    Applying: {currentAction}
                  </h3>
                  <div className="space-y-3">
                    <Progress value={processingProgress} className="h-2 mb-4" />
                    <p className="text-sm text-gray-500 mb-3">
                      {processingProgress < 30
                        ? "Analyzing text..."
                        : processingProgress < 70
                        ? "Applying improvements..."
                        : "Finalizing changes..."}
                    </p>

                    {/* Live Preview of Streaming Result */}
                    {streamingResult && (
                      <div className="mt-4 border rounded p-3 max-h-28 overflow-y-auto text-sm bg-gray-50 dark:bg-gray-900">
                        <h4 className="text-xs font-medium mb-1 text-gray-500">
                          Preview:
                        </h4>
                        <div className="whitespace-pre-wrap">
                          {streamingResult}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Action Toolbar */}
      <motion.div
        className="flex flex-wrap gap-2 items-center justify-between"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-wrap gap-2">
          <motion.div
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMode}
              disabled={!isLoaded}
            >
              {mode === "edit" ? "Preview" : "Edit"}
            </Button>
          </motion.div>

          <motion.div
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLock}
              disabled={!isLoaded || readOnly}
            >
              {isLocked ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Unlock
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Lock
                </>
              )}
            </Button>
          </motion.div>

          <motion.div
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={saveVersion}
              disabled={!isLoaded || isLocked || !user?.id}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Version
            </Button>
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
          <Button
            onClick={() => {
              console.log("Save Resume button clicked");
              // This is the KEY FIX - when Save Resume is clicked, we use the current content
              // from the editor which is guaranteed to be up-to-date
              onSave(content);
            }}
            disabled={!isLoaded || isLocked}
          >
            Save Resume
          </Button>
        </motion.div>
      </motion.div>

      {/* Tabs for features */}
      <Tabs defaultValue="actions">
        <TabsList>
          <TabsTrigger value="actions">
            <Wand2 className="h-4 w-4 mr-2" />
            Quick Actions
          </TabsTrigger>
          <TabsTrigger value="versions">
            <History className="h-4 w-4 mr-2" />
            Versions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="p-2">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Resume Improvements</h3>
                {user?.id && (
                  <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQuickActionDialog(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Custom
                    </Button>
                  </motion.div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {quickActions
                  .filter((action) => action.category === "resume")
                  .map((action, index) => (
                    <motion.div
                      key={action.id}
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyQuickAction(action)}
                        disabled={isProcessing || isLocked}
                        className="relative group overflow-hidden"
                      >
                        <Lightbulb className="h-4 w-4 mr-1" />
                        {action.name}
                        <motion.span
                          className="absolute bottom-0 left-0 h-0.5 bg-primary"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </Button>
                    </motion.div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">General Improvements</h3>
              <div className="flex flex-wrap gap-2">
                {quickActions
                  .filter((action) => action.category === "general")
                  .map((action, index) => (
                    <motion.div
                      key={action.id}
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyQuickAction(action)}
                        disabled={isProcessing || isLocked}
                        className="relative group overflow-hidden"
                      >
                        <Lightbulb className="h-4 w-4 mr-1" />
                        {action.name}
                        <motion.span
                          className="absolute bottom-0 left-0 h-0.5 bg-primary"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </Button>
                    </motion.div>
                  ))}
              </div>
            </div>

            {quickActions.some((action) => action.category === "custom") && (
              <div>
                <h3 className="text-sm font-medium mb-2">Custom Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {quickActions
                    .filter((action) => action.category === "custom")
                    .map((action, index) => (
                      <motion.div
                        key={action.id}
                        className="relative group"
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyQuickAction(action)}
                          disabled={isProcessing || isLocked}
                          className="pr-8 relative overflow-hidden"
                        >
                          <Lightbulb className="h-4 w-4 mr-1" />
                          {action.name}
                          <motion.span
                            className="absolute bottom-0 left-0 h-0.5 bg-primary"
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{ duration: 0.3 }}
                          />
                        </Button>
                        {/* Delete button for custom actions */}
                        {action.id.includes("-") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuickAction(action.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="versions" className="p-2">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isLoadingVersions ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading versions...</p>
              </div>
            ) : loadedVersions.length === 0 ? (
              <p className="text-sm text-gray-500">No versions saved yet.</p>
            ) : (
              <div className="space-y-2">
                {loadedVersions.map((version, index) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{
                      scale: 1.01,
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Card className="p-2 flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {version.name ||
                            `Version ${new Date(
                              version.timestamp
                            ).toLocaleString()}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(version.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.div
                          whileHover="hover"
                          whileTap="tap"
                          variants={buttonVariants}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadVersion(version)}
                            disabled={isLocked}
                          >
                            Load
                          </Button>
                        </motion.div>
                        {version.id.includes("-") && (
                          <motion.div
                            whileHover="hover"
                            whileTap="tap"
                            variants={buttonVariants}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteVersion(version.id)}
                              disabled={isDeletingVersion === version.id}
                              className="text-red-500 hover:text-red-700"
                            >
                              {isDeletingVersion === version.id ? (
                                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Version Name Dialog */}
      <Dialog
        open={showVersionNameDialog}
        onOpenChange={setShowVersionNameDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Resume Version</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="version-name">Version Name (Optional)</Label>
            <Input
              id="version-name"
              placeholder="e.g., Technical Resume, Version 1.0"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">
              Providing a descriptive name helps you identify this version
              later.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowVersionNameDialog(false)}
            >
              Cancel
            </Button>
            <Button disabled={isSavingVersion} onClick={saveVersionWithName}>
              {isSavingVersion ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : (
                <>Save Version</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Action Dialog */}
      <Dialog
        open={showQuickActionDialog}
        onOpenChange={setShowQuickActionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Quick Action</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="action-name">Action Name</Label>
              <Input
                id="action-name"
                placeholder="e.g., Convert to Bullet Points"
                value={newQuickAction.name}
                onChange={(e) =>
                  setNewQuickAction({ ...newQuickAction, name: e.target.value })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="action-prompt">Prompt for AI</Label>
              <Textarea
                id="action-prompt"
                placeholder="e.g., Convert this text into bullet point format with action verbs at the start"
                value={newQuickAction.prompt}
                onChange={(e) =>
                  setNewQuickAction({
                    ...newQuickAction,
                    prompt: e.target.value,
                  })
                }
                className="mt-2"
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-2">
                Write a clear instruction that tells the AI exactly how to
                transform the selected text.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowQuickActionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveQuickAction}
              disabled={!newQuickAction.name || !newQuickAction.prompt}
            >
              Save Quick Action
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
