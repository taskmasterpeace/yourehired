import React from 'react';
import * as RechartsOriginal from 'recharts';

// Color schemes for charts
export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];
export const STATUS_COLORS = {
  "Bookmarked": "#9333ea",
  "Interested": "#3b82f6",
  "Recruiter Contact": "#06b6d4",
  "Networking": "#0ea5e9",
  "Preparing Application": "#10b981",
  "Applied": "#84cc16",
  "Application Acknowledged": "#65a30d",
  "Screening": "#eab308",
  "Technical Assessment": "#f59e0b",
  "First Interview": "#f97316",
  "Second Interview": "#ef4444",
  "Final Interview": "#dc2626",
  "Reference Check": "#9f1239",
  "Negotiating": "#7c3aed",
  "Offer Received": "#6366f1",
  "Offer Accepted": "#14b8a6",
  "Offer Declined": "#f43f5e",
  "Rejected": "#64748b",
  "Withdrawn": "#94a3b8",
  "Position Filled": "#6b7280",
  "Position Cancelled": "#4b5563",
  "Following Up": "#0891b2",
  "Waiting": "#0284c7"
};

// Create wrapper components to avoid circular reference
export const BarChart: React.FC<any> = (props) => {
  return <RechartsOriginal.BarChart {...props} />;
};

export const Bar: React.FC<any> = (props) => {
  return <RechartsOriginal.Bar {...props} />;
};

export const PieChart: React.FC<any> = (props) => {
  return <RechartsOriginal.PieChart {...props} />;
};

export const Pie: React.FC<any> = (props) => {
  return <RechartsOriginal.Pie {...props} />;
};

export const Cell: React.FC<any> = (props) => {
  return <RechartsOriginal.Cell {...props} />;
};

export const LineChart: React.FC<any> = (props) => {
  return <RechartsOriginal.LineChart {...props} />;
};

export const Line: React.FC<any> = (props) => {
  return <RechartsOriginal.Line {...props} />;
};

export const AreaChart: React.FC<any> = (props) => {
  return <RechartsOriginal.AreaChart {...props} />;
};

export const Area: React.FC<any> = (props) => {
  return <RechartsOriginal.Area {...props} />;
};

export const XAxis: React.FC<any> = (props) => {
  return <RechartsOriginal.XAxis {...props} />;
};

export const YAxis: React.FC<any> = (props) => {
  return <RechartsOriginal.YAxis {...props} />;
};

export const CartesianGrid: React.FC<any> = (props) => {
  return <RechartsOriginal.CartesianGrid {...props} />;
};

export const Tooltip: React.FC<any> = (props) => {
  return <RechartsOriginal.Tooltip {...props} />;
};

export const Legend: React.FC<any> = (props) => {
  return <RechartsOriginal.Legend {...props} />;
};

export const ResponsiveContainer: React.FC<any> = (props) => {
  return <RechartsOriginal.ResponsiveContainer {...props} />;
};
