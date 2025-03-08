import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  // Convert status counts to chart data
  const statusData = Object.entries(analytics.statusCounts || {}).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-6">
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>Application Overview</CardTitle>
          <CardDescription>
            Summary of your job application progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-500 dark:text-blue-300">Total Applications</h3>
              <p className="text-2xl font-bold">{analytics.totalApplications || 0}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-500 dark:text-green-300">Response Rate</h3>
              <p className="text-2xl font-bold">{analytics.responseRate || 0}%</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-500 dark:text-purple-300">Interview Rate</h3>
              <p className="text-2xl font-bold">{analytics.interviewRate || 0}%</p>
            </div>
          </div>
          
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
    </div>
  );
}
