import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Award, Trophy, Zap, Star, ChevronRight } from "lucide-react";
import { EnhancedProgressBar } from "./EnhancedProgressBar";
import { Achievement } from "../../lib/achievementUtils";

interface MobileAchievementViewProps {
  achievements: Achievement[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDarkMode: boolean;
}

export function MobileAchievementView({
  achievements,
  open,
  onOpenChange,
  isDarkMode
}: MobileAchievementViewProps) {
  const [activeTab, setActiveTab] = useState('all');
  
  // Group achievements by category
  const milestones = achievements.filter(a => a.category === 'milestones');
  const consistency = achievements.filter(a => a.category === 'consistency');
  const quality = achievements.filter(a => a.category === 'quality');
  const mastery = achievements.filter(a => a.category === 'mastery');
  
  // Calculate completion percentages
  const calculateCompletionPercentage = (achievements: Achievement[]) => {
    if (achievements.length === 0) return 0;
    const unlocked = achievements.filter(a => a.unlocked).length;
    return Math.round((unlocked / achievements.length) * 100);
  };
  
  const totalCompletion = calculateCompletionPercentage(achievements);
  
  // Get icon based on category
  const getIcon = (category: string) => {
    switch (category) {
      case 'milestones': return <Trophy className="h-4 w-4" />;
      case 'consistency': return <Zap className="h-4 w-4" />;
      case 'quality': return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };
  
  // Get colors based on rarity
  const getRarityColors = (rarity: string, unlocked: boolean) => {
    if (!unlocked) {
      return {
        bg: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
        border: isDarkMode ? 'border-gray-600' : 'border-gray-200',
        text: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        iconBg: isDarkMode ? 'bg-gray-600' : 'bg-gray-200',
        iconColor: isDarkMode ? 'text-gray-400' : 'text-gray-500'
      };
    }
    
    switch (rarity) {
      case 'legendary':
        return {
          bg: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
          border: isDarkMode ? 'border-purple-800' : 'border-purple-200',
          text: isDarkMode ? 'text-purple-300' : 'text-purple-700',
          iconBg: isDarkMode ? 'bg-purple-900' : 'bg-purple-100',
          iconColor: isDarkMode ? 'text-purple-300' : 'text-purple-600'
        };
      case 'rare':
        return {
          bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
          border: isDarkMode ? 'border-blue-800' : 'border-blue-200',
          text: isDarkMode ? 'text-blue-300' : 'text-blue-700',
          iconBg: isDarkMode ? 'bg-blue-900' : 'bg-blue-100',
          iconColor: isDarkMode ? 'text-blue-300' : 'text-blue-600'
        };
      case 'uncommon':
        return {
          bg: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
          border: isDarkMode ? 'border-green-800' : 'border-green-200',
          text: isDarkMode ? 'text-green-300' : 'text-green-700',
          iconBg: isDarkMode ? 'bg-green-900' : 'bg-green-100',
          iconColor: isDarkMode ? 'text-green-300' : 'text-green-600'
        };
      default: // common
        return {
          bg: isDarkMode ? 'bg-gray-700' : 'bg-gray-50',
          border: isDarkMode ? 'border-gray-600' : 'border-gray-200',
          text: isDarkMode ? 'text-gray-300' : 'text-gray-700',
          iconBg: isDarkMode ? 'bg-gray-600' : 'bg-gray-200',
          iconColor: isDarkMode ? 'text-gray-300' : 'text-gray-600'
        };
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className={`h-[90vh] p-0 ${isDarkMode ? 'bg-gray-800 text-gray-100' : ''}`}
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Achievements</SheetTitle>
          <SheetDescription>
            Your job search achievements collection
          </SheetDescription>
        </SheetHeader>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          <TabsList className="grid grid-cols-4 p-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="consistency">Consistency</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>
          
          <div className="p-2 border-b">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm">{totalCompletion}%</span>
            </div>
            <EnhancedProgressBar 
              progress={totalCompletion}
              total={100}
              showPercentage={false}
              showValues={false}
              size="sm"
              isDarkMode={isDarkMode}
            />
          </div>
          
          <ScrollArea className="flex-1">
            <TabsContent value="all" className="p-2 mt-0">
              <div className="space-y-2">
                {achievements.map(achievement => {
                  const colors = getRarityColors(achievement.rarity, achievement.unlocked);
                  const percentage = Math.min(100, Math.round((achievement.progress / achievement.total) * 100));
                  
                  return (
                    <div 
                      key={achievement.id} 
                      className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${colors.iconBg}`}>
                          {React.cloneElement(getIcon(achievement.category), { 
                            className: colors.iconColor
                          })}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`font-medium text-sm ${colors.text}`}>
                              {achievement.name}
                            </h4>
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/10">
                              {achievement.points} pts
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          
                          <div className="mt-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-muted-foreground">
                                {achievement.progress} / {achievement.total}
                              </span>
                              <span className="text-xs">
                                {percentage}%
                              </span>
                            </div>
                            <div className={`w-full h-1 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <div 
                                className={`h-1 rounded-full ${
                                  achievement.unlocked 
                                    ? 'bg-green-500' 
                                    : percentage > 0 
                                      ? 'bg-blue-500' 
                                      : isDarkMode ? 'bg-gray-500' : 'bg-gray-300'
                                }`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="milestones" className="p-2 mt-0">
              <div className="space-y-2">
                {milestones.map(achievement => {
                  const colors = getRarityColors(achievement.rarity, achievement.unlocked);
                  const percentage = Math.min(100, Math.round((achievement.progress / achievement.total) * 100));
                  
                  return (
                    <div 
                      key={achievement.id} 
                      className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                    >
                      {/* Same content as in "all" tab */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${colors.iconBg}`}>
                          {React.cloneElement(getIcon(achievement.category), { 
                            className: colors.iconColor
                          })}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`font-medium text-sm ${colors.text}`}>
                              {achievement.name}
                            </h4>
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/10">
                              {achievement.points} pts
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          
                          <div className="mt-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-muted-foreground">
                                {achievement.progress} / {achievement.total}
                              </span>
                              <span className="text-xs">
                                {percentage}%
                              </span>
                            </div>
                            <div className={`w-full h-1 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <div 
                                className={`h-1 rounded-full ${
                                  achievement.unlocked 
                                    ? 'bg-green-500' 
                                    : percentage > 0 
                                      ? 'bg-blue-500' 
                                      : isDarkMode ? 'bg-gray-500' : 'bg-gray-300'
                                }`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            {/* Similar content for consistency and quality tabs */}
            <TabsContent value="consistency" className="p-2 mt-0">
              <div className="space-y-2">
                {consistency.map(achievement => {
                  const colors = getRarityColors(achievement.rarity, achievement.unlocked);
                  const percentage = Math.min(100, Math.round((achievement.progress / achievement.total) * 100));
                  
                  return (
                    <div 
                      key={achievement.id} 
                      className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                    >
                      {/* Same content structure as above */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${colors.iconBg}`}>
                          {React.cloneElement(getIcon(achievement.category), { 
                            className: colors.iconColor
                          })}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`font-medium text-sm ${colors.text}`}>
                              {achievement.name}
                            </h4>
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/10">
                              {achievement.points} pts
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          
                          <div className="mt-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-muted-foreground">
                                {achievement.progress} / {achievement.total}
                              </span>
                              <span className="text-xs">
                                {percentage}%
                              </span>
                            </div>
                            <div className={`w-full h-1 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <div 
                                className={`h-1 rounded-full ${
                                  achievement.unlocked 
                                    ? 'bg-green-500' 
                                    : percentage > 0 
                                      ? 'bg-blue-500' 
                                      : isDarkMode ? 'bg-gray-500' : 'bg-gray-300'
                                }`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="quality" className="p-2 mt-0">
              <div className="space-y-2">
                {quality.map(achievement => {
                  const colors = getRarityColors(achievement.rarity, achievement.unlocked);
                  const percentage = Math.min(100, Math.round((achievement.progress / achievement.total) * 100));
                  
                  return (
                    <div 
                      key={achievement.id} 
                      className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                    >
                      {/* Same content structure as above */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${colors.iconBg}`}>
                          {React.cloneElement(getIcon(achievement.category), { 
                            className: colors.iconColor
                          })}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`font-medium text-sm ${colors.text}`}>
                              {achievement.name}
                            </h4>
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/10">
                              {achievement.points} pts
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          
                          <div className="mt-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-muted-foreground">
                                {achievement.progress} / {achievement.total}
                              </span>
                              <span className="text-xs">
                                {percentage}%
                              </span>
                            </div>
                            <div className={`w-full h-1 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <div 
                                className={`h-1 rounded-full ${
                                  achievement.unlocked 
                                    ? 'bg-green-500' 
                                    : percentage > 0 
                                      ? 'bg-blue-500' 
                                      : isDarkMode ? 'bg-gray-500' : 'bg-gray-300'
                                }`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
