import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface CaptainTabProps {
  opportunities: any[];
  jobRecommendations: any[];
  currentRecommendationIndex: number;
  setCurrentRecommendationIndex: (index: number) => void;
  ratedRecommendations: any[];
  setRatedRecommendations: (recommendations: any[]) => void;
  isDarkMode: boolean;
  user: any;
}

export function CaptainTab({
  opportunities,
  jobRecommendations,
  currentRecommendationIndex,
  setCurrentRecommendationIndex,
  ratedRecommendations,
  setRatedRecommendations,
  isDarkMode,
  user
}: CaptainTabProps) {
  const currentRecommendation = jobRecommendations[currentRecommendationIndex];

  const handleRateRecommendation = (rating: string) => {
    // Add rating to current recommendation
    const ratedRecommendation = {
      ...currentRecommendation,
      rating,
      ratedAt: new Date().toISOString()
    };
    
    // Add to rated recommendations
    setRatedRecommendations([...ratedRecommendations, ratedRecommendation]);
    
    // Move to next recommendation
    if (currentRecommendationIndex < jobRecommendations.length - 1) {
      setCurrentRecommendationIndex(currentRecommendationIndex + 1);
    } else {
      // Cycle back to the beginning if we've gone through all
      setCurrentRecommendationIndex(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>Job Coach</CardTitle>
          <CardDescription>
            Get personalized job recommendations and career advice
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentRecommendation ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{currentRecommendation.position}</h3>
                <p className="text-sm text-gray-500">{currentRecommendation.company} • {currentRecommendation.location}</p>
              </div>
              
              <p className="text-sm">{currentRecommendation.description}</p>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleRateRecommendation('not-interested')}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Not Interested
                </Button>
                <Button 
                  onClick={() => handleRateRecommendation('interested')}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Interested
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center py-6">No job recommendations available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
