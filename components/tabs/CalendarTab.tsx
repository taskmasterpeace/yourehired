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
}

export function CalendarTab({
  events,
  opportunities,
  isDarkMode,
  user,
  dispatch
}: CalendarTabProps) {
  console.log("RENDERING: CalendarTab with events:", events.length);
  
  // Make sure we're only rendering calendar-related content
  return (
    <div className={`calendar-tab ${isDarkMode ? 'dark-mode' : ''}`}>
      <CalendarView 
        events={events}
        opportunities={opportunities}
        user={user}
        dispatch={dispatch}
      />
    </div>
  );
}
