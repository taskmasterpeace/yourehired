import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Award, Users, TrendingUp, Calendar } from "lucide-react";

interface GamificationAnalyticsProps {
  analytics: {
    achievementStats: {
      totalUnlocked: number;
      byCategory: { name: string; value: number }[];
      byRarity: { name: string; value: number }[];
      mostPopular: { name: string; count: number }[];
      leastPopular: { name: string; count: number }[];
    };
    userStats: {
      totalUsers: number;
      activeUsers: number;
      averageLevel: number;
      levelDistribution: { level: number; count: number }[];
      engagementTrend: { date: string; users: number }[];
    };
    timeStats: {
      averageTimeToLevel2: number;
      averageTimeToFirstAchievement: number;
      achievementUnlocksByDay: { day: string; count: number }[];
      achievementUnlocksByHour: { hour: string; count: number }[];
    };
  };
  isDarkMode: boolean;
}

export function GamificationAnalytics({
  analytics,
  isDarkMode
}: GamificationAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30days');
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gamification Analytics</h2>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Total Achievements Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{analytics.achievementStats.totalUnlocked}</p>
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <Award className={`h-6 w-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{analytics.userStats.activeUsers}</p>
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                <Users className={`h-6 w-6 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round((analytics.userStats.activeUsers / analytics.userStats.totalUsers) * 100)}% of total users
            </p>
          </CardContent>
        </Card>
        
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Average User Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{analytics.userStats.averageLevel.toFixed(1)}</p>
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <TrendingUp className={`h-6 w-6 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Avg. Time to Level 2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{analytics.timeStats.averageTimeToLevel2} days</p>
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-amber-900' : 'bg-amber-100'}`}>
                <Calendar className={`h-6 w-6 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Charts */}
      <Tabs defaultValue="achievements" className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Gamification Metrics</CardTitle>
              <TabsList>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="timing">Timing</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription>
              Detailed analytics on achievement unlocks and user engagement
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="achievements" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Achievements by Category</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.achievementStats.byCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {analytics.achievementStats.byCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Achievements by Rarity</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.achievementStats.byRarity}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Unlocks" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Most Popular Achievements</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.achievementStats.mostPopular}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 100,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Unlocks" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Least Popular Achievements</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.achievementStats.leastPopular}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 100,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Unlocks" fill="#FF8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">User Level Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.userStats.levelDistribution}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="level" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Users" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">User Engagement Trend</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analytics.userStats.engagementTrend}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="users" 
                          name="Active Users" 
                          stroke="#82ca9d" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="timing" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Achievement Unlocks by Day</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.timeStats.achievementUnlocksByDay}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Unlocks" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Achievement Unlocks by Hour</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.timeStats.achievementUnlocksByHour}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Unlocks" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
