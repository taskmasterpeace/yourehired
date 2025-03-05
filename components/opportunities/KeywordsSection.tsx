import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Opportunity } from '@/context/types';
import { RefreshCw, Check, X } from 'lucide-react';

interface KeywordsSectionProps {
  opportunity: Opportunity;
  updateOpportunity: (id: number, updates: Partial<Opportunity>) => void;
  isDarkMode: boolean;
}

export const KeywordsSection = ({
  opportunity,
  updateOpportunity,
  isDarkMode
}: KeywordsSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>(opportunity.keywords || []);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(opportunity.selectedKeywords || []);

  // Simulate extracting keywords from job description
  const extractKeywords = () => {
    setIsLoading(true);
    
    // In a real implementation, this would call an API to extract keywords
    setTimeout(() => {
      // Example keywords that might be extracted from a job description
      const extractedKeywords = [
        "React", "TypeScript", "JavaScript", "Node.js", "API", 
        "Frontend", "UI/UX", "Responsive Design", "Git", "Agile",
        "Communication", "Problem Solving", "Team Player", "Testing"
      ].sort(() => Math.random() - 0.5).slice(0, 8); // Randomize and take 8
      
      setKeywords(extractedKeywords);
      updateOpportunity(opportunity.id, { keywords: extractedKeywords });
      setIsLoading(false);
    }, 1500);
  };

  // Toggle a keyword selection
  const toggleKeywordSelection = (keyword: string) => {
    let updatedSelection;
    
    if (selectedKeywords.includes(keyword)) {
      updatedSelection = selectedKeywords.filter(k => k !== keyword);
    } else {
      updatedSelection = [...selectedKeywords, keyword];
    }
    
    setSelectedKeywords(updatedSelection);
    updateOpportunity(opportunity.id, { selectedKeywords: updatedSelection });
  };

  // Extract keywords on first load if none exist
  useEffect(() => {
    if (!opportunity.keywords || opportunity.keywords.length === 0) {
      extractKeywords();
    }
  }, []);

  return (
    <div className={`p-4 mb-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Key Skills & Requirements</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={extractKeywords}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyzing...' : 'Extract Keywords'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-blue-200 rounded-full mb-2"></div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Analyzing job description...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select skills to highlight in your resume:
            </p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => toggleKeywordSelection(keyword)}
                >
                  {selectedKeywords.includes(keyword) && (
                    <Check className="h-3 w-3" />
                  )}
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
          
          {selectedKeywords.length > 0 && (
            <div>
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Selected skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedKeywords.map((keyword, index) => (
                  <Badge 
                    key={index}
                    className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center"
                  >
                    {keyword}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => toggleKeywordSelection(keyword)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
