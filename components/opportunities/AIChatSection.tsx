"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Send,
  ChevronRight,
  Sparkles,
  ArrowUp,
  Loader2,
  ChevronDown,
  Clock,
  BarChart,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/opportunities/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Opportunity } from "@/context/types";
import { useAppState } from "@/context/context";
import { useAuth } from "@/context/auth-context";

interface AIChatSectionProps {
  opportunity?: Opportunity;
  chatMessages?: { message: string; sender: string; timestamp: string }[];
  onAddMessage?: (
    opportunityId: string | number,
    message: string,
    sender: string
  ) => void;
  isDarkMode: boolean;
  resume?: string;
  assistantAvatar?: string | null;
}

// Helper function to get status phase
const getStatusPhase = (status: string): string => {
  // Make sure we're comparing uppercase status values
  const statusUpper = status.toUpperCase();

  const phases = {
    "Initial Contact": [
      "BOOKMARKED",
      "INTERESTED",
      "RECRUITER_CONTACT",
      "NETWORKING",
    ],
    Application: [
      "PREPARING_APPLICATION",
      "APPLIED",
      "APPLICATION_ACKNOWLEDGED",
    ],
    "Interview Process": [
      "SCREENING",
      "TECHNICAL_ASSESSMENT",
      "FIRST_INTERVIEW",
      "SECOND_INTERVIEW",
      "FINAL_INTERVIEW",
      "REFERENCE_CHECK",
    ],
    Decision: [
      "NEGOTIATING",
      "OFFER_RECEIVED",
      "OFFER_ACCEPTED",
      "OFFER_DECLINED",
      "REJECTED",
      "WITHDRAWN",
      "POSITION_FILLED",
      "POSITION_CANCELLED",
    ],
    "Follow-up": ["FOLLOWING_UP", "WAITING"],
  };

  for (const [phase, statuses] of Object.entries(phases)) {
    if (statuses.includes(statusUpper)) {
      return phase;
    }
  }
  return "Unknown";
};

// Helper function to format status for display
const formatStatus = (status: string): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Get status color based on phase
const getStatusColor = (status: string, isDarkMode: boolean): string => {
  const phase = getStatusPhase(status);

  if (phase === "Initial Contact") {
    return isDarkMode
      ? "bg-blue-900 text-blue-100"
      : "bg-blue-100 text-blue-800";
  } else if (phase === "Application") {
    return isDarkMode
      ? "bg-purple-900 text-purple-100"
      : "bg-purple-100 text-purple-800";
  } else if (phase === "Interview Process") {
    return isDarkMode
      ? "bg-amber-900 text-amber-100"
      : "bg-amber-100 text-amber-800";
  } else if (phase === "Decision") {
    return isDarkMode
      ? "bg-green-900 text-green-100"
      : "bg-green-100 text-green-800";
  } else if (phase === "Follow-up") {
    return isDarkMode
      ? "bg-gray-800 text-gray-100"
      : "bg-gray-200 text-gray-800";
  }

  return isDarkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-800";
};

export const AIChatSection = ({
  opportunity,
  chatMessages = [],
  onAddMessage,
  isDarkMode,
  resume = "",
  assistantAvatar = "",
}: AIChatSectionProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [showContinueIndicator, setShowContinueIndicator] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "How do my skills match this job description?",
    "What should I highlight in my application?",
    "Help me prepare for an interview for this position",
    "What questions should I ask the interviewer?",
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { state, dispatch, loading: stateLoading } = useAppState();
  const { masterResume } = state;
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  // Calculate days since opportunity was created
  const daysSince = opportunity?.appliedDate
    ? Math.floor(
        (Date.now() - new Date(opportunity.appliedDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  // Create a context message that contains all the job and resume information
  const createContextMessage = useCallback(() => {
    if (!opportunity) return null;
    let contextText = `## Job Information\n`;
    contextText += `Company: ${opportunity.company || "Unknown"}\n`;
    contextText += `Position: ${opportunity.position || "Unknown"}\n`;
    contextText += `Status: ${opportunity.status || "INTERESTED"}\n`;
    contextText += `Days Since Created: ${daysSince}\n`;

    if (opportunity.location) {
      contextText += `Location: ${opportunity.location}\n`;
    }
    if (opportunity.salary) {
      contextText += `Salary: ${opportunity.salary}\n`;
    }

    contextText += `\n## Job Description\n${
      opportunity.jobDescription || "No job description provided."
    }\n`;

    if (opportunity.keywords && opportunity.keywords.length > 0) {
      contextText += `\n## Keywords\n${opportunity.keywords.join(", ")}\n`;
    }

    if (opportunity.notes) {
      contextText += `\n## Notes\n${opportunity.notes}\n`;
    }

    if (resume) {
      contextText += `\n## My Resume\n${resume}\n`;
    }

    return {
      id: "context",
      role: "system" as const,
      content: contextText,
    };
  }, [opportunity, resume, daysSince]);

  // Get the context message
  const contextMessage = createContextMessage();

  // Initialize messages with context if available
  const initialMessages = contextMessage
    ? [
        contextMessage,
        ...chatMessages.map((msg) => ({
          id: msg.timestamp,
          content: msg.message,
          role: msg.sender as "user" | "assistant",
        })),
      ]
    : chatMessages.map((msg) => ({
        id: msg.timestamp,
        content: msg.message,
        role: msg.sender as "user" | "assistant",
      }));

  // Use the AI SDK's useChat hook for streaming
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    setInput,
  } = useChat({
    api: "/api/openai-chat",
    initialMessages: initialMessages,
    body: {
      // Include the opportunity data in the API request body for context
      opportunityContext: opportunity
        ? {
            id: opportunity.id,
            company: opportunity.company,
            position: opportunity.position,
            jobDescription: opportunity.jobDescription,
            status: opportunity.status,
            createdAt: opportunity.appliedDate,
            resume: resume,
            masterResume: masterResume,
          }
        : null,
    },
    onFinish: (message) => {
      // Notify parent component if needed
      if (onAddMessage && opportunity) {
        onAddMessage(opportunity.id, message.content, "assistant");
      }
      // Clear the input field
      setInput("");
      // Smooth scroll to bottom with a slight delay for better UX
      setTimeout(scrollToBottom, 100);
      // Check if we need to show the continue indicator
      setTimeout(checkContinueIndicator, 300);
    },
  });

  // Filter out system messages for display
  const displayMessages = messages.filter((msg) => msg.role !== "system");

  // Load AI suggestions when the opportunity changes
  useEffect(() => {
    if (!opportunity) return;

    setIsLoadingPrompts(true);

    fetch("/api/openai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: {
          action: "suggestions",
          opportunityContext: {
            status: opportunity.status,
            position: opportunity.position,
            company: opportunity.company,
          },
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }
        setIsLoadingPrompts(false);
      })
      .catch((err) => {
        console.error("Failed to load suggestions:", err);
        setIsLoadingPrompts(false);
        // Fallback suggestions
        setSuggestions([
          "How do my skills match this job description?",
          "What should I highlight in my application?",
          "Help me prepare for an interview for this position",
          "What questions should I ask the interviewer?",
        ]);
      });
  }, [opportunity]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isLoading) {
      // If loading, keep scrolling to bottom to see typing indicator
      scrollToBottom();
    } else if (displayMessages.length > 0) {
      // If not loading and we have messages, scroll to bottom with a delay
      setTimeout(scrollToBottom, 100);
      // Check if there's more content to see
      setTimeout(checkContinueIndicator, 300);
    }
  }, [displayMessages.length, isLoading]);

  // Improved scroll to bottom function with smoother animation
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);

  // Check if there's more content below the viewport with improved logic
  const checkContinueIndicator = useCallback(() => {
    if (!scrollAreaRef.current) return;
    const scrollArea = scrollAreaRef.current as unknown as HTMLDivElement;
    if (!scrollArea) return;
    const scrollTop = scrollArea.scrollTop || 0;
    const scrollHeight = scrollArea.scrollHeight || 0;
    const clientHeight = scrollArea.clientHeight || 0;

    // More sophisticated check:
    // 1. Must have significant content (200px+)
    // 2. Must not be near the bottom (150px threshold)
    // 3. Must have scrolled at least a little bit
    setShowContinueIndicator(
      scrollHeight > clientHeight + 200 &&
        scrollHeight - scrollTop - clientHeight > 150 &&
        scrollTop > 50
    );
  }, []);

  // Handle scroll events in the main scroll area with improved detection
  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current) return;
    const scrollArea = scrollAreaRef.current;
    // Access native DOM methods
    const element = scrollArea as unknown as HTMLDivElement;
    if (!element) return;
    const scrollTop = element.scrollTop || 0;
    const scrollHeight = element.scrollHeight || 0;
    const clientHeight = element.clientHeight || 0;

    // More forgiving threshold (150px) for better UX
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

    // Update both scroll button and continue indicator
    setShowScrollButton(!isNearBottom);
    setShowContinueIndicator(
      !isNearBottom && scrollHeight > clientHeight + 200 && scrollTop > 50
    );
  }, []);

  // Scroll down to show more content with improved animation
  const showMoreContent = useCallback(() => {
    if (!scrollAreaRef.current) return;
    const scrollArea = scrollAreaRef.current as unknown as HTMLDivElement;

    // Calculate a more natural scroll amount based on content and viewport
    const scrollTop = scrollArea.scrollTop || 0;
    const scrollHeight = scrollArea.scrollHeight || 0;
    const clientHeight = scrollArea.clientHeight || 0;

    // Either scroll 80% of viewport or to 80% of the way to the bottom, whichever is less
    const remainingScroll = scrollHeight - scrollTop - clientHeight;
    const viewportScroll = Math.floor(clientHeight * 0.8);
    const scrollAmount = Math.min(viewportScroll, remainingScroll * 0.8);

    // Use a spring-like easing for more natural feel
    scrollArea.scrollBy({
      top: scrollAmount,
      behavior: "smooth",
    });

    // After scrolling, check if we need to hide the indicator with a longer delay
    setTimeout(checkContinueIndicator, 600);
  }, [checkContinueIndicator]);

  // Handle sending a message with a suggestion
  const handleSendSuggestion = useCallback(
    (text: string) => {
      if (!text.trim() || !opportunity) return;

      // Use the append method from useChat
      append({
        content: text,
        role: "user",
      });

      // Also notify parent component if needed
      if (onAddMessage && opportunity) {
        onAddMessage(opportunity.id, text, "user");
      }

      // Clear the input field
      setInput("");

      // Close the collapsible after selecting a suggestion
      setIsCollapsibleOpen(false);
    },
    [append, onAddMessage, opportunity, setInput]
  );

  // Calculate a consistent avatar color based on a string
  const getAvatarColor = useCallback((str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 40%)`;
  }, []);

  // Format the timestamp
  const formatTime = useCallback((timestamp: number | undefined) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // This function checks if the message contains markdown formatting
  const hasMarkdown = useCallback((text: string): boolean => {
    // Check for common markdown patterns
    return (
      text.includes("# ") || // headings
      text.includes("**") || // bold
      text.includes("- ") || // lists
      /\d+\.\s/.test(text) || // numbered lists
      text.includes("```") // code blocks
    );
  }, []);

  // Set up scroll event listener
  useEffect(() => {
    const scrollArea = scrollAreaRef.current as unknown as HTMLDivElement;
    if (scrollArea) {
      scrollArea.addEventListener("scroll", handleScroll);
      return () => {
        scrollArea.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  // Set initial focus to textarea for better UX
  useEffect(() => {
    const textarea = document.querySelector("textarea");
    if (textarea && displayMessages.length === 0) {
      setTimeout(() => textarea.focus(), 300);
    }
  }, [displayMessages.length]);

  return (
    <Card
      className={`flex-grow flex flex-col overflow-hidden transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-gradient-to-br from-white to-gray-50"
      }`}
    >
      <CardHeader className="py-3 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar
                className={`h-10 w-10 mr-2 bg-blue-600 ${
                  isDarkMode ? "text-white" : ""
                }`}
              >
                <AvatarFallback>AI</AvatarFallback>
                {assistantAvatar && (
                  <AvatarImage
                    src={assistantAvatar}
                    alt="AI Assistant"
                    className="object-cover"
                    onError={(e) => {
                      console.error("Failed to load assistant avatar:", e);
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                )}
              </Avatar>
            </motion.div>
            <div>
              <CardTitle className="text-base font-medium">
                AI Career Assistant
              </CardTitle>
              <CardDescription className="text-xs">
                Ask about{" "}
                {opportunity
                  ? `${opportunity.position} at ${opportunity.company}`
                  : "the job"}
                , get resume advice, or prepare for interviews
              </CardDescription>
            </div>
          </div>

          {/* Job status indicator */}
          {opportunity?.status && (
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={`${getStatusColor(
                          opportunity.status,
                          isDarkMode
                        )} px-2 py-1`}
                      >
                        {formatStatus(opportunity.status)}
                      </Badge>

                      {daysSince > 0 && (
                        <Badge
                          variant="outline"
                          className={
                            isDarkMode ? "border-gray-600" : "border-gray-300"
                          }
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {daysSince} {daysSince === 1 ? "day" : "days"}
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-medium mb-1">
                        Application Phase: {getStatusPhase(opportunity.status)}
                      </p>
                      <p className="text-xs">
                        Created {daysSince} {daysSince === 1 ? "day" : "days"}{" "}
                        ago
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col p-0 relative">
        <ScrollArea
          className="flex-grow px-4 pt-2 h-full"
          ref={scrollAreaRef as any}
          style={{
            transition: "all 0.2s ease-out",
            willChange: "contents",
          }}
        >
          {displayMessages.length > 0 ? (
            <div className="pb-4">
              <AnimatePresence mode="popLayout">
                {displayMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, height: "auto" }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.25, 0.1, 0.25, 1.0],
                      height: { duration: 0.3 },
                    }}
                    className={`mb-4 flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role !== "user" && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        <Avatar className="h-10 w-10 mr-2 bg-blue-600 self-end mb-auto mt-0">
                          <AvatarFallback>AI</AvatarFallback>
                          {assistantAvatar && (
                            <AvatarImage
                              src={assistantAvatar}
                              alt="AI Assistant"
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          )}
                        </Avatar>
                      </motion.div>
                    )}
                    <motion.div
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        layout: { type: "spring", stiffness: 200, damping: 20 },
                        opacity: { duration: 0.2 },
                      }}
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        msg.role === "user"
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="text-sm">
                        {msg.role === "assistant" &&
                        hasMarkdown(msg.content) ? (
                          <MarkdownRenderer
                            content={msg.content}
                            isDarkMode={isDarkMode}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {msg.content}
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-right mt-1 ${
                          msg.role === "user"
                            ? "text-blue-100"
                            : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        <span className="text-xs opacity-75">
                          {formatTime(
                            msg.createdAt
                              ? new Date(msg.createdAt).getTime()
                              : undefined
                          )}
                        </span>
                      </div>
                    </motion.div>
                    {msg.role === "user" && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        <Avatar
                          className={`h-10 w-10 ml-2 self-end mb-auto mt-0`}
                          style={{ backgroundColor: getAvatarColor("user") }}
                        >
                          <AvatarFallback>You</AvatarFallback>
                          {user && user.user_metadata?.avatar_url && (
                            <AvatarImage
                              src={user.user_metadata.avatar_url}
                              alt="You"
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          )}
                        </Avatar>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
                {/* Only show the loading indicator if we're not showing previous messages */}
                {isLoading &&
                  displayMessages.length > 0 &&
                  displayMessages[displayMessages.length - 1].role !==
                    "assistant" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex mb-4 justify-start"
                      style={{ minHeight: "60px" }} // Add fixed minimum height
                    >
                      <Avatar className="h-10 w-10 mr-2 bg-blue-600 self-end mb-auto mt-0">
                        <AvatarFallback>AI</AvatarFallback>
                        {assistantAvatar && (
                          <AvatarImage
                            src={assistantAvatar}
                            alt="AI Assistant"
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        )}
                      </Avatar>
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-100"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <motion.div
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 1.2,
                            repeatType: "reverse",
                            ease: "easeInOut",
                          }}
                        >
                          <div className="text-sm text-gray-400">
                            Generating response
                          </div>
                          <div className="flex space-x-1">
                            <motion.div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{
                                y: [0, -6, 0],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                                delay: 0,
                              }}
                            ></motion.div>
                            <motion.div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{
                                y: [0, -6, 0],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                                delay: 0.2,
                              }}
                            ></motion.div>
                            <motion.div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{
                                y: [0, -6, 0],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                                delay: 0.4,
                              }}
                            ></motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
              <div ref={messagesEndRef} className="h-4" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col items-center justify-center text-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                  type: "spring",
                  stiffness: 100,
                }}
                className={`p-4 rounded-full ${
                  isDarkMode ? "bg-gray-700" : "bg-blue-50"
                } mb-4`}
              >
                <MessageSquare
                  className={`h-10 w-10 ${
                    isDarkMode ? "text-blue-400" : "text-blue-500"
                  }`}
                />
              </motion.div>
              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className={`text-lg font-medium ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Ask the AI Assistant
              </motion.h3>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className={`max-w-md mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {opportunity ? (
                  opportunity.status ? (
                    <span>
                      Get personalized help with your{" "}
                      {formatStatus(opportunity.status)} phase for{" "}
                      {opportunity.position} at {opportunity.company}
                    </span>
                  ) : (
                    `Get help with your application for ${opportunity.position} at ${opportunity.company}`
                  )
                ) : (
                  "Get help with your job application, resume, or interview preparation"
                )}
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="w-full max-w-md mt-8"
              >
                <h4
                  className={`font-medium mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Sparkles className="h-4 w-4 inline mr-2 text-blue-500" />
                  Suggested questions:
                </h4>
                {isLoadingPrompts ? (
                  // Loading placeholders in a 2x2 grid
                  <div className="grid grid-cols-2 gap-3">
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className={`h-12 ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-100"
                          } animate-pulse rounded-xl`}
                        />
                      ))}
                  </div>
                ) : suggestions && suggestions.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {suggestions.map((prompt, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.1 + 0.6,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button
                          variant={isDarkMode ? "outline" : "secondary"}
                          className={`justify-start text-left h-auto py-3 px-4 w-full rounded-xl ${
                            isDarkMode
                              ? "hover:bg-gray-700 border-gray-600 text-gray-200"
                              : ""
                          } whitespace-normal transition-all duration-200`}
                          onClick={() => {
                            const promptText = prompt;
                            setInput(promptText);
                            setTimeout(() => {
                              handleSendSuggestion(promptText);
                            }, 100);
                          }}
                        >
                          <span className="text-xs sm:text-sm">{prompt}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } p-4 text-center`}
                  >
                    No suggestions available for this job.
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </ScrollArea>
        {/* Continue reading indicator at the bottom center of chat area */}
        <AnimatePresence>
          {showContinueIndicator && displayMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10"
            >
              <motion.button
                onClick={showMoreContent}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-1 rounded-full py-2 px-4 shadow-lg ${
                  isDarkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } transition-colors duration-200`}
              >
                <span className="text-xs font-medium">Continue reading</span>
                <ChevronDown size={14} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Show scroll to bottom button when needed */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 right-4 z-10"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  variant={isDarkMode ? "default" : "secondary"}
                  className="rounded-full h-12 w-12 p-0 shadow-lg"
                  onClick={scrollToBottom}
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Add prompt suggestion section for when there are already messages */}
        {displayMessages.length > 0 &&
          suggestions &&
          suggestions.length > 0 && (
            <div
              className={`px-4 py-2 ${
                isDarkMode ? "border-t border-gray-700" : "border-t"
              }`}
            >
              <Collapsible
                open={isCollapsibleOpen}
                onOpenChange={setIsCollapsibleOpen}
              >
                <CollapsibleTrigger
                  className={`flex items-center text-sm ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-800"
                  } transition-colors duration-200`}
                >
                  <motion.div
                    animate={{
                      rotate: isCollapsibleOpen ? 90 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4 mr-1" />
                  </motion.div>
                  <span>Suggestions ({suggestions.length})</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 pb-1">
                  <ScrollArea className="max-h-40">
                    <div className="flex flex-wrap gap-2 pb-2">
                      {suggestions.map((prompt, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.2,
                            delay: index * 0.05,
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            variant={isDarkMode ? "outline" : "secondary"}
                            size="sm"
                            className={`text-left h-auto py-2 px-3 ${
                              isDarkMode
                                ? "hover:bg-gray-700 border-gray-600 text-gray-200"
                                : ""
                            } whitespace-normal transition-all duration-200`}
                            onClick={() => {
                              const promptText = prompt;
                              setInput(promptText);
                              setTimeout(() => {
                                handleSendSuggestion(promptText);
                              }, 100);
                            }}
                          >
                            {prompt}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        <div
          className={`p-4 ${
            isDarkMode ? "border-t border-gray-700" : "border-t"
          }`}
        >
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your question..."
              className={`flex-grow resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : ""
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                  // Also notify parent component if needed
                  if (onAddMessage && opportunity && input.trim()) {
                    onAddMessage(opportunity.id, input, "user");
                  }
                }
              }}
              disabled={isLoading}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className={`self-end ${
                  isDarkMode ? "bg-blue-600 hover:bg-blue-700" : ""
                } transition-all duration-200`}
                disabled={input.trim() === "" || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          </form>
          <div className="mt-2 text-xs text-center text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
