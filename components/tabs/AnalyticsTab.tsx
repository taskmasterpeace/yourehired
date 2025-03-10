import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, COLORS, STATUS_COLORS
} from '../recharts';
import { 
  BarChartIcon, PieChartIcon, LineChartIcon, ActivityIcon, Trophy, 
  Award, Flame, Rocket, Users, Building, Home, Lightbulb, InfoIcon
} from 'lucide-react';
import { TooltipHelper } from "../ui/tooltip-helper";
import { tooltipContent } from "../../lib/tooltipContent";
import { AchievementRulesPanel } from "../achievements/AchievementRulesPanel";
import { ProgressTracker } from "../achievements/ProgressTracker";
import { LevelBenefitsExplainer } from "../levels/LevelBenefitsExplainer";
import { TimelineWithMilestones } from "../timeline/TimelineWithMilestones";
import { AchievementCollection } from "../achievements/AchievementCollection";
import { EnhancedProgressBar } from "../achievements/EnhancedProgressBar";

interface AnalyticsTabProps {
  analytics: any;
  opportunities: any[];
  isDarkMode: boolean;
  user: any;
}

export function AnalyticsTab({
  analytics,
  opportunities,
  isDarkMode,
  user
}: AnalyticsTabProps) {
  const [timelinePeriod, setTimelinePeriod] = useState('30days');
  const [achievementRulesPanelOpen, setAchievementRulesPanelOpen] = useState(false);
  
  // Convert status counts to chart data
  const statusData = Object.entries(analytics.statusCounts || {}).map(([name, value]) => ({
    name,
    value
  }));
  
  // Get timeline data based on selected period
  const timelineData = analytics.applicationTimeline?.[timelinePeriod] || [];

  return (
    <div className="space-y-6">
      {/* Job Search Level - Made more prominent */}
      {analytics.jobSearchStats && (
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''} mb-6`}>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              Job Search Level
              <TooltipHelper content={tooltipContent.jobSearchLevel} />
            </CardTitle>
            <CardDescription className="text-base">
              Your progress in the job search journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-4">
              <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold ${isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-900'}`}>
                {analytics.jobSearchStats.level || 1}
              </div>
              <div className="flex-1">
                <EnhancedProgressBar 
                  progress={analytics.jobSearchStats.progress || 0}
                  total={100}
                  isDarkMode={isDarkMode}
                  height="h-3"
                />
                <p className="text-lg mt-3">
                  {analytics.jobSearchStats.totalScore || 0} points • Next level at {analytics.jobSearchStats.nextLevelScore || 100} points
                </p>
              </div>
            </div>
          </CardContent>
          
          {/* Add the Achievement Rules Panel */}
          <AchievementRulesPanel 
            open={achievementRulesPanelOpen} 
            onOpenChange={setAchievementRulesPanelOpen} 
            isDarkMode={isDarkMode} 
          />
        </Card>
      )}
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              Total Applications
              <TooltipHelper content={tooltipContent.totalApplications} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-bold">{analytics.totalApplications || 0}</p>
              <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <BarChartIcon className={`h-8 w-8 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
            </div>
            <p className="text-base text-muted-foreground mt-2">
              {analytics.activeApplications || 0} active applications
            </p>
          </CardContent>
        </Card>
        
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Response Rate
              <TooltipHelper content={tooltipContent.responseRate} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{analytics.responseRate || 0}%</p>
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                <ActivityIcon className={`h-6 w-6 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Industry avg: 20-30%
            </p>
          </CardContent>
        </Card>
        
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Interview Rate
              <TooltipHelper content={tooltipContent.interviewRate} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{analytics.interviewRate || 0}%</p>
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <Users className={`h-6 w-6 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Of responses received
            </p>
          </CardContent>
        </Card>
        
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Offer Rate
              <TooltipHelper content={tooltipContent.offerRate} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{analytics.offerRate || 0}%</p>
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-amber-900' : 'bg-amber-100'}`}>
                <Trophy className={`h-6 w-6 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Of interviews conducted
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Weekly Challenges - Moved up */}
      {analytics.weeklyChallenges && analytics.weeklyChallenges.length > 0 && (
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''} mb-6`}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              Weekly Challenges
              <TooltipHelper content={tooltipContent.weeklyChallenges} />
            </CardTitle>
            <CardDescription className="text-base">
              Complete these challenges to boost your job search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.weeklyChallenges.map((challenge, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                        <Rocket className={`h-6 w-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">{challenge.name}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{challenge.progress} / {challenge.target}</span>
                        <span className="text-sm">Expires: {challenge.expires}</span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className="h-2 rounded-full bg-blue-500" 
                          style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                        ></div>
                      </div>
                      <div className="mt-3 text-sm text-right text-muted-foreground">
                        Reward: {challenge.reward}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="ml-auto">
              View All Challenges
            </Button>
          </CardFooter>
        </Card>
      )}
      {/* Achievement and Level Benefits in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Achievement Progress Tracker - Enhanced with more content */}
        {analytics.achievements && analytics.achievements.length > 0 && (
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                Achievement Progress
                <TooltipHelper content={tooltipContent.achievementProgress || "Track your achievement progress"} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressTracker 
                achievements={analytics.achievements} 
                isDarkMode={isDarkMode} 
                compact={true}
              />
            </CardContent>
          </Card>
        )}
        
        {/* Level Benefits Explainer */}
        {analytics.jobSearchStats && (
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                Level Benefits
                <TooltipHelper content={tooltipContent.levelBenefits || "Benefits you unlock at each level"} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LevelBenefitsExplainer 
                currentLevel={analytics.jobSearchStats.level || 1}
                currentScore={analytics.jobSearchStats.totalScore || 0}
                nextLevelScore={analytics.jobSearchStats.nextLevelScore || 100}
                isDarkMode={isDarkMode}
                compact={true}
              />
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Achievement Collection - Enhanced with tabs */}
      {analytics.achievements && analytics.achievements.length > 0 && (
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''} mt-6`}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              Achievements
              <TooltipHelper content={tooltipContent.achievements || "Collect achievements as you progress in your job search"} />
            </CardTitle>
            <CardDescription className="text-base">
              Unlock achievements to level up your job search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="milestones">
              <TabsList className="mb-4">
                <TabsTrigger value="milestones" className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>Milestones</span>
                </TabsTrigger>
                <TabsTrigger value="consistency" className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  <span>Consistency</span>
                </TabsTrigger>
                <TabsTrigger value="quality" className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>Quality</span>
                </TabsTrigger>
                <TabsTrigger value="mastery" className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>Mastery</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="milestones">
                <AchievementCollection 
                  achievements={analytics.achievements
                    .map(achievement => ({
                      ...achievement,
                      // Add rarity if it doesn't exist
                      rarity: achievement.rarity || 
                        (achievement.points >= 75 ? 'legendary' : 
                         achievement.points >= 50 ? 'rare' : 
                         achievement.points >= 25 ? 'uncommon' : 'common'),
                      // Add category if it doesn't exist
                      category: achievement.category || 'milestones'
                    }))
                    .filter(a => a.category === 'milestones')} 
                  isDarkMode={isDarkMode}
                />
              </TabsContent>
              
              <TabsContent value="consistency">
                <AchievementCollection 
                  achievements={analytics.achievements
                    .map(achievement => ({
                      ...achievement,
                      rarity: achievement.rarity || 
                        (achievement.points >= 75 ? 'legendary' : 
                         achievement.points >= 50 ? 'rare' : 
                         achievement.points >= 25 ? 'uncommon' : 'common'),
                      category: achievement.category || 'milestones'
                    }))
                    .filter(a => a.category === 'consistency') || 
                    // Add placeholder if empty
                    [
                      {
                        id: 'consistency_placeholder',
                        name: 'Daily Application Streak',
                        description: 'Apply to jobs for 7 consecutive days',
                        category: 'consistency',
                        points: 25,
                        unlocked: false,
                        progress: 3,
                        total: 7,
                        rarity: 'uncommon'
                      }
                    ]} 
                  isDarkMode={isDarkMode}
                />
              </TabsContent>
              
              <TabsContent value="quality">
                <AchievementCollection 
                  achievements={analytics.achievements
                    .map(achievement => ({
                      ...achievement,
                      rarity: achievement.rarity || 
                        (achievement.points >= 75 ? 'legendary' : 
                         achievement.points >= 50 ? 'rare' : 
                         achievement.points >= 25 ? 'uncommon' : 'common'),
                      category: achievement.category || 'milestones'
                    }))
                    .filter(a => a.category === 'quality') || 
                    // Add placeholder if empty
                    [
                      {
                        id: 'quality_placeholder',
                        name: 'Interview Converter',
                        description: 'Receive an interview from 25% of your applications',
                        category: 'quality',
                        points: 50,
                        unlocked: false,
                        progress: 15,
                        total: 25,
                        rarity: 'rare'
                      }
                    ]} 
                  isDarkMode={isDarkMode}
                />
              </TabsContent>
              
              <TabsContent value="mastery">
                <AchievementCollection 
                  achievements={analytics.achievements
                    .map(achievement => ({
                      ...achievement,
                      rarity: achievement.rarity || 
                        (achievement.points >= 75 ? 'legendary' : 
                         achievement.points >= 50 ? 'rare' : 
                         achievement.points >= 25 ? 'uncommon' : 'common'),
                      category: achievement.category || 'milestones'
                    }))
                    .filter(a => a.category === 'mastery') || 
                    // Add placeholder if empty
                    [
                      {
                        id: 'mastery_placeholder',
                        name: 'Job Search Master',
                        description: 'Reach level 10 in your job search journey',
                        category: 'mastery',
                        points: 100,
                        unlocked: false,
                        progress: 4,
                        total: 10,
                        rarity: 'legendary'
                      }
                    ]} 
                  isDarkMode={isDarkMode}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {/* Main Charts - Moved to bottom */}
      <Tabs defaultValue="status" className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Application Analytics</CardTitle>
              <TabsList>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center">
                  Timeline
                  <TooltipHelper content={tooltipContent.applicationTimeline} />
                </TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription>
              Detailed breakdown of your job application data
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="status" className="mt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Applications" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-0">
              <div className="mb-4">
                <Select value={timelinePeriod} onValueChange={setTimelinePeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Application Stage Timeline</h3>
                <div className="overflow-x-auto pb-4">
                  <div className="min-w-[800px]">
                    <div className="flex justify-between mb-2">
                      {Object.keys(STATUS_COLORS).slice(0, 8).map((status, i) => (
                        <div key={i} className="text-xs text-center" style={{ width: '12.5%' }}>
                          {status}
                        </div>
                      ))}
                    </div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full flex">
                      {Object.entries(STATUS_COLORS).slice(0, 8).map(([status, color], i) => (
                        <div 
                          key={i} 
                          className="h-full rounded-full" 
                          style={{ 
                            width: '12.5%', 
                            backgroundColor: color,
                            opacity: 0.3
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      {opportunities.filter(opp => opp.status).map((opp, i) => {
                        const statusIndex = Object.keys(STATUS_COLORS).indexOf(opp.status);
                        const position = statusIndex > 7 ? 100 : (statusIndex / 8) * 100;
                        
                        return (
                          <div key={i} className="relative h-8 mb-2">
                            <div 
                              className="absolute h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ 
                                left: `${position}%`, 
                                transform: 'translateX(-50%)',
                                backgroundColor: STATUS_COLORS[opp.status] || '#64748b'
                              }}
                            >
                              {opp.company?.charAt(0) || '?'}
                            </div>
                            <div 
                              className="absolute text-xs whitespace-nowrap"
                              style={{ 
                                left: `${position}%`, 
                                transform: 'translateX(-50%)',
                                top: '24px'
                              }}
                            >
                              {opp.company}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <TimelineWithMilestones 
                timelineData={{
                  '7days': analytics.applicationTimeline?.['7days'] || [],
                  '30days': analytics.applicationTimeline?.['30days'] || [],
                  '90days': analytics.applicationTimeline?.['90days'] || [],
                  'all': analytics.applicationTimeline?.['all'] || []
                }}
                isDarkMode={isDarkMode}
              />
            </TabsContent>
            
            <TabsContent value="insights" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Weekly Patterns */}
                {analytics.weeklyPatterns && (
                  <Card className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        Weekly Activity Patterns
                        <TooltipHelper content={tooltipContent.weeklyPatterns} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Most active day:</span>
                          <Badge variant="outline" className="font-medium">
                            {analytics.weeklyPatterns.mostActiveDay?.day || 'N/A'} ({analytics.weeklyPatterns.mostActiveDay?.count || 0})
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Least active day:</span>
                          <Badge variant="outline" className="font-medium">
                            {analytics.weeklyPatterns.leastActiveDay?.day || 'N/A'} ({analytics.weeklyPatterns.leastActiveDay?.count || 0})
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Application Streak */}
                {analytics.achievements && (
                  <Card className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        Current Streak
                        <TooltipHelper content={tooltipContent.currentStreak} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isDarkMode ? 'bg-amber-900' : 'bg-amber-100'}`}>
                          <Flame className={`h-5 w-5 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {analytics.achievements.find(a => a.id === 'application_streak')?.progress || 0} days
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Consecutive application days
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Job Search Insights */}
              {analytics.jobSearchInsights && analytics.jobSearchInsights.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Personalized Insights</h3>
                  <div className="space-y-3">
                    {analytics.jobSearchInsights.map((insight, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-full h-fit ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                            <Lightbulb className={`h-4 w-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
