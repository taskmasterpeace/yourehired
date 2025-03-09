import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { EnhancedProgressBar } from "./EnhancedProgressBar";
import { Award, ArrowRight, Clock } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  unlocked: boolean;
  progress: number;
  total: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface ProgressTrackerProps {
  achievements: Achievement[];
  isDarkMode: boolean;
}

export function ProgressTracker({ achievements, isDarkMode }: ProgressTrackerProps) {
  // Filter achievements that are in progress (not unlocked but have some progress)
  const inProgressAchievements = achievements
    .filter(a => !a.unlocked && a.progress > 0)
    .sort((a, b) => {
      // Sort by percentage completion (highest first)
      const percentA = (a.progress / a.total) * 100;
      const percentB = (b.progress / b.total) * 100;
      return percentB - percentA;
    })
    .slice(0, 3); // Take top 3
  
  // Find achievements that are next in line (0 progress but logical next steps)
  const upNextAchievements = achievements
    .filter(a => !a.unlocked && a.progress === 0)
    .sort((a, b) => a.total - b.total) // Sort by lowest total requirement first
    .slice(0, 2); // Take top 2
  
  // Helper function to estimate time to complete
  const getEstimatedTimeToComplete = (achievement: Achievement) => {
    const remaining = achievement.total - achievement.progress;
    
    // This is a simplified estimation - in a real app, you'd use historical user data
    if (remaining <= 1) return 'Less than a day';
    if (remaining <= 5) return '~1-2 days';
    if (remaining <= 10) return '~3-5 days';
    if (remaining <= 25) return '~1-2 weeks';
    return 'Several weeks';
  };
  
  // Get rarity color
  const getRarityColor = (rarity: string = 'common') => {
    switch (rarity) {
      case 'legendary': return isDarkMode ? 'text-purple-300' : 'text-purple-600';
      case 'rare': return isDarkMode ? 'text-blue-300' : 'text-blue-600';
      case 'uncommon': return isDarkMode ? 'text-green-300' : 'text-green-600';
      default: return isDarkMode ? 'text-gray-300' : 'text-gray-600';
    }
  };

  return (
    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader>
        <CardTitle>Achievement Progress Tracker</CardTitle>
        <CardDescription>
          Track your progress toward upcoming achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* In Progress Section */}
        {inProgressAchievements.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Almost There</h3>
            <div className="space-y-4">
              {inProgressAchievements.map(achievement => (
                <div key={achievement.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Award className={`h-5 w-5 ${getRarityColor(achievement.rarity)}`} />
                      <span className="font-medium">{achievement.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{achievement.points} pts</span>
                  </div>
                  
                  <EnhancedProgressBar 
                    progress={achievement.progress}
                    total={achievement.total}
                    isDarkMode={isDarkMode}
                  />
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{achievement.description}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{getEstimatedTimeToComplete(achievement)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Up Next Section */}
        {upNextAchievements.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Up Next</h3>
            <div className="space-y-3">
              {upNextAchievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <Award className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{achievement.name}</h4>
                        <span className="text-xs text-muted-foreground">{achievement.points} pts</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs">
                        <ArrowRight className="h-3 w-3" />
                        <span>Requires: {achievement.total} {achievement.total === 1 ? 'action' : 'actions'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
