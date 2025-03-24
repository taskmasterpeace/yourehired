"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

interface CalendarTabProps {
  events: any[];
  opportunities: any[];
  isDarkMode: boolean;
  user: any;
  dispatch: any;
  date?: Date;
  setDate?: (date: Date) => void;
  eventTypeFilter?: string;
  setEventTypeFilter?: (filter: string) => void;
}

export function CalendarTab({
  events,
  opportunities,
  isDarkMode,
  user,
  dispatch,
  date,
  setDate,
  eventTypeFilter,
  setEventTypeFilter
}: CalendarTabProps) {
  return (
    <div className="space-y-6">
      <Card className={`${isDarkMode ? 'dark-mode' : ''} shadow-md`}>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Calendar Implementation Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Coming Soon</AlertTitle>
            <AlertDescription>
              The calendar functionality is being redesigned. This documentation serves as a guide for future implementation.
            </AlertDescription>
          </Alert>
          
          <h3 className="text-lg font-semibold">Event Data Structure</h3>
          <pre className="p-2 rounded bg-slate-100 dark:bg-slate-800 overflow-x-auto">
{`interface CalendarEvent {
  id: number;
  title: string;
  date: string; // ISO format date string
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  type: 'interview' | 'deadline' | 'followup' | 'assessment';
  opportunityId?: number; // Link to job opportunity
  notes?: string;
  location?: string;
  allDay?: boolean;
}`}
          </pre>

          <h3 className="text-lg font-semibold">Required Features</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Month, week, and day view calendar</li>
            <li>Create, edit, and delete events</li>
            <li>Event filtering by type</li>
            <li>Color-coding based on event type</li>
            <li>Link events to job opportunities</li>
            <li>Mobile-responsive interface</li>
            <li>Dark/light mode support</li>
          </ul>

          <h3 className="text-lg font-semibold">Recommended Libraries</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>FullCalendar</strong> - Comprehensive calendar solution with all required views</li>
            <li><strong>React Big Calendar</strong> - Simpler alternative with good React integration</li>
            <li><strong>date-fns</strong> - For consistent date manipulation</li>
          </ul>

          <h3 className="text-lg font-semibold">API Requirements</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Add event: <code>{"dispatch({ type: 'ADD_EVENT', payload: eventData })"}</code></li>
            <li>Update event: <code>{"dispatch({ type: 'UPDATE_EVENT', payload: { id, updates } })"}</code></li>
            <li>Delete event: <code>{"dispatch({ type: 'DELETE_EVENT', payload: eventId })"}</code></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
