import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { EnhancedProgressBar } from "../achievements/EnhancedProgressBar";
import { Badge } from "../ui/badge";
import { Zap, Award, Star, Lock, Unlock, ArrowRight } from "lucide-react";

interface LevelBenefit {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface LevelBenefitsExplainerProps {
  currentLevel: number;
  currentScore: number;
  nextLevelScore: number;
  isDarkMode: boolean;
}

export function LevelBenefitsExplainer({
  currentLevel,
  currentScore,
  nextLevelScore,
  isDarkMode
}: LevelBenefitsExplainerProps) {
  // Define benefits for current level
  const currentLevelBenefits: LevelBenefit[] = [
    {
      id: 'basic_analytics',
      name: 'Basic Analytics',
      description: 'Access to application tracking and basic statistics',
      icon: <Zap />,
      unlocked: true
    },
    {
      id: 'achievements',
      name: 'Achievements',
      description: 'Unlock and track job search achievements',
      icon: <Award />,
      unlocked: true
    },
    {
      id: 'weekly_report',
      name: 'Weekly Report',
      description: 'Receive a weekly summary of your job search activity',
      icon: <Star />,
      unlocked: currentLevel >= 2
    }
  ];
  
  // Define benefits for next level
  const nextLevelBenefits: LevelBenefit[] = [
    {
      id: 'advanced_analytics',
      name: 'Advanced Analytics',
      description: 'Detailed insights and trend analysis for your job search',
      icon: <Zap />,
      unlocked: false
    },
    {
      id: 'custom_dashboard',
      name: 'Custom Dashboard',
      description: 'Personalize your dashboard with the metrics that matter most to you',
      icon: <Star />,
      unlocked: false
    }
  ];
  
  // Calculate progress to next level
  const progressToNextLevel = currentScore;
  const totalToNextLevel = nextLevelScore;
  const percentToNextLevel = Math.round((progressToNextLevel / totalToNextLevel) * 100);
  
  // Estimate actions needed to reach next level
  const estimateActionsToNextLevel = () => {
    const pointsNeeded = nextLevelScore - currentScore;
    // Assuming average 15 points per significant action
    const actionsEstimate = Math.ceil(pointsNeeded / 15);
    
    if (actionsEstimate <= 1) return 'Just 1 more achievement';
    if (actionsEstimate <= 3) return `About ${actionsEstimate} more achievements`;
    if (actionsEstimate <= 10) return `About ${actionsEstimate} more achievements`;
    return 'Continued consistent activity';
  };

  return (
    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader>
        <CardTitle>Level Benefits</CardTitle>
        <CardDescription>
          Discover what you've unlocked and what's coming next
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold ${isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-900'}`}>
              {currentLevel}
            </div>
            <div>
              <h3 className="font-medium">Current Level</h3>
              <p className="text-sm text-muted-foreground">
                {currentScore} points earned
              </p>
            </div>
          </div>
          
          <h4 className="text-sm font-medium mb-2">Current Benefits</h4>
          <div className="space-y-2">
            {currentLevelBenefits.map(benefit => (
              <div 
                key={benefit.id} 
                className={`p-3 rounded-lg border flex items-start gap-3 ${
                  benefit.unlocked 
                    ? (isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200')
                    : (isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200')
                }`}
              >
                <div className={`p-2 rounded-full ${
                  benefit.unlocked 
                    ? (isDarkMode ? 'bg-green-900' : 'bg-green-100')
                    : (isDarkMode ? 'bg-gray-600' : 'bg-gray-200')
                }`}>
                  {React.cloneElement(benefit.icon as React.ReactElement, { 
                    className: `h-4 w-4 ${
                      benefit.unlocked 
                        ? (isDarkMode ? 'text-green-300' : 'text-green-600')
                        : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                    }`
                  })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-sm">{benefit.name}</h5>
                    {benefit.unlocked ? (
                      <Badge variant="outline" className="text-xs bg-green-500 text-white border-0">
                        <Unlock className="h-3 w-3 mr-1" /> Unlocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" /> Locked
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Next Level Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Next Level: {currentLevel + 1}</h3>
            <span className="text-sm text-muted-foreground">
              {nextLevelScore} points required
            </span>
          </div>
          
          <EnhancedProgressBar 
            progress={progressToNextLevel}
            total={totalToNextLevel}
            isDarkMode={isDarkMode}
            className="mb-4"
          />
          
          <div className="mb-4 p-2 rounded-lg border text-sm text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-1">
              <ArrowRight className="h-4 w-4" />
              <span>{estimateActionsToNextLevel()} to reach Level {currentLevel + 1}</span>
            </div>
          </div>
          
          <h4 className="text-sm font-medium mb-2">Unlock at Level {currentLevel + 1}</h4>
          <div className="space-y-2">
            {nextLevelBenefits.map(benefit => (
              <div 
                key={benefit.id} 
                className={`p-3 rounded-lg border flex items-start gap-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}
              >
                <div className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                  {React.cloneElement(benefit.icon as React.ReactElement, { 
                    className: `h-4 w-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`
                  })}
                </div>
                <div>
                  <h5 className="font-medium text-sm">{benefit.name}</h5>
                  <p className="text-xs text-muted-foreground mt-1">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
