"use client";

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
  Award, Flame, Rocket, Users, Building, Home, Lightbulb, InfoIcon,
  Zap, Star, Clock, TrendingUp, Calendar, ChartPie as ChartIcon, Gamepad2 as GamepadIcon
} from 'lucide-react';
import { TooltipHelper } from "../ui/tooltip-helper";
import { AchievementRulesPanel } from "../achievements/AchievementRulesPanel";
import { ProgressTracker } from "../achievements/ProgressTracker";
import { LevelBenefitsExplainer } from "../levels/LevelBenefitsExplainer";
import { TimelineWithMilestones } from "../timeline/TimelineWithMilestones";
import { AchievementCollection } from "../achievements/AchievementCollection";
import { EnhancedProgressBar } from "../achievements/EnhancedProgressBar";

// Define the TimelineDataPoint interface to match what TimelineWithMilestones expects
interface TimelineEvent {
  id: string;
  date: string;
  type: 'application' | 'response' | 'interview' | 'offer' | 'achievement';
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TimelineDataPoint {
  date: string;
  count: number;
  totalCount: number;
  events?: TimelineEvent[];
}

interface JobSearchInsight {
  title: string;
  description: string;
  actionItems?: string[];
  icon?: string;
}

interface StatusBreakdown {
  name: string;
  value: number;
  color: string;
}

interface Challenge {
  id: string;
  title?: string;
  name: string;
  description: string;
  reward: string;
  progress: number;
  total?: number;
  target: number;
  icon: string;
  complete: boolean;
  expires?: string;
}

interface LevelBenefit {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface AchievementProgress {
  total: number;
  completed: number;
  inProgress: number;
}

// Interface for the Achievement type used in this component
interface AchievementType {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
  category?: string;
  points?: number;
  rarity?: string;
}

interface ApplicationTimeline {
  '7days': Array<{date: Date | string; count: number; totalCount: number; events?: TimelineEvent[]}>;
  '30days': Array<{date: Date | string; count: number; totalCount: number; events?: TimelineEvent[]}>;
  '90days': Array<{date: Date | string; count: number; totalCount: number; events?: TimelineEvent[]}>;
  'all': Array<{date: Date | string; count: number; totalCount: number; events?: TimelineEvent[]}>;
  [key: string]: Array<{date: Date | string; count: number; totalCount: number; events?: TimelineEvent[]}>;
}

interface AnalyticsData {
  totalApplications: number;
  responseRate: string;
  interviewRate: string;
  offerRate: string;
  activeApplications: number;
  weeklyApplicationCount?: number;
  statusCounts: Record<string, number>;
  applicationTimeline: ApplicationTimeline;
  jobSearchStats: {
    level: number;
    progress: number;
    nextLevelScore: number;
    pointsToNextLevel: number;
    totalScore: number;
  };
  achievements: AchievementType[];
  weeklyPatterns?: {
    activityByDay: { day: string; count: number }[];
    mostActiveDay: { day: string; count: number };
    leastActiveDay: { day: string; count: number };
  };
  weeklyChallenges: Challenge[];
  jobSearchInsights: JobSearchInsight[];
}

interface Opportunity {
  id: number;
  company: string;
  position: string;
  status: string;
  appliedDate: string;
  [key: string]: any;
}

interface AnalyticsTabProps {
  analytics: AnalyticsData;
  opportunities: Opportunity[];
  isDarkMode: boolean;
  user: any;
}

// Define local tooltip content to avoid the errors
const localTooltipContent = {
  totalApplications: "Total number of job applications you've submitted",
  responseRate: "Percentage of applications that received a response",
  interviewRate: "Percentage of applications that led to interviews",
  offerRate: "Percentage of applications that resulted in job offers",
  jobSearchLevel: "Your job search level based on activity and achievements",
  applicationTimeline: "Timeline showing your application activity over time",
  weeklyPatterns: "Patterns in your job search activity by day of week",
  currentStreak: "Your current consecutive days of job search activity",
  achievements: "Progress towards unlocking job search achievements",
  weeklyChallenges: "Weekly challenges to boost your job search",
  statusBreakdown: "Breakdown of your applications by current status",
  insights: "Key insights about your job applications",
  levelBenefits: "Benefits you unlock at each level"
};

export function AnalyticsTab({
  analytics,
  opportunities,
  isDarkMode,
  user
}: AnalyticsTabProps) {
  const [timelinePeriod, setTimelinePeriod] = useState<string>('30days');
  const [achievementRulesPanelOpen, setAchievementRulesPanelOpen] = useState(false);
  
  // Convert status counts to chart data
  const statusData = Object.entries(analytics.statusCounts || {}).map(([name, value]) => ({
    name,
    value
  }));
  
  // Get timeline data based on selected period
  const timelineData = analytics.applicationTimeline?.[timelinePeriod as keyof ApplicationTimeline] || [];

  // Helper function to convert Date objects to strings for TimelineWithMilestones
  const convertTimelineData = (period: string): TimelineDataPoint[] => {
    return (analytics.applicationTimeline?.[period as keyof ApplicationTimeline] || []).map(item => ({
      // Convert Date to string if it's a Date object
      date: typeof item.date === 'string' ? item.date : item.date.toISOString().split('T')[0],
      count: item.count,
      totalCount: item.totalCount,
      events: item.events
    }));
  };

  return (
    <div className="space-y-6">
      {/* Main Analytics Tabs */}
      <Tabs defaultValue="core" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="core" className="flex items-center gap-2">
            <ChartIcon className="h-4 w-4" />
            <span>Core Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="gamification" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Gamification</span>
          </TabsTrigger>
        </TabsList>

        {/* CORE ANALYTICS TAB */}
        <TabsContent value="core" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  Total Applications
                  <TooltipHelper content={localTooltipContent.totalApplications} />
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
                  <TooltipHelper content={localTooltipContent.responseRate} />
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
                  <TooltipHelper content={localTooltipContent.interviewRate} />
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
                  <TooltipHelper content={localTooltipContent.offerRate} />
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
      
          {/* Insights & Applications Needing Attention */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                Insights & Applications Needing Attention
                <TooltipHelper content={localTooltipContent.insights} />
              </CardTitle>
              <CardDescription>
                Important information about your job search that needs attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Oldest application needing attention */}
                <div 
                  className={`p-4 rounded-lg border ${isDarkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}
                >
                  <div className="flex gap-3">
                    <div className={`p-3 rounded-full h-fit ${isDarkMode ? 'bg-amber-900' : 'bg-amber-100'}`}>
                      <Clock className={`h-5 w-5 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">Oldest Application: Company XYZ</h4>
                      <p className="text-muted-foreground mt-1">Applied 30 days ago - No response yet</p>
                      <p className="mt-2">Consider following up or marking as inactive</p>
                    </div>
                  </div>
                </div>
                
                {/* Stale applications count */}
                <div 
                  className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}
                >
                  <div className="flex gap-3">
                    <div className={`p-3 rounded-full h-fit ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                      <InfoIcon className={`h-5 w-5 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">5 Applications Without Activity</h4>
                      <p className="text-muted-foreground mt-1">No updates for more than 14 days</p>
                      <div className="mt-3">
                        <Button variant="outline" size="sm">View Applications</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Activity Patterns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div 
                    className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-3 rounded-full h-fit ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                        <TrendingUp className={`h-5 w-5 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">Most Active Day: Tuesday</h4>
                        <p className="text-muted-foreground mt-1">You add the most opportunities on this day</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg border ${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-3 rounded-full h-fit ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                        <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">Most Applications: Thursday</h4>
                        <p className="text-muted-foreground mt-1">You submit the most applications on this day</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Job Search Insights */}
                {analytics.jobSearchInsights && analytics.jobSearchInsights.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-lg mb-3">Personalized Insights</h3>
                    <div className="space-y-3">
                      {analytics.jobSearchInsights.map((insight, index) => (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex gap-3">
                            <div className={`p-3 rounded-full h-fit ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                              <Lightbulb className={`h-5 w-5 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                            </div>
                            <div>
                              <h4 className="font-medium text-lg">{insight.title}</h4>
                              <p className="text-muted-foreground mt-1">{insight.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Application Timeline */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    Application Timeline
                    <TooltipHelper content={localTooltipContent.applicationTimeline} />
                  </CardTitle>
                  <CardDescription>
                    Track your application progress over time
                  </CardDescription>
                </div>
                <Select 
                  value={timelinePeriod} 
                  onValueChange={(value) => setTimelinePeriod(value)}
                >
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
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h2 className="text-xl font-medium mr-2">Application Analytics</h2>
                  <TooltipHelper 
                    content="Key insights about your job applications"
                  />
                </div>
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
                                backgroundColor: STATUS_COLORS[opp.status as keyof typeof STATUS_COLORS] || '#64748b'
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
                  '7days': convertTimelineData('7days'),
                  '30days': convertTimelineData('30days'),
                  '90days': convertTimelineData('90days'),
                  'all': convertTimelineData('all')
                }}
                isDarkMode={isDarkMode}
              />
              
              {/* Application Activity Timeline */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Application Activity Timeline</h3>
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="relative pt-2 pb-10">
                      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                      
                      {/* Recent activity items */}
                      <div className="relative pl-6 mb-4">
                        <div className={`absolute left-0 w-2.5 h-2.5 rounded-full bg-green-500`} style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">Applied to Senior Developer at TechCorp</span>
                              <p className="text-sm text-muted-foreground mt-1">You customized your resume for this role</p>
                            </div>
                            <span className="text-xs text-muted-foreground">Today</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative pl-6 mb-4">
                        <div className={`absolute left-0 w-2.5 h-2.5 rounded-full bg-blue-500`} style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">Received response from InnovateTech</span>
                              <p className="text-sm text-muted-foreground mt-1">They've scheduled a screening call</p>
                            </div>
                            <span className="text-xs text-muted-foreground">Yesterday</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative pl-6 mb-4">
                        <div className={`absolute left-0 w-2.5 h-2.5 rounded-full bg-purple-500`} style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">Completed technical assessment for DevSolutions</span>
                              <p className="text-sm text-muted-foreground mt-1">Waiting for feedback</p>
                            </div>
                            <span className="text-xs text-muted-foreground">3 days ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
      
          {/* Status Breakdown */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                Application Status Breakdown
                <TooltipHelper content={localTooltipContent.statusBreakdown} />
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your job application statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* GAMIFICATION TAB */}
        <TabsContent value="gamification" className="space-y-6">
          {/* Job Search Level */}
          {analytics.jobSearchStats && (
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  Job Search Level
                  <TooltipHelper content={localTooltipContent.jobSearchLevel} />
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
                      size="lg"
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

          {/* Weekly Challenges */}
          {analytics.weeklyChallenges && analytics.weeklyChallenges.length > 0 && (
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  Weekly Challenges
                  <TooltipHelper content={localTooltipContent.weeklyChallenges} />
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

          {/* Achievement Progress and Level Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Achievement Progress Tracker */}
            {analytics.achievements && analytics.achievements.length > 0 && (
              <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    Achievement Progress
                    <TooltipHelper content={localTooltipContent.achievements} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressTracker 
                    achievements={analytics.achievements as any} 
                    isDarkMode={isDarkMode} 
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Level Benefits Explainer */}
            {analytics.jobSearchStats && (
              <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    Level Benefits
                    <TooltipHelper content={localTooltipContent.levelBenefits} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LevelBenefitsExplainer 
                    currentLevel={analytics.jobSearchStats.level || 1}
                    currentScore={analytics.jobSearchStats.totalScore || 0}
                    nextLevelScore={analytics.jobSearchStats.nextLevelScore || 100}
                    isDarkMode={isDarkMode}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Achievement Collection */}
          {analytics.achievements && analytics.achievements.length > 0 && (
            <AchievementCollection 
              achievements={analytics.achievements as any}
              isDarkMode={isDarkMode}
            />
          )}
      
        </TabsContent>
      </Tabs>
    </div>
  );
}
