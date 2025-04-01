import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; // Adjust import path as needed
import { Button } from "@/components/ui/button"; // Adjust import path as needed
import { Textarea } from "@/components/ui/textarea"; // Adjust import path as needed
import {
  User,
  Bot,
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
} from "@/components/ui/collapsible"; // Adjust import path as needed
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Adjust import path as needed
import { ScrollArea } from "@/components/ui/scroll-area"; // Adjust import path as needed
import { Badge } from "@/components/ui/badge"; // Adjust import path as needed

interface AIChatSectionProps {
  chatMessages: { message: string; sender: string; timestamp: string }[];
  opportunity:
    | {
        id: string | number;
        company: string;
        position: string;
        status: string;
        jobDescription: string;
        notes?: string;
        resume?: string;
      }
    | undefined;
  onAddMessage: (
    opportunityId: string | number,
    message: string,
    sender: string
  ) => void;
  isDarkMode: boolean;
  resume?: string;
}

export const AIChatSection = ({
  chatMessages,
  opportunity,
  onAddMessage,
  isDarkMode,
  resume = "",
}: AIChatSectionProps) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
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

  // Load AI suggestions when the opportunity changes
  useEffect(() => {
    if (!opportunity) return;

    setSuggestions([
      "How do my skills match this job description?",
      "What should I highlight in my application?",
      "Help me prepare for an interview for this position",
      "What questions should I ask the interviewer?",
    ]);

    // You can uncomment this code when your API is ready for suggestions
    /*
    setSuggestions([]);
    setIsLoadingPrompts(true);
    
    const loadSuggestions = async () => {
      try {
        const response = await fetch("/api/openai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "suggestions",
            resume: resume,
            jobDescription: opportunity.jobDescription || "",
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Set the suggestions
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Error loading AI suggestions:", error);
        // Default suggestions if API fails
        setSuggestions([
          "How do my skills match this job description?",
          "What should I highlight in my application?",
          "Help me prepare for an interview for this position",
          "What questions should I ask the interviewer?",
        ]);
      } finally {
        setIsLoadingPrompts(false);
      }
    };
    
    loadSuggestions();
    */
  }, [opportunity, resume]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

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

  // Handle sending a message - simplified to work with parent component
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !opportunity) return;

    // Pass the message to the parent component
    onAddMessage(opportunity.id, currentMessage, "user");

    // Clear input field
    setCurrentMessage("");
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
              Ask about the job, get resume advice, or prepare for interviews
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
          {chatMessages.length > 0 ? (
            <div className="pb-4">
              <AnimatePresence>
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`mb-4 flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender !== "user" && (
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
                        msg.sender === "user"
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {msg.message}
                      </div>
                      <div
                        className={`text-right mt-1 ${
                          msg.sender === "user"
                            ? "text-blue-100"
                            : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        <span className="text-xs opacity-75">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    {msg.sender === "user" && (
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
                {isTyping && (
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
                Get help with your job application, resume, or interview
                preparation
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
                            setCurrentMessage(prompt);
                            setTimeout(() => handleSendMessage(), 100);
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
        {chatMessages.length > 0 && suggestions && suggestions.length > 0 && (
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
                          setCurrentMessage(prompt);
                          setTimeout(() => handleSendMessage(), 100);
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
          <div className="flex space-x-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your question..."
              className={`flex-grow resize-none ${
                isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : ""
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              className={`self-end ${
                isDarkMode ? "bg-blue-600 hover:bg-blue-700" : ""
              }`}
              onClick={handleSendMessage}
              disabled={currentMessage.trim() === "" || isSendingMessage}
            >
              {isSendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-2 text-xs text-center text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
