import React, { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Card } from "../ui/card";
import {
  Wand2,
  History,
  Brain,
  Lightbulb,
  Lock,
  Unlock,
  Save,
} from "lucide-react";
import { toast } from "../ui/use-toast";
import { OpenCanvasShim } from "./opencanvas-shim";

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
  onGenerateMemory?: (memory: string) => void;
}

// Add OpenCanvas to the window object type
declare global {
  interface Window {
    OpenCanvas?: any;
  }
}

export function OpenCanvasEditor({
  initialContent,
  onSave,
  isDarkMode = false,
  readOnly = false,
  onGenerateMemory,
}: OpenCanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [memories, setMemories] = useState<string[]>([]);
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [isLocked, setIsLocked] = useState(readOnly);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize Open Canvas when script is loaded
  const initializeEditor = () => {
    if (!containerRef.current) return;
    // TESTING FALLBACK: Uncomment the next line to simulate OpenCanvas failing to load
    // return fallbackToShim();
    // Destroy existing instance if there is one
    if (canvasRef.current) {
      try {
        canvasRef.current.destroy();
      } catch (e) {
        console.error("Error destroying previous instance:", e);
      }
    }

    try {
      // Check if OpenCanvas is available globally
      if (window.OpenCanvas) {
        // Initialize OpenCanvas with our configuration
        canvasRef.current = new window.OpenCanvas({
          element: containerRef.current,
          initialContent: content,
          theme: isDarkMode ? "dark" : "light",
          readOnly: isLocked,
          onChange: (newContent: string) => {
            setContent(newContent);
          },
          onMemory: (memory: string) => {
            setMemories((prev) => [...prev, memory]);
            if (onGenerateMemory) onGenerateMemory(memory);
          },
          features: {
            versions: true,
            quickActions: true,
            memories: true,
            markdownPreview: true,
          },
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

        // Clear any existing timeout
        if (loadTimeout) clearTimeout(loadTimeout);
      } else {
        // Fall back to our shim immediately
        fallbackToShim();
      }
    } catch (error) {
      console.error("Error initializing editor:", error);
      fallbackToShim();
    }
  };

  // Fallback to shim implementation
  const fallbackToShim = () => {
    console.warn("Falling back to shim implementation");
    if (!containerRef.current) return;

    try {
      canvasRef.current = new OpenCanvasShim({
        element: containerRef.current,
        initialContent: content,
        onChange: (newContent: string) => {
          setContent(newContent);
        },
        onMemory: onGenerateMemory,
        readOnly: isLocked,
      });

      // Apply theme
      canvasRef.current.setTheme(isDarkMode ? "dark" : "light");
      console.warn("Using OpenCanvas shim - limited functionality available");

      // Add initial version
      const initialVersion: ResumeVersion = {
        id: `version-${Date.now()}`,
        content: initialContent,
        timestamp: new Date().toISOString(),
        name: "Initial Version",
      };
      setVersions([initialVersion]);
      setIsLoaded(true);

      toast({
        title: "Limited editing mode",
        description:
          "Enhanced editing features unavailable. Using basic mode instead.",
        variant: "destructive",
      });

      // Clear any existing timeout
      if (loadTimeout) clearTimeout(loadTimeout);
    } catch (error) {
      console.error("Error initializing shim:", error);
      // If even the shim fails, show a more serious error
      toast({
        title: "Editor initialization failed",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      });
    }
  };

  // Setup timeout to fallback if loading takes too long
  useEffect(() => {
    // Set a timeout to fallback to shim if OpenCanvas doesn't load in 5 seconds
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        fallbackToShim();
      }
    }, 5000);

    setLoadTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  // Save current content as a new version
  const saveVersion = () => {
    const newVersion: ResumeVersion = {
      id: `version-${Date.now()}`,
      content: content,
      timestamp: new Date().toISOString(),
    };
    setVersions((prev) => [...prev, newVersion]);
    onSave(content);
  };

  // Apply a quick action to the selected text
  const applyQuickAction = async (action: QuickAction) => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    try {
      // Get selected text or current section
      const selectedText =
        canvasRef.current.getSelectedText() || selectedSection;
      if (!selectedText) {
        alert("Please select some text or a section first");
        setIsProcessing(false);
        return;
      }

      // Call OpenAI API to apply the action
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "quick_action",
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
        // Capture this as a new memory
        const memory = `Applied "${action.name}" to improve your resume.`;
        setMemories((prev) => [...prev, memory]);
        if (onGenerateMemory) onGenerateMemory(memory);
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
  const loadVersion = (version: ResumeVersion) => {
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
    setContent(version.content);
    canvasRef.current.setContent(version.content);
  };

  // Toggle locked state
  const toggleLock = () => {
    setIsLocked(!isLocked);
    if (canvasRef.current) {
      canvasRef.current.setReadOnly(!isLocked);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        try {
          canvasRef.current.destroy();
        } catch (e) {
          console.error("Error destroying instance:", e);
        }
      }
      if (loadTimeout) clearTimeout(loadTimeout);
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

  return (
    <div className="flex flex-col space-y-4">
      {/* OpenCanvas Editor Container */}
      <div className="relative">
        <div
          className={`p-0 min-h-[500px] border rounded-md overflow-hidden ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* Editor container */}
          <div ref={containerRef} className="w-full h-full min-h-[500px]" />
          {/* Loading state or fallback */}
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p>Loading editor...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Action Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMode}
            disabled={!isLoaded}
          >
            {mode === "edit" ? "Preview" : "Edit"}
          </Button>
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
          <Button
            variant="outline"
            size="sm"
            onClick={saveVersion}
            disabled={!isLoaded || isLocked}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Version
          </Button>
        </div>
        {/* Save Button */}
        <Button
          onClick={() => onSave(content)}
          disabled={!isLoaded || isLocked}
        >
          Save Resume
        </Button>
      </div>
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
          <TabsTrigger value="memories">
            <Brain className="h-4 w-4 mr-2" />
            Memories
          </TabsTrigger>
        </TabsList>
        <TabsContent value="actions" className="p-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Resume Improvements</h3>
              <div className="flex flex-wrap gap-2">
                {quickActions
                  .filter((action) => action.category === "resume")
                  .map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyQuickAction(action)}
                      disabled={isProcessing || isLocked}
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      {action.name}
                    </Button>
                  ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">General Improvements</h3>
              <div className="flex flex-wrap gap-2">
                {quickActions
                  .filter((action) => action.category === "general")
                  .map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyQuickAction(action)}
                      disabled={isProcessing || isLocked}
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      {action.name}
                    </Button>
                  ))}
              </div>
            </div>
            {quickActions.some((action) => action.category === "custom") && (
              <div>
                <h3 className="text-sm font-medium mb-2">Custom Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {quickActions
                    .filter((action) => action.category === "custom")
                    .map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => applyQuickAction(action)}
                        disabled={isProcessing || isLocked}
                      >
                        <Lightbulb className="h-4 w-4 mr-1" />
                        {action.name}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="versions" className="p-2">
          <div className="space-y-4">
            {versions.length === 0 ? (
              <p className="text-sm text-gray-500">No versions saved yet.</p>
            ) : (
              <div className="space-y-2">
                {versions.map((version, index) => (
                  <Card
                    key={version.id}
                    className="p-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {version.name || `Version ${versions.length - index}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(version.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadVersion(version)}
                      disabled={isLocked}
                    >
                      Load
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="memories" className="p-2">
          <div className="space-y-2">
            {memories.length === 0 ? (
              <p className="text-sm text-gray-500">
                No memories generated yet.
              </p>
            ) : (
              <div className="space-y-2">
                {memories.map((memory, index) => (
                  <div key={index} className="p-2 border rounded-md">
                    <p className="text-sm">{memory}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      {/* Load Open Canvas script */}
      <Script
        src="https://cdn.jsdelivr.net/gh/langchain-ai/open-canvas@main/dist/index.js"
        onLoad={initializeEditor}
        strategy="afterInteractive"
      />
    </div>
  );
}
