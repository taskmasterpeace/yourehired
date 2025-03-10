"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { AchievementBadge } from "./AchievementBadge";
import { Search, Award, Trophy, Zap, Star } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'milestones' | 'consistency' | 'quality' | 'mastery';
  points: number;
  unlocked: boolean;
  progress: number;
  total: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface AchievementCollectionProps {
  achievements: Achievement[];
  isDarkMode: boolean;
}

export function AchievementCollection({
  achievements,
  isDarkMode
}: AchievementCollectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('progress'); // 'progress', 'rarity', 'points'
  
  // Filter achievements based on search query
  const filteredAchievements = achievements.filter(achievement => 
    achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort achievements based on selected sort option
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        // Sort by progress percentage (highest first)
        const percentA = (a.progress / a.total) * 100;
        const percentB = (b.progress / b.total) * 100;
        return percentB - percentA;
      case 'rarity':
        // Sort by rarity (legendary first)
        const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      case 'points':
        // Sort by points (highest first)
        return b.points - a.points;
      default:
        return 0;
    }
  });
  
  // Group achievements by category and add placeholders if empty
  const milestones = sortedAchievements.filter(a => a.category === 'milestones');
  
  const consistency = sortedAchievements.filter(a => a.category === 'consistency');
  if (consistency.length === 0) {
    consistency.push({
      id: 'consistency_placeholder',
      name: 'Daily Application Streak',
      description: 'Apply to jobs for 7 consecutive days',
      category: 'consistency' as any,
      points: 25,
      unlocked: false,
      progress: 3,
      total: 7,
      rarity: 'uncommon' as any
    });
  }
  
  const quality = sortedAchievements.filter(a => a.category === 'quality');
  if (quality.length === 0) {
    quality.push({
      id: 'quality_placeholder',
      name: 'Interview Converter',
      description: 'Receive an interview from 25% of your applications',
      category: 'quality' as any,
      points: 50,
      unlocked: false,
      progress: 15,
      total: 25,
      rarity: 'rare' as any
    });
  }
  
  const mastery = sortedAchievements.filter(a => a.category === 'mastery');
  if (mastery.length === 0) {
    mastery.push({
      id: 'mastery_placeholder',
      name: 'Job Search Master',
      description: 'Reach level 10 in your job search journey',
      category: 'mastery' as any,
      points: 100,
      unlocked: false,
      progress: 4,
      total: 10,
      rarity: 'legendary' as any
    });
  }
  
  // Calculate completion percentages for each category
  const calculateCompletionPercentage = (achievements: Achievement[]) => {
    if (achievements.length === 0) return 0;
    const unlocked = achievements.filter(a => a.unlocked).length;
    return Math.round((unlocked / achievements.length) * 100);
  };
  
  const milestonesCompletion = calculateCompletionPercentage(milestones);
  const consistencyCompletion = calculateCompletionPercentage(consistency);
  const qualityCompletion = calculateCompletionPercentage(quality);
  const masteryCompletion = calculateCompletionPercentage(mastery);
  const totalCompletion = calculateCompletionPercentage(achievements);

  return (
    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Achievement Collection
              <span className={`text-sm px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                {totalCompletion}% Complete
              </span>
            </CardTitle>
            <CardDescription>
              Your collection of job search achievements
            </CardDescription>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="progress">Sort by Progress</SelectItem>
              <SelectItem value="rarity">Sort by Rarity</SelectItem>
              <SelectItem value="points">Sort by Points</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search achievements..."
            className={`pl-8 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>All ({totalCompletion}%)</span>
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>Milestones ({milestonesCompletion}%)</span>
            </TabsTrigger>
            <TabsTrigger value="consistency" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span>Consistency ({consistencyCompletion}%)</span>
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>Quality ({qualityCompletion}%)</span>
            </TabsTrigger>
            <TabsTrigger value="mastery" className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>Mastery ({masteryCompletion}%)</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedAchievements.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  category={achievement.category}
                  rarity={achievement.rarity}
                  unlocked={achievement.unlocked}
                  progress={achievement.progress}
                  total={achievement.total}
                  points={achievement.points}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="milestones" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {milestones.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  category={achievement.category}
                  rarity={achievement.rarity}
                  unlocked={achievement.unlocked}
                  progress={achievement.progress}
                  total={achievement.total}
                  points={achievement.points}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="consistency" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consistency.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  category={achievement.category}
                  rarity={achievement.rarity}
                  unlocked={achievement.unlocked}
                  progress={achievement.progress}
                  total={achievement.total}
                  points={achievement.points}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="quality" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quality.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  category={achievement.category}
                  rarity={achievement.rarity}
                  unlocked={achievement.unlocked}
                  progress={achievement.progress}
                  total={achievement.total}
                  points={achievement.points}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="mastery" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mastery.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  category={achievement.category}
                  rarity={achievement.rarity}
                  unlocked={achievement.unlocked}
                  progress={achievement.progress}
                  total={achievement.total}
                  points={achievement.points}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
