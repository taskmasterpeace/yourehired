"use client"

import React from 'react';
import dynamic from 'next/dynamic';

console.log("LOADING COMPONENT: CalendarTab.tsx - VERSION 2");

// Use dynamic import to avoid SSR issues
const CalendarView = dynamic(
  () => import('../calendar/CalendarView'),
  { ssr: false }
);

interface CalendarTabProps {
  events: any[];
  opportunities: any[];
  isDarkMode: boolean;
  user: any;
  dispatch: any;
  // Remove any references to BigCalendarView props
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
  // Remove unused props
  date,
  setDate,
  eventTypeFilter,
  setEventTypeFilter
}: CalendarTabProps) {
  console.log("RENDERING: CalendarTab with events:", events.length);
  console.log("EXPLICITLY USING TUICalendarView via CalendarView");
  
  return (
    <div className={`calendar-tab ${isDarkMode ? 'dark-mode' : ''}`}>
      <CalendarView 
        events={events}
        opportunities={opportunities}
        user={user}
        dispatch={dispatch}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
