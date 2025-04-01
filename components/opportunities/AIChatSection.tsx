"use client";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
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
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/opportunities/MarkdownRenderer";
import { Opportunity } from "@/context/types";

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
}

export const AIChatSection = ({
  opportunity,
  chatMessages = [],
  onAddMessage,
  isDarkMode,
  resume = "",
}: AIChatSectionProps) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "How do my skills match this job description?",
    "What should I highlight in my application?",
    "Help me prepare for an interview for this position",
    "What questions should I ask the interviewer?",
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Create a context message that contains all the job and resume information
  const createContextMessage = () => {
    if (!opportunity) return null;

    let contextText = `## Job Information\n`;
    contextText += `Company: ${opportunity.company || "Unknown"}\n`;
    contextText += `Position: ${opportunity.position || "Unknown"}\n`;

    if (opportunity.location) {
      contextText += `Location: ${opportunity.location}\n`;
    }

    if (opportunity.salary) {
      contextText += `Salary: ${opportunity.salary}\n`;
    }

    if (opportunity.status) {
      contextText += `Current Status: ${opportunity.status}\n`;
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
  };

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
            resume: resume,
          }
        : null,
    },
    onFinish: (message) => {
      // Notify parent component if needed
      if (onAddMessage && opportunity) {
        onAddMessage(opportunity.id, message.content, "assistant");
      }
    },
  });

  // Filter out system messages for display
  const displayMessages = messages.filter((msg) => msg.role !== "system");

  // Load AI suggestions when the opportunity changes
  useEffect(() => {
    if (!opportunity) return;
    setSuggestions([
      "How do my skills match this job description?",
      "What should I highlight in my application?",
      "Help me prepare for an interview for this position",
      "What questions should I ask the interviewer?",
    ]);
  }, [opportunity, resume]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  // Check scroll position to show/hide scroll to bottom button
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    const scrollArea = scrollAreaRef.current;
    // Access native DOM methods
    const element = scrollArea as unknown as HTMLDivElement;
    if (!element) return;
    const scrollTop = element.scrollTop || 0;
    const scrollHeight = element.scrollHeight || 0;
    const clientHeight = element.clientHeight || 0;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle sending a message with a suggestion
  const handleSendSuggestion = (text: string) => {
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
  };

  // Calculate a consistent avatar color based on a string
  const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 40%)`;
  };

  // Format the timestamp
  const formatTime = (timestamp: number | undefined) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // This function checks if the message contains markdown formatting
  const hasMarkdown = (text: string): boolean => {
    // Check for common markdown patterns
    return (
      text.includes("# ") || // headings
      text.includes("**") || // bold
      text.includes("- ") || // lists
      /\d+\.\s/.test(text) || // numbered lists
      text.includes("```") // code blocks
    );
  };

  return (
    <Card
      className={`flex-grow flex flex-col overflow-hidden ${
        isDarkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-gradient-to-br from-white to-gray-50"
      }`}
    >
      <CardHeader className="py-3 space-y-1">
        <div className="flex items-center">
          <Avatar
            className={`h-8 w-8 mr-2 bg-blue-600 ${
              isDarkMode ? "text-white" : ""
            }`}
          >
            <AvatarFallback>AI</AvatarFallback>
            <AvatarImage src="/assistant-avatar.png" alt="AI Assistant" />
          </Avatar>
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
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col p-0">
        <ScrollArea
          className="flex-grow px-4 pt-2 h-full"
          ref={scrollAreaRef as any}
          onScroll={handleScroll}
        >
          {displayMessages.length > 0 ? (
            <div className="pb-4">
              <AnimatePresence>
                {displayMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`mb-4 flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role !== "user" && (
                      <Avatar className="h-8 w-8 mr-2 bg-blue-600 self-end mb-auto mt-0">
                        <AvatarFallback>AI</AvatarFallback>
                        <AvatarImage
                          src="/assistant-avatar.png"
                          alt="AI Assistant"
                        />
                      </Avatar>
                    )}
                    <div
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
                    </div>
                    {msg.role === "user" && (
                      <Avatar
                        className={`h-8 w-8 ml-2 self-end mb-auto mt-0`}
                        style={{ backgroundColor: getAvatarColor("user") }}
                      >
                        <AvatarFallback>You</AvatarFallback>
                        <AvatarImage src="/user-avatar.png" alt="You" />
                      </Avatar>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex mb-4 justify-start"
                  >
                    <Avatar className="h-8 w-8 mr-2 bg-blue-600 self-end mb-auto mt-0">
                      <AvatarFallback>AI</AvatarFallback>
                      <AvatarImage
                        src="/assistant-avatar.png"
                        alt="AI Assistant"
                      />
                    </Avatar>
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "200ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "400ms" }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div
                className={`p-4 rounded-full ${
                  isDarkMode ? "bg-gray-700" : "bg-blue-50"
                } mb-4`}
              >
                <MessageSquare
                  className={`h-10 w-10 ${
                    isDarkMode ? "text-blue-400" : "text-blue-500"
                  }`}
                />
              </div>
              <h3
                className={`text-lg font-medium ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Ask the AI Assistant
              </h3>
              <p
                className={`max-w-md mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {opportunity
                  ? `Get help with your application for ${opportunity.position} at ${opportunity.company}`
                  : "Get help with your job application, resume, or interview preparation"}
              </p>
              <div className="w-full max-w-md mt-8">
                <h4
                  className={`font-medium mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Sparkles className="h-4 w-4 inline mr-2 text-blue-500" />
                  Suggested questions:
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {isLoadingPrompts ? (
                    // Loading placeholders
                    Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className={`h-12 ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-100"
                          } animate-pulse rounded-xl`}
                        />
                      ))
                  ) : suggestions && suggestions.length > 0 ? (
                    suggestions.map((prompt, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Button
                          variant={isDarkMode ? "outline" : "secondary"}
                          className={`justify-start text-left h-auto py-3 px-4 w-full rounded-xl ${
                            isDarkMode
                              ? "hover:bg-gray-700 border-gray-600 text-gray-200"
                              : ""
                          }`}
                          onClick={() => {
                            const promptText = prompt;
                            setInput(promptText);
                            setTimeout(() => {
                              handleSendSuggestion(promptText);
                            }, 100);
                          }}
                        >
                          <span>{prompt}</span>
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      } p-4 text-center`}
                    >
                      No suggestions available for this job.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
        {/* Show scroll to bottom button when needed */}
        {showScrollButton && (
          <div className="absolute bottom-20 right-4">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full h-10 w-10 p-0 shadow-md"
              onClick={scrollToBottom}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        )}
        {/* Add prompt suggestion section for when there are already messages */}
        {displayMessages.length > 0 &&
          suggestions &&
          suggestions.length > 0 && (
            <div
              className={`px-4 py-2 ${
                isDarkMode ? "border-t border-gray-700" : "border-t"
              }`}
            >
              <Collapsible>
                <CollapsibleTrigger
                  className={`flex items-center text-sm ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  <ChevronRight className="h-4 w-4 mr-1" />
                  <span>Suggestions ({suggestions.length})</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 pb-1">
                  <ScrollArea className="max-h-40">
                    <div className="flex flex-wrap gap-2 pb-2">
                      {suggestions.map((prompt, index) => (
                        <Button
                          key={index}
                          variant={isDarkMode ? "outline" : "secondary"}
                          size="sm"
                          className={`text-left h-auto py-2 px-3 ${
                            isDarkMode
                              ? "hover:bg-gray-700 border-gray-600 text-gray-200"
                              : ""
                          } whitespace-nowrap rounded-full`}
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
              className={`flex-grow resize-none ${
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
            <Button
              type="submit"
              className={`self-end ${
                isDarkMode ? "bg-blue-600 hover:bg-blue-700" : ""
              }`}
              disabled={input.trim() === "" || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="mt-2 text-xs text-center text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
