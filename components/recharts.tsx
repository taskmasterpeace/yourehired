"use client"

import {
  ResponsiveContainer as RechartsResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell as RechartsCell,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  AreaChart as RechartsAreaChart,
  Area as RechartsArea
} from 'recharts';

// Re-export components
export const ResponsiveContainer = RechartsResponsiveContainer;
export const PieChart = RechartsPieChart;
export const Pie = RechartsPie;
export const Cell = RechartsCell;
export const BarChart = RechartsBarChart;
export const Bar = RechartsBar;
export const XAxis = RechartsXAxis;
export const YAxis = RechartsYAxis;
export const CartesianGrid = RechartsCartesianGrid;
export const Tooltip = RechartsTooltip;
export const Legend = RechartsLegend;
export const LineChart = RechartsLineChart;
export const Line = RechartsLine;
export const AreaChart = RechartsAreaChart;
export const Area = RechartsArea;

// Define color constants
export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const STATUS_COLORS = {
  "Bookmarked": "#9333ea",
  "Interested": "#3b82f6",
  "Recruiter Contact": "#06b6d4",
  "Networking": "#0ea5e9",
  "Preparing Application": "#10b981",
  "Applied": "#22c55e",
  "Application Acknowledged": "#84cc16",
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
  "Following Up": "#8b5cf6",
  "Waiting": "#a855f7"
};
