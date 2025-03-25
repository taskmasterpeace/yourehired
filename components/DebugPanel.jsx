"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DebugPanel = ({
  showDebugPanel,
  setShowDebugPanel,
  isDarkMode,
  selectedOpportunityIndex,
  activeTab,
  opportunities,
  events,
  selectedOpportunity,
  jobRecommendations,
  currentRecommendationIndex,
  ratedRecommendations,
}) => {
  if (!showDebugPanel) return null;

  return (
    <div
      className={`fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 z-50 ${
        isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
      } border-t border-l ${
        isDarkMode ? "border-gray-700" : "border-gray-300"
      } shadow-lg`}
    >
      <div
        className={`flex justify-between items-center p-2 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        <h3 className="font-medium">Debug Panel</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setShowDebugPanel(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>
      <div className="p-2 max-h-[50vh] overflow-auto">
        <Tabs defaultValue="state">
          <TabsList className="mb-2">
            <TabsTrigger value="state">State</TabsTrigger>
            <TabsTrigger value="props">Props</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          <TabsContent value="state">
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium">
                  Selected Opportunity Index
                </h4>
                <pre
                  className={`text-xs p-1 rounded ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  {selectedOpportunityIndex}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium">Active Tab</h4>
                <pre
                  className={`text-xs p-1 rounded ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  {activeTab}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium">Opportunities Count</h4>
                <pre
                  className={`text-xs p-1 rounded ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  {opportunities.length}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium">Events Count</h4>
                <pre
                  className={`text-xs p-1 rounded ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  {events.length}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium">Selected Opportunity</h4>
                <pre
                  className={`text-xs p-1 rounded ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  } overflow-auto max-h-40`}
                >
                  {JSON.stringify(selectedOpportunity, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium">Job Recommendations</h4>
                <pre
                  className={`text-xs p-1 rounded ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  } overflow-auto max-h-40`}
                >
                  {JSON.stringify(
                    {
                      total: jobRecommendations.length,
                      current: currentRecommendationIndex,
                      rated: ratedRecommendations.length,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium">Storage Mode</h4>
                <pre
                  className={`text-xs p-1 rounded ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  Supabase Cloud Storage
                </pre>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="props">
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium">Component Props</h4>
                <p className="text-xs text-gray-500">
                  No props available for root component
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="performance">
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium">Render Count</h4>
                <p className="text-xs">
                  Component render metrics would appear here
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Database Usage</h4>
                <pre
                  className={`text-xs p-1 rounded ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  {`Opportunities: ${opportunities.length}, Events: ${events.length}`}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium">Actions</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log("Current state:", {
                        opportunities,
                        events,
                        selectedOpportunity,
                        activeTab,
                      });
                      alert("State logged to console");
                    }}
                  >
                    Log State
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DebugPanel;
