import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Search, Award, Calendar, BarChart, Zap } from "lucide-react";

interface AchievementRule {
  id: string;
  name: string;
  description: string;
  category: 'milestones' | 'consistency' | 'quality' | 'mastery';
  points: number;
  requirements: string;
  icon: React.ReactNode;
}

interface AchievementRulesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDarkMode: boolean;
}

export function AchievementRulesPanel({
  open,
  onOpenChange,
  isDarkMode
}: AchievementRulesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample achievement rules data
  const achievementRules: AchievementRule[] = [
    // Milestones
    {
      id: 'first_application',
      name: 'First Steps',
      description: 'Submit your first job application',
      category: 'milestones',
      points: 10,
      requirements: 'Submit 1 job application',
      icon: <Award />
    },
    {
      id: 'application_5',
      name: 'Persistent Applicant',
      description: 'You\'re building momentum in your job search',
      category: 'milestones',
      points: 25,
      requirements: 'Submit 5 job applications',
      icon: <Award />
    },
    {
      id: 'application_25',
      name: 'Dedicated Job Seeker',
      description: 'Your commitment to finding the right role is impressive',
      category: 'milestones',
      points: 50,
      requirements: 'Submit 25 job applications',
      icon: <Award />
    },
    {
      id: 'application_100',
      name: 'Application Expert',
      description: 'You\'ve mastered the art of job applications',
      category: 'milestones',
      points: 100,
      requirements: 'Submit 100 job applications',
      icon: <Award />
    },
    
    // Consistency
    {
      id: 'weekend_warrior',
      name: 'Weekend Warrior',
      description: 'You don\'t let weekends slow down your job search',
      category: 'consistency',
      points: 15,
      requirements: 'Submit applications on both Saturday and Sunday in the same weekend',
      icon: <Calendar />
    },
    {
      id: 'weekly_streak',
      name: 'Full Week Effort',
      description: 'Your daily commitment is key to job search success',
      category: 'consistency',
      points: 35,
      requirements: 'Submit at least one application every day for a week',
      icon: <Calendar />
    },
    {
      id: 'application_streak_14',
      name: 'Two-Week Streak',
      description: 'Your consistency is impressive',
      category: 'consistency',
      points: 50,
      requirements: 'Submit at least one application every day for 14 consecutive days',
      icon: <Calendar />
    },
    
    // Quality
    {
      id: 'first_response',
      name: 'First Response',
      description: 'Your application caught someone\'s attention',
      category: 'quality',
      points: 20,
      requirements: 'Receive your first response from an employer',
      icon: <BarChart />
    },
    {
      id: 'first_interview',
      name: 'Interview Invitation',
      description: 'Your qualifications stood out enough to earn an interview',
      category: 'quality',
      points: 30,
      requirements: 'Receive your first interview request',
      icon: <BarChart />
    },
    {
      id: 'interview_5',
      name: 'Interview Master',
      description: 'You\'re getting noticed by employers',
      category: 'quality',
      points: 75,
      requirements: 'Complete 5 interviews',
      icon: <BarChart />
    },
    
    // Mastery
    {
      id: 'profile_complete',
      name: 'Profile Pioneer',
      description: 'A complete profile helps you stand out to employers',
      category: 'mastery',
      points: 15,
      requirements: 'Complete your profile (100%)',
      icon: <Zap />
    },
    {
      id: 'resume_upload',
      name: 'Resume Ready',
      description: 'Your resume is the foundation of your job search',
      category: 'mastery',
      points: 10,
      requirements: 'Upload your resume to the platform',
      icon: <Zap />
    },
    {
      id: 'cover_letter',
      name: 'Cover Letter Creator',
      description: 'A personalized cover letter shows your interest in the role',
      category: 'mastery',
      points: 15,
      requirements: 'Create your first cover letter',
      icon: <Zap />
    },
  ];
  
  // Filter achievements based on search query
  const filteredAchievements = achievementRules.filter(achievement => 
    achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group achievements by category
  const milestones = filteredAchievements.filter(a => a.category === 'milestones');
  const consistency = filteredAchievements.filter(a => a.category === 'consistency');
  const quality = filteredAchievements.filter(a => a.category === 'quality');
  const mastery = filteredAchievements.filter(a => a.category === 'mastery');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[600px] ${isDarkMode ? 'bg-gray-800 text-gray-100' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievement Rules
          </DialogTitle>
          <DialogDescription>
            Learn how to earn achievements and level up your job search.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search achievements..."
            className={`pl-8 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="milestones">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="consistency">Consistency</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="mastery">Mastery</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="milestones" className="mt-0 space-y-4">
              {milestones.map(achievement => (
                <AchievementRuleCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  isDarkMode={isDarkMode} 
                />
              ))}
            </TabsContent>
            
            <TabsContent value="consistency" className="mt-0 space-y-4">
              {consistency.map(achievement => (
                <AchievementRuleCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  isDarkMode={isDarkMode} 
                />
              ))}
            </TabsContent>
            
            <TabsContent value="quality" className="mt-0 space-y-4">
              {quality.map(achievement => (
                <AchievementRuleCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  isDarkMode={isDarkMode} 
                />
              ))}
            </TabsContent>
            
            <TabsContent value="mastery" className="mt-0 space-y-4">
              {mastery.map(achievement => (
                <AchievementRuleCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  isDarkMode={isDarkMode} 
                />
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AchievementRuleCard({ achievement, isDarkMode }: { achievement: AchievementRule, isDarkMode: boolean }) {
  return (
    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
          {React.cloneElement(achievement.icon as React.ReactElement, { 
            className: `h-5 w-5 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`
          })}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{achievement.name}</h4>
            <div className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
              {achievement.points} points
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
          <div className={`mt-3 text-xs p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <span className="font-medium">Requirements:</span> {achievement.requirements}
          </div>
        </div>
      </div>
    </div>
  );
}
