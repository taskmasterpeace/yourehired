import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Bot, MessageSquare, Send, ChevronRight, Sparkles } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion } from "framer-motion";

interface AIChatSectionProps {
  chatMessages: { message: string; sender: string; timestamp: string }[];
  handleSendMessage: () => void;
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  aiPrompts: string[];
  isLoadingPrompts: boolean;
  isDarkMode: boolean;
}

export const AIChatSection = ({
  chatMessages,
  handleSendMessage,
  currentMessage,
  setCurrentMessage,
  aiPrompts,
  isLoadingPrompts,
  isDarkMode
}: AIChatSectionProps) => {
  return (
    <Card className="flex-grow flex flex-col overflow-hidden">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">Chat with AI Assistant</CardTitle>
        <CardDescription>
          Ask questions about the job, get resume advice, or prepare for interviews
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col p-0">
        <div className="flex-grow overflow-y-auto p-4">
          {chatMessages.length > 0 ? (
            <>
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[90%] sm:max-w-[80%] rounded-lg p-3 ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {msg.sender === 'user' ? (
                        <>
                          <span className="text-xs opacity-75">You</span>
                          <User className="h-3 w-3 ml-1 opacity-75" />
                        </>
                      ) : (
                        <>
                          <Bot className="h-3 w-3 mr-1 opacity-75" />
                          <span className="text-xs opacity-75">AI Assistant</span>
                        </>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <div className="text-right">
                      <span className="text-xs opacity-75">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
              <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
              <p className="text-gray-500 max-w-md mt-1">
                Start a conversation with the AI assistant to get help with your job application
              </p>
              
              {/* Section for suggested prompts */}
              <div className="w-full max-w-md mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Suggested prompts for this stage:</h4>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {isLoadingPrompts ? (
                    // Loading placeholders
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
                    ))
                  ) : (
                    aiPrompts && aiPrompts.length > 0 ? (
                      aiPrompts.map((prompt, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Button
                            variant="outline"
                            className="justify-start text-left h-auto py-3 w-full"
                            onClick={() => {
                              setCurrentMessage(prompt);
                              setTimeout(() => handleSendMessage(), 100);
                            }}
                          >
                            <Sparkles className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                            <span>{prompt}</span>
                          </Button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 p-4">No suggestions available for this status.</div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Add prompt suggestion section for when there are already messages */}
        {chatMessages.length > 0 && (
          <div className="px-4 mb-4">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                <ChevronRight className="h-4 w-4 mr-1" />
                <span>Show suggested prompts {aiPrompts?.length > 0 ? `(${aiPrompts.length})` : ''}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="grid grid-cols-1 gap-2">
                  {isLoadingPrompts ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
                    ))
                  ) : (
                    aiPrompts && aiPrompts.length > 0 ? (
                      aiPrompts.map((prompt, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start text-left h-auto py-2 w-full text-sm"
                            onClick={() => {
                              setCurrentMessage(prompt);
                              setTimeout(() => handleSendMessage(), 100);
                            }}
                          >
                            <Sparkles className="h-3 w-3 mr-2 text-blue-500 flex-shrink-0" />
                            <span>{prompt}</span>
                          </Button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 p-2">No suggestions available for this status.</div>
                    )
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
        
        <div className="p-4 border-t">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              className="self-end"
              onClick={handleSendMessage}
              disabled={currentMessage.trim() === ""}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
