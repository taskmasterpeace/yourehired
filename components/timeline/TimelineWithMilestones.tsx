import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts';
import { Calendar, Award, MessageSquare, UserCheck, Star } from "lucide-react";

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

interface TimelineWithMilestonesProps {
  timelineData: {
    '7days': TimelineDataPoint[];
    '30days': TimelineDataPoint[];
    '90days': TimelineDataPoint[];
    'all': TimelineDataPoint[];
  };
  isDarkMode: boolean;
}

export function TimelineWithMilestones({
  timelineData,
  isDarkMode
}: TimelineWithMilestonesProps) {
  const [timelinePeriod, setTimelinePeriod] = useState('30days');
  const [showMilestones, setShowMilestones] = useState(true);
  const [showAchievements, setShowAchievements] = useState(true);
  
  // Get the current timeline data based on selected period
  const currentData = timelineData[timelinePeriod as keyof typeof timelineData] || [];
  
  // Extract all events from the timeline data
  const allEvents = currentData.reduce<TimelineEvent[]>((events, dataPoint) => {
    if (dataPoint.events) {
      return [...events, ...dataPoint.events];
    }
    return events;
  }, []);
  
  // Filter events based on user preferences
  const visibleEvents = allEvents.filter(event => {
    if (event.type === 'achievement' && !showAchievements) return false;
    return true;
  });
  
  // Custom tooltip component for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const dateEvents = dataPoint.events || [];
      
      return (
        <div className={`p-3 rounded-lg border shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className="font-medium">{label}</p>
          <p className="text-sm">Applications: {dataPoint.count}</p>
          <p className="text-sm">Total: {dataPoint.totalCount}</p>
          
          {dateEvents.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-medium mb-1">Events:</p>
              <div className="space-y-1">
                {dateEvents.map((event: TimelineEvent) => (
                  <div key={event.id} className="flex items-center gap-1 text-xs">
                    {React.cloneElement(event.icon as React.ReactElement, { 
                      className: 'h-3 w-3 mr-1'
                    })}
                    <span>{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  // Find significant milestones to highlight
  const milestones = allEvents.filter(event => 
    event.type === 'application' && event.title.includes('first') ||
    event.type === 'response' && event.title.includes('first') ||
    event.type === 'interview' && event.title.includes('first') ||
    event.type === 'offer'
  );
  
  // Find achievement events
  const achievements = allEvents.filter(event => event.type === 'achievement');

  return (
    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Application Timeline</CardTitle>
            <CardDescription>
              Track your job search journey with key milestones
            </CardDescription>
          </div>
          
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
        
        <div className="flex flex-wrap gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-milestones" 
              checked={showMilestones} 
              onCheckedChange={setShowMilestones}
            />
            <Label htmlFor="show-milestones">Show Milestones</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-achievements" 
              checked={showAchievements} 
              onCheckedChange={setShowAchievements}
            />
            <Label htmlFor="show-achievements">Show Achievements</Label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={currentData}
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
              <Tooltip content={<CustomTooltip />} />
              
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
              
              {/* Milestone reference lines */}
              {showMilestones && milestones.map(milestone => {
                const dataPoint = currentData.find(d => d.date === milestone.date);
                if (!dataPoint) return null;
                
                const index = currentData.indexOf(dataPoint);
                
                return (
                  <ReferenceLine 
                    key={milestone.id}
                    x={milestone.date}
                    stroke={milestone.type === 'offer' ? '#f97316' : '#3b82f6'}
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{
                      value: milestone.title,
                      position: 'insideTopRight',
                      fill: isDarkMode ? '#e2e8f0' : '#1e293b',
                      fontSize: 10
                    }}
                  />
                );
              })}
              
              {/* Achievement markers */}
              {showAchievements && achievements.map(achievement => {
                const dataPoint = currentData.find(d => d.date === achievement.date);
                if (!dataPoint) return null;
                
                return (
                  <ReferenceLine 
                    key={achievement.id}
                    x={achievement.date}
                    stroke="#eab308"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Event Legend */}
        {visibleEvents.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Timeline Events</h3>
            <div className="flex flex-wrap gap-2">
              {visibleEvents.map(event => (
                <Badge 
                  key={event.id} 
                  variant="outline" 
                  className={`flex items-center gap-1 ${
                    event.type === 'achievement' 
                      ? (isDarkMode ? 'bg-amber-900/30 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200')
                      : event.type === 'offer'
                      ? (isDarkMode ? 'bg-orange-900/30 text-orange-300 border-orange-800' : 'bg-orange-50 text-orange-700 border-orange-200')
                      : (isDarkMode ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200')
                  }`}
                >
                  {React.cloneElement(event.icon as React.ReactElement, { 
                    className: 'h-3 w-3 mr-1'
                  })}
                  <span className="truncate max-w-[150px]">{event.title}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
