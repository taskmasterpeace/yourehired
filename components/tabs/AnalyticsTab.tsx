import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  BarChartIcon, PieChartIcon, LineChartIcon, ActivityIcon, Trophy, 
  Award, Flame, Rocket, Users, Building, Home, Lightbulb, InfoIcon
} from 'lucide-react';
import { TooltipHelper } from "../ui/tooltip-helper";
import { tooltipContent } from "../../lib/tooltipContent";
import { AchievementRulesPanel } from "../achievements/AchievementRulesPanel";

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
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Get timeline data based on selected period
  const timelineData = analytics.applicationTimeline?.[timelinePeriod] || [];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Total Applications
              <TooltipHelper content={tooltipContent.totalApplications} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{analytics.totalApplications || 0}</p>
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <BarChartIcon className={`h-6 w-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
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
      
      {/* Job Search Level */}
      {analytics.jobSearchStats && (
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              Job Search Level
              <TooltipHelper content={tooltipContent.jobSearchLevel} />
            </CardTitle>
            <CardDescription>
              Your progress in the job search journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold ${isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-900'}`}>
                {analytics.jobSearchStats.level || 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Level Progress</span>
                  <span className="text-sm font-medium">{analytics.jobSearchStats.progress?.toFixed(0) || 0}%</span>
                </div>
                <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-2 rounded-full bg-blue-500" 
                    style={{ width: `${analytics.jobSearchStats.progress || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
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
      
      {/* Main Charts */}
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
              <div className="mb-4 flex justify-end">
                <Select value={timelinePeriod} onValueChange={setTimelinePeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timelineData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name="Daily Applications" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalCount" 
                      name="Cumulative Applications" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
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
      
      {/* Achievements */}
      {analytics.achievements && analytics.achievements.length > 0 && (
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                Achievements
                <TooltipHelper content={tooltipContent.achievements} />
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAchievementRulesPanelOpen(true)}
                className="flex items-center gap-1"
              >
                <InfoIcon className="h-4 w-4" />
                View Rules
              </Button>
            </div>
            <CardDescription>
              Track your job search milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${achievement.unlocked 
                    ? (isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200') 
                    : (isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200')
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${achievement.unlocked 
                      ? (isDarkMode ? 'bg-green-900' : 'bg-green-100') 
                      : (isDarkMode ? 'bg-gray-600' : 'bg-gray-200')
                    }`}>
                      <Award className={`h-5 w-5 ${achievement.unlocked 
                        ? (isDarkMode ? 'text-green-300' : 'text-green-600') 
                        : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${achievement.unlocked 
                        ? (isDarkMode ? 'text-green-300' : 'text-green-700') 
                        : ''
                      }`}>
                        {achievement.name}
                        {achievement.unlocked && (
                          <Badge className="ml-2 bg-green-500 text-white">Unlocked</Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                      
                      <div className="mt-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs">{achievement.progress} / {achievement.total}</span>
                          <span className="text-xs">{Math.round((achievement.progress / achievement.total) * 100)}%</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div 
                            className={`h-1.5 rounded-full ${achievement.unlocked 
                              ? 'bg-green-500' 
                              : (isDarkMode ? 'bg-blue-500' : 'bg-blue-500')
                            }`} 
                            style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Weekly Challenges */}
      {analytics.weeklyChallenges && analytics.weeklyChallenges.length > 0 && (
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              Weekly Challenges
              <TooltipHelper content={tooltipContent.weeklyChallenges} />
            </CardTitle>
            <CardDescription>
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
                      <div className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                        <Rocket className={`h-5 w-5 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{challenge.name}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs">{challenge.progress} / {challenge.target}</span>
                        <span className="text-xs">Expires: {challenge.expires}</span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className="h-1.5 rounded-full bg-blue-500" 
                          style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                        ></div>
                      </div>
                      <div className="mt-3 text-xs text-right text-muted-foreground">
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
    </div>
  );
}
